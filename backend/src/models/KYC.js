import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true, // one KYC per user
      required: true,
    },
    fullName: { type: String, required: true },
    dob: { type: String, required: true }, // can be Date if you want strict typing
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    address: { type: String },

    verified: {
      type: Boolean,
      default: false,
    },

    // ✅ new field
    kycCompleted: {
      type: Boolean,
      default: false, // false until all steps (including photo upload) are done
    },
  },
  { timestamps: true }
);

export default mongoose.model("KYC", kycSchema);