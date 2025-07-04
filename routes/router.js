const express = require('express');
const router = express();

const aiController = require('../controllers/aiController');
const pdfController = require('../controllers/pdfController');
const auth = require('../middlewares/auth');
const { ttsRules, sttRules, getConversationRule, deleteTTSRule, deleteSTTRule,
    imageRecognitionRule, deleteImageRecognitionRule,singlePdfUploadRule,
    chatWithPdfRule, singlePDFChatRule, multiplePdfUploadRule, pdfChatRule,
    updateChunkRule,deletePdfDataRule, getMessagesRules
 } = require("../utils/validations");

const uploadMiddleware = require("../utils/upload");
const imgUpload = require("../utils/imgUpload");
const { uploadSinglePdf, uploadMultiplePdf } = require("../utils/pdfUpload");

router.post('/text-to-speech', auth, ttsRules, aiController.textToSpeech);
router.get('/text-to-speech', auth, aiController.getTextToSpeech);
router.get('/tts-download', aiController.ttsDownload);
router.delete('/text-to-speech', auth, deleteTTSRule, aiController.deleteTTS);

router.post('/speech-to-text', auth, uploadMiddleware, sttRules, aiController.speechToText);
router.get('/speech-to-text', auth, aiController.getSpeechToText);
router.delete('/speech-to-text', auth, deleteSTTRule, aiController.deleteSTT);

router.get('/chat-bots', auth, aiController.getChatBots);
router.get('/conversations', auth, getConversationRule, aiController.getConversations);
router.post('/image-recognition', auth, imgUpload, imageRecognitionRule, aiController.imageRecognition);
router.get('/image-recognition', auth, aiController.getImageRecognition);
router.delete('/image-recognition', auth, deleteImageRecognitionRule, aiController.deleteImageRecognition);

//single pdf chat route
router.post('/pdf', auth, uploadSinglePdf, singlePdfUploadRule, pdfController.savePdfFile);
router.get('/pdf', auth, pdfController.getPdfFiles);
router.post('/chat-with-pdf', auth, chatWithPdfRule, pdfController.chatWithPdf);
router.get('/single-pdf-chats', auth, singlePDFChatRule, pdfController.getSinglePDFChats);
router.post('/pdfs', auth, uploadMultiplePdf, multiplePdfUploadRule, pdfController.savePDFs);
router.post('/chat-with-multiple-pdf', auth, pdfChatRule, pdfController.chatWithMultiplePDF);
router.get('/pdfs', auth, pdfController.getPdfs);
router.put('/update-chunk', auth, updateChunkRule, pdfController.updateChunk);
router.delete('/delete-pdf-data', auth, deletePdfDataRule, pdfController.deletePdfData);
router.get('/pdf-conversations', auth, pdfController.getConversations);
router.get('/pdf-conversation-messages', auth, getMessagesRules, pdfController.getConversationMessages);

module.exports = router;