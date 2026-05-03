require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pgfinder";
const PORT = Number(process.env.PORT) || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const NODE_ENV = process.env.NODE_ENV || "development";

/** Comma-separated origins, or "*" for any */
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

function corsAllowedOrigins() {
  if (CORS_ORIGIN === "*") return true;
  return CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
}

module.exports = {
  MONGODB_URI,
  PORT,
  JWT_SECRET,
  NODE_ENV,
  CORS_ORIGIN,
  corsAllowedOrigins,
};
