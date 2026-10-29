// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // የ User ሞዴልህ ስም አረጋግጥ

// 1. GET /api/users?role=student (ሁሉንም ተማሪዎች ማምጣት)
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    
    // ሮል ካለ በዚያ መሰረት ፈልግ
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password'); // ፓስወርድ ሳይጨምር
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET /api/users/:id (የአንድን ተማሪ መረጃ በ ID ማምጣት)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'ተማሪው አልተገኘም' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;