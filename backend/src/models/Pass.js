// models/Pass.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const passSchema = new Schema({
  passID: { type: String, required: true, unique: true },
  userRef: { type: Types.ObjectId, ref: "User", required: true },
  destinationRef: { type: Types.ObjectId, ref: "Destination", required: true },
  bandID: { type: String, default: null },
  issuedAt: { type: Date, default: Date.now },
});

const Pass = model("Pass", passSchema);
export default Pass;