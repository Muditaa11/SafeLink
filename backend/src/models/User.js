// models/User.js (Single Schema Approach)
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    // --- Registration Fields ---
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    
    // Add a flag to track completion
    isProfileComplete: { type: Boolean, default: false },

    // --- Profile Fields (now optional on creation) ---
    gender: { type: String },
    dob: { type: Date },
    nationality: { type: String },
    passportNumber: { type: String },
    phone: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
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
    images: [{ type: String }], 
    isVerified: { type: Boolean, default: false },
    uniqueId: { type: String, unique: true },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;