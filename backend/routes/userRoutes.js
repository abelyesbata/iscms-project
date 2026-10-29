// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // የ User ሞዴልህ ስም አረጋግጥ

// GET /api/users?role=student
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

module.exports = router;