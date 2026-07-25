const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, changePassword, verifyOtp, googleLogin, checkEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/check-email', checkEmail);
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

module.exports = router;
