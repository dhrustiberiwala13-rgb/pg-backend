const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const {
  JWT_SECRET,
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX,
  BCRYPT_SALT_ROUNDS,
  JWT_EXPIRES_IN,
  PASSWORD_MIN_LENGTH,
} = require("../config/env");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, try again later" },
});

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: "Validation failed", errors: errors.array() });
    return;
  }
  next();
}

router.post(
  "/register",
  authLimiter,
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
  validate,
  asyncHandler(async (req, res) => {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }
    const hashed = await bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashed,
    });
    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.status(201).json({ token, user: user.toJSON() });
  })
);

router.post(
  "/login",
  authLimiter,
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    const safe = user.toJSON();
    delete safe.password;
    res.json({ token, user: safe });
  })
);

router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json(req.user.toJSON());
  })
);

module.exports = router;
