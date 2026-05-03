const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { corsAllowedOrigins, CORS_ORIGIN, NODE_ENV } = require("./config/env");
const errorHandler = require("./middleware/errorHandler");

const app = express();
if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors(
    CORS_ORIGIN === "*"
      ? { origin: true }
      : { origin: corsAllowedOrigins() }
  )
);
app.use(express.json({ limit: "1mb" }));

app.use("/health", require("./routes/health"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/property", require("./routes/property"));
app.use("/api/messages", require("./routes/messages"));

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

module.exports = app;
