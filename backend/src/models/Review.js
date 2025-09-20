import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    tourist_name: {
      type: String,
      required: true,
      trim: true,
    },
    tourist_email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
        min: 1,
        max: 5,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination", 
      required: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
