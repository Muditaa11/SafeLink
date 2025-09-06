import Trip from "../models/Trip.js";

// Create a new trip
export const createTrip = async (req, res) => {
  try {
    const { userId, tripName, tripDestinations } = req.body;

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

// Fetch all trips for a user
export const getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Trip.find({ userId }).populate("tripDestinations.destinationId", "name state location");

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
