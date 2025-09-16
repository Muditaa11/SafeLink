import UserLocation from '../models/userLocation.model.js';
import Trip from "../models/Trip.js";

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}


/**
 * @route   POST /api/location/update-and-check
 * @desc    Updates a user's location and checks if they are near a trip destination.
 * @access  Private
 */
export const updateAndCheckLocation = async (req, res) => {
  try {
    // --- Part 1: Receive and Save User's Current Location ---

    const { latitude, longitude } = req.body;
    const userId = req.user.id; // From authMiddleware (assuming it provides 'id')

    // 1. Basic validation
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Invalid latitude or longitude provided.' });
    }

    // 2. Prepare the GeoJSON location object for saving
    const locationData = {
      type: 'Point',
      coordinates: [longitude, latitude], // GeoJSON standard: [longitude, latitude]
    };

    // 3. Update the user's location in the UserLocation collection (or create if it doesn't exist)
    await UserLocation.findOneAndUpdate(
      { user: userId },
      { $set: { location: locationData } },
      { upsert: true, new: true }
    );


    // --- Part 2: Check Location Against Active Trip Destinations ---

    const GEOFENCE_RADIUS_METERS = 1000; // Define your geofence radius

    // 4. Find the user's currently active trip
    const trip = await Trip.findOne({ userId, tripStatus: "active" })
      .populate("tripDestinations.destinationId", "name location");

    // 5. If no active trip exists, we are done. The location was saved successfully.
    if (!trip) {
      return res.status(200).json({ message: "Location updated. No active trip found." });
    }

    let destinationUpdated = false;
    let tripCompleted = false;

    // 6. Loop through each destination in the trip
    for (const dest of trip.tripDestinations) {
      // Only check destinations that have not been visited yet
      if (!dest.visitStatus) {
        const destCoords = dest.destinationId.location.coordinates;
        // Calculate distance from user to destination
        const distance = getDistanceInMeters(latitude, longitude, destCoords[1], destCoords[0]);

        // 7. If user is within the geofence, update the visit status
        if (distance <= GEOFENCE_RADIUS_METERS) {
          dest.visitStatus = true;
          destinationUpdated = true;
          console.log(`User has reached destination: ${dest.destinationId.name}`);
        }
      }
    }

    // 8. If a destination's status was changed, save the trip and check for completion
    if (destinationUpdated) {
      // Check if all destinations have now been visited
      const allVisited = trip.tripDestinations.every((d) => d.visitStatus === true);
      
      if (allVisited) {
        trip.tripStatus = "complete";
        trip.completedAt = new Date();
        tripCompleted = true;
      }

      await trip.save();

      const message = tripCompleted 
        ? "Location updated. Trip is now complete!"
        : "Location updated and a destination has been marked as visited.";

      return res.status(200).json({ message, trip });
    }

    // 9. If the location was updated but the user is not near any new destinations
    res.status(200).json({ message: "Location updated, no destinations nearby." });

  } catch (err) {
    console.error("Error in updateAndCheckLocation:", err);
    res.status(500).json({ message: "Server error occurred." });
  }
};