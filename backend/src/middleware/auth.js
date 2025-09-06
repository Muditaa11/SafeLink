import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // contains { id: user._id }

    // Fetch full user from DB and attach to req.user
    const user = await User.findById(decoded.id).select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // now req.user is a full Mongoose document
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token is not valid" });
  }
};


export default authMiddleware;
