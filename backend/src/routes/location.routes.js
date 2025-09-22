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

router.put('/peer', authMiddleware, async (req, res) => {
  const { packet } = req.body;

  // 1. Validate packet structure
  if (!packet || !packet.user || !packet.type || !packet.data) {
    return res.status(400).json({ error: 'BAD_REQUEST' });
  }

  // 2. Only process gps packets for now
  if (packet.type !== 'gps') {
    return res.status(400).json({ error: 'UNSUPPORTED_PACKET_TYPE' });
  }

  try {
    // 3. Parse coordinates from packet.data
    const parts = packet.data.split(',').map(Number); // e.g. [lat, lon, alt]
    if (parts.length < 2 || parts.some(isNaN)) {
      return res.status(400).json({ error: 'INVALID_DATA_FORMAT' });
    }

    const latitude = parts[0];
    const longitude = parts[1];
    const altitude = parts[2] || null; // optional

    // 4. Build GeoJSON point
    const locationData = {
      type: 'Point',
      coordinates: [longitude, latitude], // GeoJSON requires [lon, lat]
    };

    // 5. Update the target user’s location
    const updatedLocation = await UserLocation.findOneAndUpdate(
      { user: packet.user }, // target user from packet
      {
        $set: {
          location: locationData,
          altitude: altitude, // optional field if your schema allows it
          updatedByPeer: true,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log(`Peer location update for user ${packet.user}:`, updatedLocation);

    return res.status(200).json(updatedLocation);
  } catch (error) {
    console.error('Error updating peer location:', error);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});


// This single POST route now handles both saving the location and checking the trip status.
router.post("/update-and-check", authMiddleware, updateAndCheckLocation);

export default router;