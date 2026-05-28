import { EntryType } from "@/lib/generated/prisma/client";

export type JournalLineInput = {
  accountCode: string;

  type: EntryType;

  amount: number;

  description?: string;
};

export type PostJournalEntryInput = {
  companyId: string;

  narration?: string;

  reference?: string;

  lines: JournalLineInput[];
};
