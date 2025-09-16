import express from 'express';
import authMiddleware from '../middleware/auth.js'; // Your JWT authentication middleware
import UserLocation from '../models/userLocation.model.js';
import { updateAndCheckLocation } from '../controllers/locationController.js';

const router = express.Router();

/**
 * @route   PUT /api/location
 * @desc    Create or update the authenticated user's live location
 * @access  Private
 */
router.put('/', authMiddleware, async (req, res) => {
  // 1. Destructure latitude and longitude from the request body
  const { latitude, longitude } = req.body;

  // 2. Basic validation
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Invalid latitude or longitude.' });
  }

  // 3. Get the user ID from the auth middleware (which decodes the JWT)
  const userId = req.user.id;

  try {
    // 4. Prepare the GeoJSON location object
    const locationData = {
      type: 'Point',
      coordinates: [longitude, latitude], // Remember: [longitude, latitude]
    };

    // 5. Find the user's location document and update it.
    // If it doesn't exist, create it (`upsert: true`).
    const updatedLocation = await UserLocation.findOneAndUpdate(
      { user: userId }, // Find document by user ID
      { $set: { location: locationData } }, // The data to update
      {
        new: true, // Return the updated document
        upsert: true, // Create the document if it doesn't exist
      }
    );

    res.status(200).json(updatedLocation);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// This single POST route now handles both saving the location and checking the trip status.
router.post("/update-and-check", authMiddleware, updateAndCheckLocation);

export default router;