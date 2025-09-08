import express from "express";
import { createTrip, getMyActiveTrips, updateVisitStatus, editTrip, completeTrip, getUserCompletedTrips, checkUserLocation } from "../controllers/tripController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createTrip); //complete
router.get("/me/active", authMiddleware, getMyActiveTrips);
router.patch("/visit", updateVisitStatus); // For geofencing updates
router.put("/:tripId", editTrip);         // Edit trip
router.post("/complete-destination", authMiddleware, completeTrip); // automatically Complete the trip if all destination status is true
router.get("/completed", authMiddleware, getUserCompletedTrips); //get completed user trips


// @route   POST /api/trips/check-location
// @desc    Checks user's location and updates trip status
// @access  Private
router.post("/check-location", authMiddleware, checkUserLocation);
export default router;
