import History from "../models/History.js";

// Get all history trips for a user
export const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const historyTrips = await History.find({ userId })
      .populate("tripDestinations.destinationId", "name state location")
      .sort({ completedAt: -1 }); // latest first

    if (!historyTrips.length) {
      return res.status(404).json({ message: "No history found for this user." });
    }

    res.status(200).json(historyTrips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
