import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tripName: { type: String, required: true },
  tripDestinations: [
    {
      destinationId: { type: mongoose.Schema.Types.ObjectId, ref: "Destination", required: true },
      visitStatus: { type: Boolean, default: false }, // false = not visited, true = visited
      order: { type: Number, required: true }, // Optional: helps keep the order of stops
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
