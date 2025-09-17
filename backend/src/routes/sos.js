import express from "express";
import SOS from "../models/Sos.js";
import { authMiddleware } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const router = express.Router();

/**
 * 📌 User sends SOS request
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body;
    const userId = req.user.id;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    // Save SOS in DB
    const sos = await SOS.create({
      user: userId,
      message: message || "Emergency! Please help.",
      location: { type: "Point", coordinates: [longitude, latitude] }
    });

    // 🚨 Notify authority by email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "aa11mudit@gmail.com",
      subject: "🚨 SOS Alert!",
      text: `User ${req.user.name} triggered SOS!\n\nMessage: ${message}\nLocation: ${mapLink}`
    });

    res.status(201).json({ success: true, sos });
  } catch (error) {
    console.error("Error in SOS route:", error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

/**
 * 📌 Get all active SOS requests (for authority dashboard)
 */
router.get("/active", authMiddleware, async (req, res) => {
  try {
    const sosList = await SOS.find({ status: "active" })
      .populate("user", "name email")
      .select("user message location createdAt");

    res.status(200).json(sosList);
  } catch (error) {
    console.error("Error fetching SOS:", error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});


/**
 * 📌 Resolve an SOS request
 * PUT /api/sos/:id/resolve
 */
router.put("/:id/resolve", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const authorityId = req.user.id; // whoever resolves it

    const sos = await SOS.findById(id);
    if (!sos) {
      return res.status(404).json({ error: "SOS not found" });
    }

    if (sos.status === "resolved") {
      return res.status(400).json({ error: "SOS already resolved" });
    }

    sos.status = "resolved";
    sos.resolvedBy = authorityId;
    sos.resolvedAt = new Date();

    await sos.save();

    res.status(200).json({ success: true, sos });
  } catch (error) {
    console.error("Error resolving SOS:", error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});


/**
 * 📌 Get all resolved SOS requests (history)
 * GET /api/sos/history
 */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const sosHistory = await SOS.find({ status: "resolved" })
      .populate("user", "name email")
      .populate("resolvedBy", "name email")
      .sort({ resolvedAt: -1 }); // latest first

    res.status(200).json(sosHistory);
  } catch (error) {
    console.error("Error fetching SOS history:", error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;

