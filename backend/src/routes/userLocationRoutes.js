import express from "express";
import UserLocation from '../models/userLocation.model.js';
import User from "../models/User.js"; 
import authMiddleware from '../middleware/auth.js'; // Your JWT authentication middleware

const router = express.Router();

/**
 * 📌 Get all users with their latest location
 * GET /api/location
 */
router.get("/", authMiddleware, async (req, res) => {
  console.log("Getting user location");
  try {
    const locations = await UserLocation.find()
      .populate("user", "name email") // ✅ populate with user info
      .select("user location updatedAt"); // only return needed fields

    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching all user locations:", error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const userLocation = await UserLocation.findOne({ user: userId })
      .populate("user", "name email")
      .select("user location updatedAt");

    if (!userLocation) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.status(200).json(userLocation);
  } catch (error) {
    console.error("Error fetching user location:", error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;