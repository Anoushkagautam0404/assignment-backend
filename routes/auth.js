const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = '_jwt_secret';

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!email) {
    return res.status(400).send('Email is required');
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already exists');
    }
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send('User created');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.compare(password))) {
      return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.send({ token });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/send-friend-request', async (req, res) => {
    const { userId, friendId } = req.body;
    try {
      const user = await User.findById(userId);
      const friend = await User.findById(friendId);
      if (!user || !friend) {
        return res.status(404).send('User not found');
      }
      if (!friend.friendRequests.includes(userId)) {
        friend.friendRequests.push(userId);
        await friend.save();
      }
      res.status(200).send('Friend request sent');
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

router.post('/accept-friend-request', async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) {
      return res.status(404).send('User not found');
    }
    if (user.friendRequests.includes(friendId)) {
      user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
      user.friends.push(friendId);
      friend.friends.push(userId);
      await user.save();
      await friend.save();
    }
    res.status(200).send('Friend request accepted');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/reject-friend-request', async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
    await user.save();
    res.status(200).send('Friend request rejected');
  } catch (error) {
    res.status(400).send(error.message);
  }
});
router.get('/pending-friend-requests/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId).populate('friendRequests', 'username');
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.status(200).send(user.friendRequests);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
  router.get('/friends/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId).populate('friends', 'username');
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.status(200).send(user.friends);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
module.exports = router;