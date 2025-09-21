import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: false },
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
  safety_guidelines: {
    type: String,
    required: true
  },
  cultural_guidelines: {
    type: String,
    required: true
  },
  tech_guidelines: {
    type: String,
    required: true
  }
});

destinationSchema.index({ location: "2dsphere" }); // Needed for geospatial queries

const Destination = mongoose.model("Destination", destinationSchema);
export default Destination;
