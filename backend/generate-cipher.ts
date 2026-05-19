import { generateEntitySecret, generateEntitySecretCiphertext } from "@circle-fin/developer-controlled-wallets";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    console.error("Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env");
    process.exit(1);
  }

  console.log("Raw entity secret (save this to .env):", entitySecret);
  console.log("Generating ciphertext for Circle Console...");

  const result = await generateEntitySecretCiphertext({ apiKey, entitySecret });
  const ciphertext = (result as any)?.data?.entitySecretCiphertext;
  
  if (ciphertext) {
    console.log("\nPaste this into Circle Console → Developer → Entity Secret:");
    console.log(ciphertext);
    console.log("\nLength:", ciphertext.length, "chars");
  } else {
    console.log("Result:", JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
