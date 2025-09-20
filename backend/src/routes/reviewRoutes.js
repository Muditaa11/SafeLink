import Review from "../models/Review.js";
import mongoose from "mongoose";
import express from "express";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/destination/:destinationId", authMiddleware, async (req, res) => {
    try {
    const { destinationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return res.status(400).json({ message: "Invalid destination ID format" });
    }
    const reviews = await Review.find({ destinationId: destinationId });
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews for destination:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;