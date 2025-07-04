const express = require('express');
const router = express();

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            cb(null, path.join(__dirname, '../public/images'));
        }
    },
    filename: function(req, file, cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

const adminController = require('../controllers/adminController');
const { addChatBotRules, updateChatBotRules, deleteChatBotRules } = require('../utils/validations');

const adminAuth = require('../middlewares/adminAuth');

router.post('/add-chat-bot', adminAuth, upload.single('image'), addChatBotRules, adminController.addChatBot);
router.get('/chat-bots', adminAuth, adminController.getChatBots);
router.put('/update-chat-bot', adminAuth, upload.single('image'), updateChatBotRules, adminController.updateChatBot);
router.delete('/delete-chat-bot', adminAuth, deleteChatBotRules, adminController.deleteChatBot);

module.exports = router;