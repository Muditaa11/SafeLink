import express from "express";
import { getDestinationsByState, getMyActiveTrips, getDestinationbyId } from "../controllers/destinationController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/:state", authMiddleware, getDestinationsByState);
router.get("/trips/active", authMiddleware, getMyActiveTrips);
router.get("/:id", authMiddleware, getDestinationbyId);
export default router;
