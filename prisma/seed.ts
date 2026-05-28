import "dotenv/config";

import { AccountNature } from "../lib/generated/prisma/client";
import { prisma } from "../lib/prisma";


async function main() {
  const company = await prisma.company.create({
    data: {
      name: "Smart Ledger Demo Company",
      gstNumber: "22AAAAA0000A1Z5",
      panNumber: "AAAAA0000A",
    },
  });

  console.log("Company created:", company.name);

  const financialYear = await prisma.financialYear.create({
    data: {
      companyId: company.id,
      name: "2026-2027",

      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
    },
  });

  const assets = await prisma.accountGroup.create({
    data: {
      companyId: company.id,
      name: "Assets",
      code: "ASSET",
      nature: AccountNature.ASSET,
    },
  });

  const liabilities = await prisma.accountGroup.create({
    data: {
      companyId: company.id,
      name: "Liabilities",
      code: "LIABILITY",
      nature: AccountNature.LIABILITY,
    },
  });

  const equity = await prisma.accountGroup.create({
    data: {
      companyId: company.id,
      name: "Equity",
      code: "EQUITY",
      nature: AccountNature.EQUITY,
    },
  });

  const revenue = await prisma.accountGroup.create({
    data: {
      companyId: company.id,
      name: "Revenue",
      code: "REVENUE",
      nature: AccountNature.REVENUE,
    },
  });

  const expenses = await prisma.accountGroup.create({
    data: {
      companyId: company.id,
      name: "Expenses",
      code: "EXPENSE",
      nature: AccountNature.EXPENSE,
    },
  });

  const currentAssets = await prisma.accountGroup.create({
    data: {
      companyId: company.id,
      name: "Current Assets",
      code: "CURRENT_ASSETS",

      nature: AccountNature.ASSET,

      parentId: assets.id,
    },
  });

  await prisma.account.createMany({
    data: [
      {
        companyId: company.id,
        groupId: currentAssets.id,

        code: "CASH",
        name: "Cash",

        isSystem: true,
      },

      {
        companyId: company.id,
        groupId: currentAssets.id,

        code: "BANK",
        name: "Bank",

        isSystem: true,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
