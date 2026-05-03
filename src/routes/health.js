const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (_req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  const payload = {
    ok: dbOk,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
  res.status(dbOk ? 200 : 503).json(payload);
});

module.exports = router;
