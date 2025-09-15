import express from "express";
import { getDestinationsByState, getMyActiveTrips } from "../controllers/destinationController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/:state", authMiddleware, getDestinationsByState);
router.get("/trips/active", authMiddleware, getMyActiveTrips);

export default router;
