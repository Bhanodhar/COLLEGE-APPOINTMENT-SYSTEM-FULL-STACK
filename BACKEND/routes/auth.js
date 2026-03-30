const express = require('express');
const {
  register,
  login,
  getMe,
  getProfessors
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);

router.post('/login', login);
router.get('/me', auth, getMe);
router.get('/professors', auth, getProfessors);

module.exports = router;