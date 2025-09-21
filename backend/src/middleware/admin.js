import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin in DB
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Inject adminId and destinationId into request
    req.adminId = admin._id;
    req.destinationId = admin.destination;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default authAdmin;
