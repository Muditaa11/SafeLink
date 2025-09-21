// routes/kyc.js
import express from "express";
import authMiddleware from "../../middleware/auth.js";
import KYC from "../../models/KYC.js";
import authAdmin from "../../middleware/admin.js";
import crypto from "crypto";
import PassCode from "../../models/PassCode.js";
import NewPassRequest from "../../models/NewPassRequest.js";
import Pass from "../../models/Pass.js";

const router = express.Router();

router.use(authAdmin);

// utils/generateCode.js
export function generateCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

router.post("/generate", async (req, res) => {
    try {
        const { adminId, destinationId } = req;

        if (!adminId || !destinationId)
            return res.status(400).json({ error: "Admin or destination information missing" });

        // Generate 8-character random hex pass code
        const passID = crypto.randomBytes(4).toString("hex").toUpperCase();

        // Store pass code in database with creator and destination
        const newPassCode = await PassCode.create({
            passID,
            createdBy: adminId,
            destinationRef: destinationId,
        });

        return res.json({
            message: "Pass code generated successfully",
            passID: newPassCode.passID,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

router.get("/passrequest/:passID", async (req, res) => {
    try {
        const { passID } = req.params;
        console.log(`Checking pass with ID: ${passID}`);

        // Find pass request by passID
        const request = await NewPassRequest.findOne({ passID })
            .populate("userRef", "fullName email uniqueId")          // Fetch user details
            .populate("destinationRef", "name state location");      // Fetch destination details

        if (!request) {
            return res.status(404).json({ exists: false, message: "No pass request found" });
        }

        return res.json({
            exists: true,
            request,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

router.post("/passrequest/:passID/process", async (req, res) => {
    try {
      const { passID } = req.params;
      const { action, bandID } = req.body;
  
      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'reject'" });
      }
  
      // Find the pass request
      const request = await NewPassRequest.findOne({ passID });
      if (!request) return res.status(404).json({ error: "Pass request not found" });
  
      if (request.status !== "pending") {
        return res.status(400).json({ error: `Request already ${request.status}` });
      }
  
      if (action === "approve") {
        // Create a new Pass document
        const newPass = await Pass.create({
          passID: request.passID,
          userRef: request.userRef,
          destinationRef: request.destinationRef,
          bandID: bandID || null,
          issuedAt: new Date(),
        });
  
        // Delete the request from NewPassRequest
        await NewPassRequest.deleteOne({ _id: request._id });
  
        return res.json({
          message: "Pass request approved and pass issued successfully",
          pass: newPass,
        });
      } else {
        // Reject: update status and processedAt
        request.status = "rejected";
        request.processedAt = new Date();
        await request.save();
  
        return res.json({
          message: "Pass request rejected successfully",
          request,
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  });


export default router;