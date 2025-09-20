// routes/kyc.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import KYC from "../models/KYC.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.use(authMiddleware);

const publicKey = "public_sBeTUn9jMO+d/k/UGDbKnEbq93I=";
const privateKey = "private_/WkrRQfzobW+Mw+MolVx/1p+/P4=";


// POST /kyc - Save or update KYC details
router.post("/", async (req, res) => {
  console.log("KYC Request");
  try {
    const { fullName, dob, gender, address } = req.body;

    // Basic validation
    if (!fullName || !dob || !gender) {
      return res.status(400).json({ message: "Full Name, DOB, and Gender are required." });
    }

    // Either update existing KYC or create a new one
    const kyc = await KYC.findOneAndUpdate(
      { user: req.user._id }, // match by user
      {
        fullName,
        dob,
        gender,
        address,
        verified: false, // reset verified every time
      },
      {
        new: true, // return the updated doc
        upsert: true, // create if not exists
        setDefaultsOnInsert: true,
      }
    );

    // Generate image uploading token
    const now = Math.floor(Date.now() / 1000); // epoch seconds

    const uploadPayload = {
      fileName: `${req.user._id}.jpg`,
      useUniqueFileName: "false",
      overwriteFile: "true"
    };

    const token = jwt.sign(uploadPayload, privateKey, {
      expiresIn: 3600,
      header: {
        alg: "HS256",
        typ: "JWT",
        kid: publicKey,
      },
    });

    return res.status(201).json({
      success: true,
      imgToken: token,
      kycId: kyc._id,
    });
  } catch (err) {
    console.error("KYC submission error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

const allowedProofTypes = ["aadhar", "pan", "passport", "DL", "voterid"];



// PUT /kyc/proof - update proofType, set kycCompleted and return image tokens
router.put("/proof", async (req, res) => {
  try {
    const { proofType } = req.body;
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!proofType) {
      return res.status(400).json({ message: "proofType is required." });
    }

    // Fallback allowedProofTypes (replace with your app's set if defined elsewhere)
    const allowedProofTypes = [
      "aadhar",
      "pan",
      "passport",
      "DL",
      "voter_id",
      "other",
    ];

    if (!allowedProofTypes.includes(proofType.toLowerCase())) {
      return res.status(400).json({
        message: `Invalid proofType. Allowed values: ${allowedProofTypes.join(", ")}`,
      });
    }

    // Find existing KYC or create a new one
    let kyc = await KYC.findOne({ user: userId });

    if (!kyc) {
      kyc = new KYC({
        user: userId,
        proofType: proofType.toLowerCase(),
        verified: false,
        kycCompleted: true,
      });
    } else {
      kyc.proofType = proofType.toLowerCase();
      kyc.verified = false;      // change invalidates prior verification
      kyc.kycCompleted = true;   // mark completed
      kyc.proofRequestedAt = new Date(); // optional audit field
    }

    await kyc.save();

    // Generate image upload tokens (front & back)
    // Adjust payload keys to match whatever your upload service expects.
    const frontPayload = {
      fileName: `${userId}_front.jpg`,
      useUniqueFileName: "false",
      overwriteFile: "true",
    };

    const backPayload = {
      fileName: `${userId}_back.jpg`,
      useUniqueFileName: "false",
      overwriteFile: "true",
    };

    // Sign tokens (assumes privateKey/publicKey are available in scope)
    const frontToken = jwt.sign(frontPayload, privateKey, {
      expiresIn: 3600,
      header: { alg: "HS256", typ: "JWT", kid: publicKey },
    });

    const backToken = jwt.sign(backPayload, privateKey, {
      expiresIn: 3600,
      header: { alg: "HS256", typ: "JWT", kid: publicKey },
    });

    return res.status(200).json({
      success: true,
      message: "Proof type set and tokens generated.",
      kycId: kyc._id,
      kycCompleted: kyc.kycCompleted,
      frontToken,
      backToken,
    });
  } catch (err) {
    console.error("Error updating proofType and generating tokens:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/", async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id });
    if (!kyc) {
      return res.status(404).json({ message: "KYC details not found." });
    }
    return res.status(200).json(kyc);
  } catch (err) { 
    console.error("Error fetching KYC details:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});
export default router;
