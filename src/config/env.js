require("dotenv").config();

const REQUIRED_STRING = [
  "MONGODB_URI",
  "JWT_SECRET",
  "NODE_ENV",
  "CORS_ORIGIN",
  "BODY_PARSER_LIMIT",
  "JWT_EXPIRES_IN",
];

const REQUIRED_INT = [
  "PORT",
  "MESSAGE_MAX_LENGTH",
  "AUTH_RATE_LIMIT_WINDOW_MS",
  "AUTH_RATE_LIMIT_MAX",
  "BCRYPT_SALT_ROUNDS",
  "PROPERTY_PAGINATION_DEFAULT",
  "PROPERTY_PAGINATION_MAX",
  "MESSAGE_PAGINATION_DEFAULT",
  "MESSAGE_PAGINATION_MAX",
  "PASSWORD_MIN_LENGTH",
];

function validateEnv() {
  const missing = [];
  for (const name of REQUIRED_STRING) {
    const v = process.env[name];
    if (v === undefined || v === "") missing.push(name);
  }
  for (const name of REQUIRED_INT) {
    const v = process.env[name];
    if (v === undefined || v === "") {
      missing.push(name);
      continue;
    }
    const n = Number.parseInt(v, 10);
    if (!Number.isFinite(n)) missing.push(`${name} (invalid integer)`);
  }

  if (missing.length > 0) {
    const msg = [
      "Missing or invalid environment variables:",
      ...missing.map((m) => `  - ${m}`),
      "",
      "On Render: Dashboard → your Web Service → Environment → add each key.",
      "Copy names and sample values from .env.example in the repo.",
    ].join("\n");
    throw new Error(msg);
  }
}

validateEnv();

function required(name) {
  const v = process.env[name];
  if (v === undefined || v === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function requiredInt(name) {
  const n = Number.parseInt(required(name), 10);
  if (!Number.isFinite(n)) {
    throw new Error(`Environment variable ${name} must be a valid integer`);
  }
  return n;
}

const MONGODB_URI = required("MONGODB_URI");
const PORT = requiredInt("PORT");
const JWT_SECRET = required("JWT_SECRET");
const NODE_ENV = required("NODE_ENV");
const CORS_ORIGIN = required("CORS_ORIGIN");

const BODY_PARSER_LIMIT = required("BODY_PARSER_LIMIT");
const MESSAGE_MAX_LENGTH = requiredInt("MESSAGE_MAX_LENGTH");
const AUTH_RATE_LIMIT_WINDOW_MS = requiredInt("AUTH_RATE_LIMIT_WINDOW_MS");
const AUTH_RATE_LIMIT_MAX = requiredInt("AUTH_RATE_LIMIT_MAX");
const BCRYPT_SALT_ROUNDS = requiredInt("BCRYPT_SALT_ROUNDS");
const JWT_EXPIRES_IN = required("JWT_EXPIRES_IN");
const PROPERTY_PAGINATION_DEFAULT = requiredInt("PROPERTY_PAGINATION_DEFAULT");
const PROPERTY_PAGINATION_MAX = requiredInt("PROPERTY_PAGINATION_MAX");
const MESSAGE_PAGINATION_DEFAULT = requiredInt("MESSAGE_PAGINATION_DEFAULT");
const MESSAGE_PAGINATION_MAX = requiredInt("MESSAGE_PAGINATION_MAX");
const PASSWORD_MIN_LENGTH = requiredInt("PASSWORD_MIN_LENGTH");

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
  BODY_PARSER_LIMIT,
  MESSAGE_MAX_LENGTH,
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX,
  BCRYPT_SALT_ROUNDS,
  JWT_EXPIRES_IN,
  PROPERTY_PAGINATION_DEFAULT,
  PROPERTY_PAGINATION_MAX,
  MESSAGE_PAGINATION_DEFAULT,
  MESSAGE_PAGINATION_MAX,
  PASSWORD_MIN_LENGTH,
  corsAllowedOrigins,
};
