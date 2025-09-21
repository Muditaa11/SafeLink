import mongoose from "mongoose";

const { Schema, model, Types } = mongoose; // <-- added Types

const passCodeSchema = new Schema({
    passID: { type: String, required: true, unique: true },
    createdBy: { type: Types.ObjectId, ref: "Admin", required: true }, // Admin ID
    destinationRef: { type: Types.ObjectId, ref: "Destination", required: true },
    createdAt: { type: Date, default: Date.now },
});

const PassCode = model("PassCode", passCodeSchema);
export default PassCode;
