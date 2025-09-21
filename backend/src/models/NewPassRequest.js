import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const newPassRequestSchema = new Schema({
  passID: { type: String, required: true },                   
  userRef: { type: Types.ObjectId, ref: "User", required: true },
  destinationRef: { type: Types.ObjectId, ref: "Destination", required: true },
  bandID: { type: String, default: null },                     // Optional, set by admin
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },                                  // Filled when admin approves/rejects
});

const NewPassRequest = model("NewPassRequest", newPassRequestSchema);
export default NewPassRequest;