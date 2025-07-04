const express = require('express');
const router = express();

const authController = require('../controllers/authController');
const { registerValidationRules, userLoginRules } = require('../utils/validations');

const auth = require('../middlewares/auth');

const uploadMiddleware = require("../utils/imgUpload");

router.post('/register', uploadMiddleware, registerValidationRules, authController.register);
router.post('/login', userLoginRules, authController.login);

router.get('/profile', auth, authController.profile);

module.exports = router;