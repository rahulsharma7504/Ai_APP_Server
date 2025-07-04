const { body, check, query } = require("express-validator");
const User = require("../models/userModel");

const registerValidationRules = [
    body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),

    body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .custom(async (email) => {
        const existingUser = await User.findOne({ email });
        if(existingUser){
            throw new Error('Email already in use');
        }
        return true;
    })
    .trim(),
    check("image").custom((value, {req}) => {
        if(!req.file){
            throw new Error("image file is required")
        }
        return true;
    }),
    body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const userLoginRules = [
    body('email')
    .notEmpty()
    .withMessage('Email is required')
    .trim(),

    body('password')
    .notEmpty()
    .withMessage('Password is required')
    .trim(),
];

const addChatBotRules = [
    body('name')
    .notEmpty()
    .withMessage('name is required')
    .trim(),
    body('message')
    .notEmpty()
    .withMessage('message is required')
    .trim(),
    body('prompt_message')
    .notEmpty()
    .withMessage('prompt_message is required')
    .trim(),
    body('image').custom((value, {req}) => {
        if(req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png'){
            return true;
        }
        else{
            return false;
        }
    }).withMessage("Please upload an Image jpeg, PNG"),
    body('type')
    .notEmpty()
    .withMessage('type is required')
    .trim(),
];

const updateChatBotRules = [
    body('id')
    .notEmpty()
    .withMessage('id is required')
    .trim(),
    body('name')
    .notEmpty()
    .withMessage('name is required')
    .trim(),
    body('message')
    .notEmpty()
    .withMessage('message is required')
    .trim(),
    body('prompt_message')
    .notEmpty()
    .withMessage('prompt_message is required')
    .trim(),
];

const deleteChatBotRules = [
    body('id')
    .notEmpty()
    .withMessage('id is required')
    .trim(),
];

const sendMessageRules = [
    body('chat_bot_id')
    .notEmpty()
    .withMessage('chat_bot_id is required')
    .trim(),
    body('message')
    .notEmpty()
    .withMessage('message is required'),
];

const getMessagesRules = [
    query('conversation_id')
    .notEmpty()
    .withMessage('conversation_id is required')
    .trim(),
];

const ttsRules = [
    body('text')
    .notEmpty()
    .withMessage('text is required')
    .trim(),
];

const sttRules = [
    check("audio").custom((value, {req}) => {
        if(!req.file){
            throw new Error("Audio file is required")
        }
        return true;
    })
];

const getConversationRule = [
    query('chat_bot_id', 'chat_bot_id is required')
    .not()
    .isEmpty(),
];

const getImagesRule = [
    query('chat_bot_id', 'chat_bot_id is required')
    .not()
    .isEmpty(),
];

const deleteImageRule = [
    body('id', 'id is required')
    .not()
    .isEmpty(),
];

const deleteTTSRule = [
    body('id', 'id is required')
    .not()
    .isEmpty(),
];

const deleteSTTRule = [
    body('id', 'id is required')
    .not()
    .isEmpty(),
];

const imageRecognitionRule = [
    body('image').custom((value, {req}) => {
        if(req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png'){
            return true;
        }
        else{
            return false;
        }
    }).withMessage("Please upload an Image jpeg, PNG"),
]

const deleteImageRecognitionRule = [
    body('id', 'id is required')
    .not()
    .isEmpty(),
];

const singlePdfUploadRule = [
    body('pdf').custom((value, {req}) => {
        if(req.file.mimetype === 'application/pdf'){
            return true;
        }
        else{
            return false;
        }
    }).withMessage("Please upload PDF File."),
]

const multiplePdfUploadRule = [
    body('pdfs').custom((value, {req}) => {
        // console.log(req.files)
        if(!req.files || req.files.length === 0){
            return false;
        }
        else{
            return true;
        }
    }).withMessage("At least one pdf file required."),
]

const chatWithPdfRule = [
    body('pdf_id', 'pdf_id is required')
    .not()
    .isEmpty(),
    body('question', 'question is required')
    .not()
    .isEmpty(),
];

const singlePDFChatRule = [
    query('pdf_id', 'pdf_id is required')
    .not()
    .isEmpty(),
];

const pdfChatRule = [
    body('question', 'question is required')
    .not()
    .isEmpty(),
];

const updateChunkRule = [
    body('id', 'id is required')
    .not()
    .isEmpty(),
    body('text', 'text is required')
    .not()
    .isEmpty(),
];

const deletePdfDataRule = [
    body('is_pdf', 'question is required')
    .not()
    .isEmpty(),
    body('id', 'id is required')
    .not()
    .isEmpty(),
];

module.exports = {
    registerValidationRules,
    userLoginRules,
    addChatBotRules,
    deleteChatBotRules,
    updateChatBotRules,
    sendMessageRules,
    getMessagesRules,
    ttsRules,
    sttRules,
    getConversationRule,
    getImagesRule,
    deleteImageRule,
    deleteTTSRule,
    deleteSTTRule,
    imageRecognitionRule,
    deleteImageRecognitionRule,
    singlePdfUploadRule,
    chatWithPdfRule,
    singlePDFChatRule,
    multiplePdfUploadRule,
    pdfChatRule,
    deletePdfDataRule,
    updateChunkRule
}