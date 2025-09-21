import Trip from "../models/Trip.js";


// Create a new trip
export const createTrip = async (req, res) => {
  try {
    const { tripName, tripDestinations } = req.body;
    const userId = req.user.id;

    if (!tripName || !tripDestinations || !tripDestinations.length) {
      return res.status(400).json({ message: "Trip name and destinations are required." });
    }

    // Ensure order is set correctly
    const formattedDestinations = tripDestinations.map((dest, index) => ({
      destinationId: dest,
      order: index + 1,
      visitStatus: false,
    }));

    const trip = await Trip.create({
      userId,
      tripName,
      tripDestinations: formattedDestinations,
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch trips for the LOGGED IN user
export const getMyActiveTrips = async (req, res) => {
  try {
    const userId = req.user.id; // 👈 Gets ID from the token via middleware
    const trips = await Trip.find({ userId, tripStatus: "active" }).populate("tripDestinations.destinationId", "name state location");

    res.status(200).json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update visitStatus for a destination in a trip (for geofencing)
//this no longer used as we used checkUserLocation
export const updateVisitStatus = async (req, res) => {
  try {
    const { tripId, destinationId } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found." });

     // Only allow updates if trip is active
    if (trip.tripStatus !== "active") {
      return res.status(403).json({ message: "Cannot update destinations of a completed trip." });
    }

    const dest = trip.tripDestinations.find(d => d.destinationId.toString() === destinationId);
    if (!dest) return res.status(404).json({ message: "Destination not found in this trip." });

    dest.visitStatus = true;
    await trip.save();

    res.status(200).json({ message: "Destination marked as visited.", trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit trip (update name or destinations)
export const editTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { tripName, tripDestinations } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found." });

     // ✅ Restrict editing if the trip is not active
    if (trip.tripStatus !== "active") {
      return res.status(403).json({ message: "Only active trips can be edited." });
    }

    if (tripName) trip.tripName = tripName;

    if (tripDestinations && tripDestinations.length > 0) {
      trip.tripDestinations = tripDestinations.map((dest, index) => ({
        destinationId: dest.destinationId,
        order: index + 1,
        visitStatus: dest.visitStatus, // reset visitStatus on edit
      }));
    }

    // Check if all destinations are marked as visited
    const allDestinationsVisited = trip.tripDestinations.every(
      (dest) => dest.visitStatus === true
    );

    // If all are visited, update the trip status
    if (allDestinationsVisited) {
      trip.tripStatus = "complete";
      trip.completedAt = new Date(); // Optional: set completion date
    }

    await trip.save();
    const updatedTrip = await Trip.findById(tripId).populate("tripDestinations.destinationId", "name state location");
    res.status(200).json({ message: "Trip updated successfully.", trip: updatedTrip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const completeTrip = async (req, res) => {
  try {
    const { tripId, destinationId } = req.body;
    const userId = req.user.id; // ✅ extracted from token

    const trip = await Trip.findOne({ _id: tripId, userId }); // ensure user owns this trip
    if (!trip) return res.status(404).json({ message: "Trip not found or unauthorized." });

    if (trip.tripStatus !== "active") {
      return res.status(403).json({ message: "Cannot update destinations of a completed trip." });
    }

    const dest = trip.tripDestinations.find(
      (d) => d.destinationId.toString() === destinationId
    );
    if (!dest) return res.status(404).json({ message: "Destination not found in this trip." });

    dest.visitStatus = true;

    const allVisited = trip.tripDestinations.every((d) => d.visitStatus === true);

    if (allVisited) {
      trip.tripStatus = "complete";
      trip.completedAt = new Date(); // optional field, add in schema
    }

    await trip.save();

    res.status(200).json({
      message: allVisited
        ? "Destination marked as visited. Trip is now complete!"
        : "Destination marked as visited.",
      trip,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Fetch completed trips for a user
export const getUserCompletedTrips = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from token

    const completedTrips = await Trip.find({ userId, tripStatus: "complete" })
      .populate("tripDestinations.destinationId", "name state location");

    res.status(200).json(completedTrips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// A helper function for distance calculation
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

// New controller to check user's location against destinations
export const checkUserLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id; // from authMiddleware
    const GEOFENCE_RADIUS_METERS = 500; // Define your radius (e.g., 500 meters)

    // Find the user's currently active trip and populate destination details
    const trip = await Trip.findOne({ userId, tripStatus: "active" })
        .populate("tripDestinations.destinationId", "name location");
        
    if (!trip) {
      return res.status(200).json({ message: "No active trip found." });
    }

    let destinationUpdated = false;

    // Check each unvisited destination
    for (const dest of trip.tripDestinations) {
      if (!dest.visitStatus) {
        const destCoords = dest.destinationId.location.coordinates;
        const distance = getDistanceInMeters(latitude, longitude, destCoords[1], destCoords[0]); // lon, lat order in GeoJSON

        if (distance <= GEOFENCE_RADIUS_METERS) {
          dest.visitStatus = true;
          destinationUpdated = true;
          console.log(`User entered geofence for: ${dest.destinationId.name}`);
        }
      }
    }

    // If we updated a destination, check if the whole trip is now complete
    if (destinationUpdated) {
      const allVisited = trip.tripDestinations.every((d) => d.visitStatus === true);
      if (allVisited) {
        trip.tripStatus = "complete";
        trip.completedAt = new Date();
      }
      await trip.save();
      return res.status(200).json({ message: "Location checked, destination updated.", trip });
    }
    
    res.status(200).json({ message: "Location checked, no destinations nearby." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};