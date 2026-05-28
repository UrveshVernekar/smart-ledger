import "dotenv/config";

import {
  testValidation,
  testPosting,
  testUnbalancedValidation,
  testNegativeAmountValidation,
  testSingleLineValidation,
} from "@/modules/accounting/journals/journal.service";

async function main() {
  //   await testValidation();
  await testPosting();
  //   await testUnbalancedValidation();
  //   await testNegativeAmountValidation();
  //   await testSingleLineValidation();
}

main()
  .then(() => {
    console.log("Test completed");
  })
  .catch((e) => {
    console.error(e);

    process.exit(1);
  });
