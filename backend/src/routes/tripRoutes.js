import express from "express";
import { createTrip, getUserTrips, updateVisitStatus, editTrip, completeTrip } from "../controllers/tripController.js";


const router = express.Router();

router.post("/", createTrip);
router.get("/:userId", getUserTrips);
router.patch("/visit", updateVisitStatus); // For geofencing updates
router.put("/:tripId", editTrip);         // Edit trip
router.post("/:tripId/complete", completeTrip); // Complete trip

export default router;
