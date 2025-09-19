import express from 'express';
import authMiddleware from '../middleware/auth.js'; // Your JWT authentication middleware
import { addFriends, getFriends, removeFriends, getFriendsLocations } from '../controllers/friendController.js';

const router = express.Router();

router.post('/add', authMiddleware, addFriends);
router.get('/get', authMiddleware, getFriends);
router.post('/remove', authMiddleware, removeFriends);
router.post('/locations', authMiddleware, getFriendsLocations);

export default router;

