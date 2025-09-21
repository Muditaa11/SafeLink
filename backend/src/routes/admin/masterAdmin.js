import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// MASTER-PROTECTED SIGNUP ROUTE
router.post("/new-admin", async (req, res) => {
  try {
    const { name, email, password, destinationId, secretKey } = req.body;

    // Only master key can create admins
    console.log("Received Secret Key: "+secretKey);
    console.log("Inner key: "+process.env.MASTER_SECRET_KEY);
    if (secretKey !== process.env.MASTER_SECRET_KEY) {
      return res.status(403).json({ message: "Unauthorized: Invalid secret key" });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      destination: destinationId,
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      destination: admin.destination,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
