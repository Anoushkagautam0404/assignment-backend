const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';
router.get('/', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send('Unauthorized');
    req.userId = decoded.userId;
    next();
  });
};

router.get('/', authMiddleware, async (req, res) => {
  const users = await User.find().select('-password');
  res.send(users);
});

router.post('/add-friend', authMiddleware, async (req, res) => {
    const { friendId } = req.body;
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
      user.friends.push(friendId);
      await user.save();
      res.send('Friend added');
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

router.post('/remove-friend', authMiddleware, async (req, res) => {
  const { friendId } = req.body;
  const user = await User.findById(req.userId);
  user.friends.pull(friendId);
  await user.save();
  res.send('Friend removed');
});

module.exports = router;