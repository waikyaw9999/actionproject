const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { generateToken } = require('../middleware/auth');

// In-memory users storage
const users = [
  {
    id: 1,
    username: 'testuser',
    // Password: testpass123
    // Generated with generateTestHash()
    password: '$2b$04$Uv4IoT9Igt2WBg5BnyvC7u33l0JISAPhibOrWf.kr.DOSdezGXrp2'
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
module.exports.users = users;