import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tripName: { type: String, required: true },
  tripDestinations: [
    {
      destinationId: { type: mongoose.Schema.Types.ObjectId, ref: "Destination", required: true },
      visitStatus: { type: Boolean, default: false },
      order: { type: Number, required: true },
    },
  ],
  completedAt: { type: Date, default: Date.now }
});

const History = mongoose.model("History", historySchema);
export default History;
    