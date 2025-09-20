import Trip from "../models/Trip.js";
import Destination from "../models/Destination.js";

// Fetch all destinations by state
export const getDestinationsByState = async (req, res) => {
  try {
    const { state } = req.params;
    const destinations = await Destination.find({
      state: { $regex: new RegExp(`^${state}$`, "i") }
    }).select("name location");

    if (!destinations.length) {
      return res.status(404).json({ message: "No destinations found in this state." });
    }

    res.status(200).json(destinations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get user's active trips with destination details (lat/lng included)
export const getMyActiveTrips = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Find user's active trips
    const trips = await Trip.find({ userId, tripStatus: "active" });

    if (!trips || trips.length === 0) {
      return res.status(404).json({ message: "No active trips found" });
    }

    // Step 2: Collect all destination IDs
    const destinationIds = trips.flatMap(trip =>
      trip.tripDestinations.map(dest => dest.destinationId)
    );

    // Step 3: Fetch destinations with those IDs
    const destinations = await Destination.find(
      { _id: { $in: destinationIds } },
      "name state location"
    );

    // Step 4: Build trips response with lat/lng merged
    const tripsWithDestinations = trips.map(trip => {
      const formattedDestinations = trip.tripDestinations.map(dest => {
        const matched = destinations.find(
          d => d._id.toString() === dest.destinationId.toString()
        );
        return matched
          ? {
              _id: matched._id,
              name: matched.name,
              state: matched.state,
              latitude: matched.location.coordinates[1],
              longitude: matched.location.coordinates[0],
            }
          : null;
      }).filter(Boolean); // remove null if any mismatch

      return {
        _id: trip._id,
        tripName: trip.tripName,
        tripStatus: trip.tripStatus,
        destinations: formattedDestinations,
      };
    });

    res.status(200).json(tripsWithDestinations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDestinationbyId = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json(destination);
  } catch (err) {
    console.error("Error fetching destination:", err);
    res.status(500).json({ message: "Server error" });
  }
};


