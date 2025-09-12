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
  tripStatus: {
    type: String,
    enum: ["active", "complete"],
    default: "active", // Default status is active
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
