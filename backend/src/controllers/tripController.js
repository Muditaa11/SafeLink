import Trip from "../models/Trip.js";


// Create a new trip
export const createTrip = async (req, res) => {
  try {
    const { tripName, tripDestinations } = req.body;
    const userId = req.user._id;

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
    const userId = req.user._id; // 👈 Gets ID from the token via middleware
    const trips = await Trip.find({ userId, tripStatus: "active" }).populate("tripDestinations.destinationId", "name state location");

    res.status(200).json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update visitStatus for a destination in a trip (for geofencing)
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

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found." });

    // Only allow updates if trip is active
    if (trip.tripStatus !== "active") {
      return res.status(403).json({ message: "Cannot update destinations of a completed trip." });
    }

    const dest = trip.tripDestinations.find(d => d.destinationId.toString() === destinationId);
    if (!dest) return res.status(404).json({ message: "Destination not found in this trip." });

    dest.visitStatus = true;

    // Check if all destinations are visited
    const allVisited = trip.tripDestinations.every(d => d.visitStatus === true);

    // If all visited, mark trip as complete
    if (allVisited) {
      trip.tripStatus = "complete";
    }

    await trip.save();

    res.status(200).json({ 
      message: allVisited 
        ? "Destination marked as visited. Trip is now complete!" 
        : "Destination marked as visited.", 
      trip 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Fetch completed trips for a user
export const getUserCompletedTrips = async (req, res) => {
  try {
    const { userId } = req.params;

    const completedTrips = await Trip.find({ userId, tripStatus: "complete" })
      .populate("tripDestinations.destinationId", "name state location");

    res.status(200).json(completedTrips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

