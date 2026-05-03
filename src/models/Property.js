const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    gender: { type: String, trim: true },
    description: { type: String, default: "" },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

propertySchema.index({ location: 1, price: 1 });
propertySchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("Property", propertySchema);
