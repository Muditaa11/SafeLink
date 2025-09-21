import express from "express";
import { getDestinationsByState, getMyActiveTrips, getDestinationbyId, getCityByDestinationId } from "../controllers/destinationController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/:state", authMiddleware, getDestinationsByState);
router.get("/trips/active", authMiddleware, getMyActiveTrips);
router.get("/destinations/:id", authMiddleware, getDestinationbyId);
router.get("/:id/city", getCityByDestinationId);
export default router; 