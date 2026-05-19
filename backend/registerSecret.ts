// import { registerEntitySecretCiphertext } from "@circle-fin/developer-controlled-wallets";

// const response = await registerEntitySecretCiphertext({
//   apiKey: process.env.CIRCLE_API_KEY ?? "",
//   entitySecret: process.env.CIRCLE_ENTITY_SECRET ?? "",
//   recoveryFileDownloadPath: "./recovery",
// });

// console.log(response.data?.recoveryFile);

import { registerEntitySecretCiphertext } from "@circle-fin/developer-controlled-wallets";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    console.error("Missing CIRCLE_API_KEY or ENTITY_SECRET in .env");
    process.exit(1);
  }

  console.log("Registering entity secret with Circle...");

  const response = await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
    recoveryFileDownloadPath: __dirname,
  });

  console.log("Entity secret registered successfully.");
  console.log(
    "Recovery file content:",
    response.data?.recoveryFile ?? "Not available",
  );
  console.log(`Recovery file saved to: ${__dirname}/recovery_file_*.dat`);
}

main().catch((err) => {
  console.error("Registration failed:", err);
  process.exit(1);
});
