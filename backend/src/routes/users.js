import express from "express";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";
import KYCRouter from "./kyc.js";
import PassCode from "../models/PassCode.js";
import NewPassRequest from "../models/NewPassRequest.js";
import Pass from "../models/Pass.js";

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user's data
// @access  Private
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // Use decoded id from token if middleware attaches decoded, not full user
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error });
  }
});

// @route   PUT /api/users/me/profile
// @desc    Update the current user's profile information
// @access  Private
router.put("/me/profile", authMiddleware, async (req, res) => {
  // Destructure all expected profile fields from the body
  const {
    gender,
    dob,
    nationality,
    passportNumber,
    phone,
    emergencyContact,
    reasonForVisit,
    friendInIndia,
    healthInfo,
    preferredLanguage,
  } = req.body;

  // Build the fields object to update
  const profileFields = {};
  if (gender) profileFields.gender = gender;
  if (dob) profileFields.dob = dob;
  if (nationality) profileFields.nationality = nationality;
  if (passportNumber) profileFields.passportNumber = passportNumber;
  if (phone) profileFields.phone = phone;
  if (emergencyContact) profileFields.emergencyContact = emergencyContact;
  if (reasonForVisit) profileFields.reasonForVisit = reasonForVisit;
  if (friendInIndia) profileFields.friendInIndia = friendInIndia;
  if (healthInfo) profileFields.healthInfo = healthInfo;
  if (preferredLanguage) profileFields.preferredLanguage = preferredLanguage;

  // Mark the profile as complete
  profileFields.isProfileComplete = true;

  try {
    // Find the user by ID and update their document
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: profileFields },
      { new: true, runValidators: true } // 'new: true' returns the updated document
    ).select("-password"); // Exclude password from the returned object

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;

router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { passID, userId } = req.body;

    // Check if pass code exists
    const passCode = await PassCode.findOne({ passID });
    if (!passCode) return res.status(404).json({ error: "Invalid pass code" });

    // Delete the pass code to prevent reuse
    await PassCode.deleteOne({ _id: passCode._id });

    // Create a new pass request
    const newRequest = await NewPassRequest.create({
      passID,
      userRef: userId,
      destinationRef: passCode.destinationRef, // destination auto-filled
      status: "pending",
      bandID: null, // Admin will set this on approval
    });

    return res.json({
      message: "Pass request submitted successfully",
      requestId: newRequest._id,
      status: newRequest.status,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});


router.get("/getPass/:passID", authMiddleware,async (req, res) => {
  try {
    const { passID } = req.params;
    const userId = req.user._id; // Assume user is authenticated and req.user is populated
    console.log("Pass polling: "+passID);
    console.log("User ID: "+userId);

    // Find pass request by passID and userRef
    const request = await Pass.findOne({ passID, userRef: userId })
      .populate("destinationRef", "name state location"); // optional: get destination info

    if (!request) {
      console.log("No Result");
      return res.status(404).json({ exists: false, message: "No pass request found for this user" });
    }

    console.log("Found and returning");

    return res.json({
      exists: true,
      request,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});



router.use("/kyc", KYCRouter);