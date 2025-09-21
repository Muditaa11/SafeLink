// routes/kyc.js
import express from "express";
import authMiddleware from "../../middleware/auth.js";
import KYC from "../../models/KYC.js";
import authAdmin from "../../middleware/admin.js";
import crypto from "crypto";
import PassCode from "../../models/PassCode.js";

const router = express.Router();

router.use(authAdmin);


// GET /kyc/pending - Fetch all pending KYC requests
router.get("/pending", async (req, res) => {
  console.log("Pending requests");
  try {
    // Pending = completed by user but not yet verified
    const pendingKycs = await KYC.find({
      kycCompleted: true,
      verified: false
    })
      .populate("user", "fullName email") // show linked user info (optional)
      .sort({ createdAt: -1 }); // newest first

    return res.status(200).json({
      success: true,
      count: pendingKycs.length,
      data: pendingKycs
    });
  } catch (err) {
    console.error("Error fetching pending KYC requests:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});


// PUT /kyc/:id/verify - Verify or reject a KYC request
router.put("/:id/verify", async (req, res) => {
  try {
    const { status } = req.body; // expected: "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed values: 'approved', 'rejected'."
      });
    }

    // Find the KYC request
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) {
      return res.status(404).json({ message: "KYC record not found." });
    }

    if (status === "approved") {
      kyc.verified = true;
      kyc.verificationDate = new Date();
    } else {
      kyc.verified = false;
      kyc.kycCompleted = false; // rollback to incomplete if rejected
      kyc.rejectionReason = req.body.reason || "Not specified"; // optional field
    }

    await kyc.save();

    return res.status(200).json({
      success: true,
      message: `KYC has been ${status}.`,
      kycId: kyc._id
    });
  } catch (err) {
    console.error("Error verifying KYC:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

export default router;