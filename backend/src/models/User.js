import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    nationality: { type: String, required: true },
    passportNumber: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
    },
    reasonForVisit: { type: String },
    friendInIndia: {
      name: { type: String },
      contact: { type: String },
    },
    healthInfo: {
      allergies: { type: String },
      conditions: { type: String },
    },
    preferredLanguage: { type: String },

    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
