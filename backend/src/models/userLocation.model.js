import mongoose from 'mongoose';

const userLocationSchema = new mongoose.Schema(
  {
    // 🔗 Reference to your existing User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The name of your User model
      required: true,
      unique: true, // Each user has only ONE location document
    },
    // 🌍 Location stored in GeoJSON format
    location: {
      type: {
        type: String,
        enum: ['Point'], // GeoJSON type
        required: true,
      },
      coordinates: {
        type: [Number], // Array of numbers for [longitude, latitude]
        required: true,
      },
    },
  },
  {
    // ⏱️ Automatically add `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

// 🚀 Create a 2dsphere index for fast geospatial queries
userLocationSchema.index({ location: '2dsphere' });

const UserLocation = mongoose.model('UserLocation', userLocationSchema);

export default UserLocation;