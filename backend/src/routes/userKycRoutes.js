import express from "express";
import KYC from "../models/KYC.js"; // adjust path if needed
import authMiddleware from "../middleware/auth.js"; // if you have auth middleware

const router = express.Router();

/**
 * @route   GET /api/kyc/status/:userId
 * @desc    Check if user's KYC is completed
 * @access  Private
 */
router.get("/status/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const kyc = await KYC.findOne({ user: userId });

    if (!kyc) {
      return res.json({ kycCompleted: false, message: "KYC not found" });
    }

    res.json({
      kycCompleted: kyc.kycCompleted,
      verified: kyc.verified,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/kyc
 * @desc    Create or update KYC
 * @access  Private
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { userId, fullName, dob, gender, address } = req.body;

    let kyc = await KYC.findOne({ user: userId });

    if (kyc) {
      // update existing KYC
      kyc.fullName = fullName || kyc.fullName;
      kyc.dob = dob || kyc.dob;
      kyc.gender = gender || kyc.gender;
      kyc.address = address || kyc.address;

      await kyc.save();
    } else {
      // create new KYC
      kyc = await KYC.create({
        user: userId,
        fullName,
        dob,
        gender,
        address,
      });
    }

    res.json(kyc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/kyc/complete/:userId
 * @desc    Mark KYC as completed
 * @access  Private
 */
router.patch("/complete/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const kyc = await KYC.findOneAndUpdate(
      { user: userId },
      { kycCompleted: true },
      { new: true }
    );

    if (!kyc) {
      return res.status(404).json({ message: "KYC not found" });
    }

    res.json({ message: "KYC marked as completed", kyc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/kyc/verify/:userId
 * @desc    Admin verifies the KYC
 * @access  Admin Only
 */
router.patch("/verify/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const kyc = await KYC.findOneAndUpdate(
      { user: userId },
      { verified: true },
      { new: true }
    );

    if (!kyc) {
      return res.status(404).json({ message: "KYC not found" });
    }

    res.json({ message: "KYC verified successfully", kyc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
