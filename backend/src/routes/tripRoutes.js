import express from "express";
import { createTrip, getMyActiveTrips, updateVisitStatus, editTrip, completeTrip, getUserCompletedTrips } from "../controllers/tripController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createTrip); //complete
router.get("/me/active", authMiddleware, getMyActiveTrips);
router.patch("/visit", updateVisitStatus); // For geofencing updates
router.put("/:tripId", editTrip);         // Edit trip
router.post("/:tripId/complete", completeTrip); // automatically Complete the trip if all destination status is true
router.get("/completed/:userId", getUserCompletedTrips); //get completed user trips

export default router;
