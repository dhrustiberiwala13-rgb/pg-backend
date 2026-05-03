const express = require("express");
const { query, validationResult } = require("express-validator");
const Message = require("../models/Message");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { parsePagination } = require("../utils/propertyQuery");
const {
  MESSAGE_PAGINATION_DEFAULT,
  MESSAGE_PAGINATION_MAX,
} = require("../config/env");

const messagePaginationOpts = {
  defaultLimit: MESSAGE_PAGINATION_DEFAULT,
  maxLimit: MESSAGE_PAGINATION_MAX,
};

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: "Validation failed", errors: errors.array() });
    return;
  }
  next();
}

router.get(
  "/",
  protect,
  query("with")
    .notEmpty()
    .withMessage('Query "with" (other user id) is required')
    .isMongoId()
    .withMessage("Invalid partner user id"),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: MESSAGE_PAGINATION_MAX }),
  validate,
  asyncHandler(async (req, res) => {
    const partnerId = req.query.with;
    const me = req.user._id;
    const { page, limit, skip } = parsePagination(req.query, messagePaginationOpts);

    const filter = {
      $or: [
        { senderId: me, receiverId: partnerId },
        { senderId: partnerId, receiverId: me },
      ],
    };

    const [items, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId receiverId", "name email"),
      Message.countDocuments(filter),
    ]);

    res.json({
      data: items.reverse(),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  })
);

module.exports = router;
