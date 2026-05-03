const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const Property = require("../models/Property");
const { protect } = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const asyncHandler = require("../middleware/asyncHandler");
const {
  buildPropertyFilter,
  parsePagination,
} = require("../utils/propertyQuery");
const {
  PROPERTY_PAGINATION_DEFAULT,
  PROPERTY_PAGINATION_MAX,
} = require("../config/env");

const propertyPaginationOpts = {
  defaultLimit: PROPERTY_PAGINATION_DEFAULT,
  maxLimit: PROPERTY_PAGINATION_MAX,
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

function canManageProperty(user, property) {
  const ownerId = property.ownerId._id
    ? property.ownerId._id.toString()
    : property.ownerId.toString();
  return user.role === "admin" || ownerId === user._id.toString();
}

function canViewProperty(user, property) {
  if (property.active) return true;
  if (!user) return false;
  if (user.role === "admin") return true;
  const ownerId = property.ownerId._id
    ? property.ownerId._id.toString()
    : property.ownerId.toString();
  return ownerId === user._id.toString();
}

router.get(
  "/",
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: PROPERTY_PAGINATION_MAX }),
  query("minPrice").optional().isNumeric(),
  query("maxPrice").optional().isNumeric(),
  validate,
  asyncHandler(async (req, res) => {
    const filter = buildPropertyFilter(req.query);
    const { page, limit, skip } = parsePagination(req.query, propertyPaginationOpts);

    const [items, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("ownerId", "name email"),
      Property.countDocuments(filter),
    ]);

    res.json({
      data: items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  })
);

router.get(
  "/user/mine",
  protect,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: PROPERTY_PAGINATION_MAX }),
  validate,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, propertyPaginationOpts);
    const filter = { ownerId: req.user._id };

    const [items, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("ownerId", "name email"),
      Property.countDocuments(filter),
    ]);

    res.json({
      data: items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  })
);

router.get(
  "/:id",
  optionalAuth,
  param("id").isMongoId(),
  validate,
  asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id).populate(
      "ownerId",
      "name email"
    );
    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }
    if (!canViewProperty(req.user, property)) {
      res.status(404).json({ message: "Property not found" });
      return;
    }
    res.json(property);
  })
);

router.post(
  "/",
  protect,
  body("title").trim().notEmpty(),
  body("location").trim().notEmpty(),
  body("price").isFloat({ min: 0 }),
  body("gender").optional().trim(),
  body("description").optional().trim(),
  validate,
  asyncHandler(async (req, res) => {
    const property = await Property.create({
      title: req.body.title,
      location: req.body.location,
      price: req.body.price,
      gender: req.body.gender,
      description: req.body.description ?? "",
      ownerId: req.user._id,
    });
    const populated = await property.populate("ownerId", "name email");
    res.status(201).json(populated);
  })
);

router.patch(
  "/:id",
  protect,
  param("id").isMongoId(),
  body("title").optional().trim().notEmpty(),
  body("location").optional().trim().notEmpty(),
  body("price").optional().isFloat({ min: 0 }),
  body("gender").optional().trim(),
  body("description").optional().trim(),
  body("active").optional().isBoolean(),
  validate,
  asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }
    if (!canManageProperty(req.user, property)) {
      res.status(403).json({ message: "Not allowed to edit this listing" });
      return;
    }

    const allowed = ["title", "location", "price", "gender", "description", "active"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) property[key] = req.body[key];
    }
    await property.save();
    const populated = await property.populate("ownerId", "name email");
    res.json(populated);
  })
);

router.delete(
  "/:id",
  protect,
  param("id").isMongoId(),
  validate,
  asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }
    if (!canManageProperty(req.user, property)) {
      res.status(403).json({ message: "Not allowed to delete this listing" });
      return;
    }
    await property.deleteOne();
    res.status(204).send();
  })
);

module.exports = router;
