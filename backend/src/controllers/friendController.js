import UserLocation from "../models/userLocation.model.js";
import mongoose from "mongoose";
// Add Friend
export const addFriends = async (req, res) => {
    const userId = req.user.id;
    const { friendId } = req.body;

    if (userId === friendId) {
        return res.status(400).json({ message: "You cannot add yourself as a friend." });
    }

    try {
        const user = await UserLocation.findOne({ user: userId });

        // Determine if friendId looks like an ObjectId
        let friend;

        if (mongoose.Types.ObjectId.isValid(friendId)) {
            // Try find by user ObjectId
            friend = await UserLocation.findOne({ user: friendId });
        }

        if (!friend) {
            // If not found by ID, try find by user email
            const User = mongoose.model('User'); // or import your User model
            const userDoc = await User.findOne({ email: friendId }); // friendId here is email
            if (userDoc) {
                friend = await UserLocation.findOne({ user: userDoc._id });
            }
        }

        if (!friend) {
            return res.status(400).json({ error: 'Friend not found' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User location not found' });
        }

        // if (user.friends.includes(friend.user.toString())) {
        //     return res.status(400).json({ error: 'Friend already added' });
        // }
        // FIX: Use .some() and .equals() to properly check for existence
        if (user.friends.some(id => id.equals(friend.user))) {
            return res.status(400).json({ error: 'Friend already added' });
        }

        user.friends.push(friend.user);
        friend.friends.push(user.user);

        await user.save();
        await friend.save();

        res.status(200).json({ message: 'Friend added successfully', friends: user.friends });
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).json({ error: 'SERVER_ERROR' });
    }
};

// Get Friends
export const getFriends = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await UserLocation.findOne({ user: userId })
            .populate('friends', 'fullName email');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Remove Friend
export const removeFriends = async (req, res) => {
    const userId = req.user.id;
    const { friendId } = req.body;

    try {
        const user = await UserLocation.findOne({ user: userId });
        const friend = await UserLocation.findOne({ user: friendId });

        if (!user || !friend) {
            return res.status(404).json({ message: "User or friend not found" });
        }

        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        await user.save();
        await friend.save();

        res.status(200).json({ message: "Friend removed successfully", friends: user.friends });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Get Friends' Locations
export const getFriendsLocations = async (req, res) => {
    const userId = req.user.id; // Logged-in user id

    try {
        // 1. Find UserLocation doc for logged-in user
        const user = await UserLocation.findOne({ user: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Take all friendIds directly from user's friends array
        const friendIds = user.friends.map(f => f.toString());

        if (friendIds.length === 0) {
            return res.status(200).json({ message: "No friends added yet", locations: [] });
        }

        // 3. Find all locations for those friends
        const locations = await UserLocation.find({ user: { $in: friendIds } })
            .populate("user", "name email") // include friend's basic info
            .select("user location updatedAt");

        // 4. Return them
        res.status(200).json({ locations });
    } catch (error) {
        console.error('Error fetching friend locations:', error);
        res.status(500).json({ message: "Server error", error });
    }
};
