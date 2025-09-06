import express from "express";
import { createTrip, getUserTrips, updateVisitStatus } from "../controllers/tripController.js";

const router = express.Router();

router.post("/", createTrip);
router.get("/:userId", getUserTrips);
router.patch("/visit", updateVisitStatus); // For geofencing updates

export default router;
