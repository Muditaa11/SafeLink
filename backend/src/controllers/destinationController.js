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
