import { prisma } from "@/lib/prisma";

import { EntryType } from "@/lib/generated/prisma/client";

import { PostJournalEntryInput } from "./types";

function validateJournalEntry(input: PostJournalEntryInput) {
  if (input.lines.length < 2) {
    throw new Error("Journal entry must contain at least 2 lines");
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of input.lines) {
    if (line.amount <= 0) {
      throw new Error("Line amount must be greater than zero");
    }

    if (line.type === EntryType.DEBIT) {
      totalDebit += line.amount;
    }

    if (line.type === EntryType.CREDIT) {
      totalCredit += line.amount;
    }
  }

  if (totalDebit !== totalCredit) {
    throw new Error(
      `Journal entry is not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`,
    );
  }

  return {
    totalDebit,
    totalCredit,
  };
}

async function generateVoucherNumber() {
  const count = await prisma.journalEntry.count();

  const nextNumber = count + 1;

  return `JV-2026-${String(nextNumber).padStart(4, "0")}`;
}

export async function postJournalEntry(input: PostJournalEntryInput) {
  const { totalDebit, totalCredit } = validateJournalEntry(input);

  const voucherNumber = await generateVoucherNumber();

  return await prisma.$transaction(async (tx) => {
    const journalEntry = await tx.journalEntry.create({
      data: {
        companyId: input.companyId,

        voucherNumber,

        date: new Date(),

        narration: input.narration,

        reference: input.reference,

        totalDebit,

        totalCredit,

        status: "POSTED",
      },
    });

    for (const line of input.lines) {
      const account = await tx.account.findFirst({
        where: {
          companyId: input.companyId,

          code: line.accountCode,
        },
      });

      if (!account) {
        throw new Error(`Account not found: ${line.accountCode}`);
      }

      await tx.journalEntryLine.create({
        data: {
          journalEntryId: journalEntry.id,

          accountId: account.id,

          entryType: line.type,

          amount: line.amount,

          description: line.description,
        },
      });
    }

    return journalEntry;
  });
}

// ========== TEST FUNCTIONS ==========
// TEST: VALIDATION
export async function testValidation() {
  const result = validateJournalEntry({
    companyId: "test-company",

    narration: "Test Journal",

    lines: [
      {
        accountCode: "CASH",
        type: EntryType.DEBIT,
        amount: 1000,
      },

      {
        accountCode: "SALES",
        type: EntryType.CREDIT,
        amount: 1000,
      },
    ],
  });

  console.log(result);
}

// TEST: SUCCESSFUL POSTING
export async function testPosting() {
  const company = await prisma.company.findFirst();

  if (!company) {
    throw new Error("Company not found");
  }

  const result = await postJournalEntry({
    companyId: company.id,

    narration: "Cash Sale",

    lines: [
      {
        accountCode: "CASH",

        type: EntryType.DEBIT,

        amount: 1000,
      },

      {
        accountCode: "BANK",

        type: EntryType.CREDIT,

        amount: 1000,
      },
    ],
  });

  console.log(result);
}

// TEST: UNBALANCED AMOUNT
export async function testUnbalancedValidation() {
  try {
    validateJournalEntry({
      companyId: "test-company",

      narration: "Invalid Entry",

      lines: [
        {
          accountCode: "CASH",

          type: EntryType.DEBIT,

          amount: 1000,
        },

        {
          accountCode: "BANK",

          type: EntryType.CREDIT,

          amount: 500,
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
}

// TEST: NEGATIVE AMOUNT
export async function testNegativeAmountValidation() {
  try {
    validateJournalEntry({
      companyId: "test-company",

      narration: "Negative Amount",

      lines: [
        {
          accountCode: "CASH",

          type: EntryType.DEBIT,

          amount: -1000,
        },

        {
          accountCode: "BANK",

          type: EntryType.CREDIT,

          amount: -1000,
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
}

// TEST: SINGLE LINE
export async function testSingleLineValidation() {
  try {
    validateJournalEntry({
      companyId: "test-company",

      narration: "Single Line",

      lines: [
        {
          accountCode: "CASH",

          type: EntryType.DEBIT,

          amount: 1000,
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
}
