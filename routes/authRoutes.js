const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });



// Route for user registration
router.post("/signup",upload.single('avatar'), authController.signup);

// Route for user login
router.post("/login", authController.login);

// Route for sending password reset token
router.post("/reset-password/token", authController.resetPasswordToken);

// Route for resetting password
router.post("/reset-password/:resetToken", authController.resetPassword);

module.exports = router;
