import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDirectory, "../../");

dotenv.config({ path: path.join(backendRoot, ".env") });

const readRequired = (key: string) => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const readOptional = (key: string) => process.env[key]?.trim() || "";
const readUrl = (key: string) => {
  const value = readRequired(key);

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`Environment variable ${key} must be a valid absolute URL.`);
  }
};

export const env = {
  nodeEnv: readOptional("NODE_ENV") || "development",
  port: Number(readOptional("PORT") || 4000),
  mongodbUri: readRequired("MONGODB_URI"),
  iciciMerchantId: readRequired("ICICI_MERCHANT_ID"),
  iciciAggregatorId: readRequired("ICICI_AGGREGATOR_ID"),
  iciciSecretKey: readRequired("ICICI_SECRET_KEY"),
  iciciReturnUrl: readUrl("ICICI_RETURN_URL"),
  frontendBaseUrl: readUrl("FRONTEND_BASE_URL"),
  iciciInitiateSaleUrl:
    readOptional("ICICI_INITIATE_SALE_URL") ||
    "https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale",
  iciciStatusUrl:
    readOptional("ICICI_STATUS_URL") ||
    "https://pgpayuat.icicibank.com/tsp/pg/api/command",
};
