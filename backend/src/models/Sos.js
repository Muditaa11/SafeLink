import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    status: { type: String, enum: ["active", "resolved"], default: "active" },

    // ✅ Tracking resolution
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

sosSchema.index({ location: "2dsphere" });

const SOS = mongoose.model("SOS", sosSchema);
export default SOS;
