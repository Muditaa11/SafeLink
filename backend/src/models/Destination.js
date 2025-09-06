import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
});

destinationSchema.index({ location: "2dsphere" }); // Needed for geospatial queries

const Destination = mongoose.model("Destination", destinationSchema);
export default Destination;
