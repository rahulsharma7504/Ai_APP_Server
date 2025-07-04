const express = require('express');
const router = express();

const chatController = require('../controllers/chatController');
const auth = require('../middlewares/auth');
const { sendMessageRules, getMessagesRules, getImagesRule, deleteImageRule } = require("../utils/validations");

router.post('/send-message', auth, sendMessageRules, chatController.sendMessage);
router.post('/image-generate', auth, sendMessageRules, chatController.createAIImage);
router.get('/get-messages', auth, getMessagesRules, chatController.getMessages);
router.get('/get-images', auth, getImagesRule, chatController.getImages);
router.delete('/image', auth, deleteImageRule, chatController.deleteImage);
router.get('/download-image', chatController.downloadImage);

module.exports = router;