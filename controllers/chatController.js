
const { validationResult } = require('express-validator');
const { isBotExists, isConversationExists, createConversation,
    updateConversation, createChat, updateChat,
    getLastConversations, chatWithOpenAI, generateAIImage,
    isConversationExistWithUser
 } = require("../utils/helper");

const Chat = require("../models/chatModel");
const TextToImage = require("../models/textToImageModel");
const axios = require("axios");
const path = require("path");
const { deleteFile } = require("../utils/helper");

const sendMessage = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { chat_bot_id, message, conversation_id } = req.body;

        //check bot is exists
        const chatBotData = await isBotExists(chat_bot_id);
        if(!chatBotData){
            return res.status(200).json({
                success: false,
                msg: "chat_bot_id doesn't exists!",
            });
        }

        const user_id = req.user._id;
        let c_conversation_id = null;

        if(conversation_id){
            const isExists = await isConversationExists(conversation_id);
            if(!isExists){
                return res.status(200).json({
                    success: false,
                    msg: "conversation_id doesn't exists!",
                });
            }

            c_conversation_id = conversation_id;
            await updateConversation(c_conversation_id, message);
        }
        else{
            c_conversation_id = await createConversation(user_id, chat_bot_id, message);
        }

        //create chat
        const chat_id = await createChat(user_id, c_conversation_id, chat_bot_id, message, 0);

        //ai work start

        const system_prompt = chatBotData?chatBotData.prompt_message:"You are a helpful assistant.";
        const role_key = "role";
        const content_key = "content";
        const user_key = "user";
        const system_key = "system";
        const assistant_key = "assistant";
        const history = [{ [role_key]: system_key, [content_key]: system_prompt  }];

        const conversations = await getLastConversations(user_id, c_conversation_id, chat_bot_id);

        for(const chat of conversations){
            history.push({ [role_key]: user_key, [content_key]: chat.user_message });
            
            if(chat.ai_message){
                history.push({ [role_key]: assistant_key, [content_key]: chat.ai_message });
            }
        }

        const ai_reply = await chatWithOpenAI(history, user_id);

        //ai work end
        const updatedChat = await updateChat(chat_id, ai_reply);

        await updateConversation(c_conversation_id, ai_reply);

        return res.status(200).json({
            success: true,
            msg: "Send Message Successfully!",
            conversation_id: c_conversation_id,
            data: updatedChat
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

const createAIImage = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { chat_bot_id, message, size } = req.body;

        //check bot is exists
        const chatBotData = await isBotExists(chat_bot_id);
        if(!chatBotData){
            return res.status(200).json({
                success: false,
                msg: "chat_bot_id doesn't exists!",
            });
        }
        else if(chatBotData.type != 1){
            return res.status(200).json({
                success: false,
                msg: "Please use Image Generator Chat Bot!",
            });
        }

        let imageSize = "1024x1024";
        if(size){
            imageSize = size;
        }

        const user_id = req.user._id;

        //ai work start
        const quality = "standard";
        const ai_image = await generateAIImage(message, imageSize, quality);

        const data = await TextToImage.create({
            user_id,
            chat_bot_id,
            text: message,
            size: imageSize,
            file_path: ai_image
        });

        return res.status(200).json({
            success: true,
            msg: "Text to Image Converted!",
            data: data
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

const getMessages = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { conversation_id } = req.query;
        const user_id = req.user._id;

        const isExists = await isConversationExistWithUser(conversation_id, user_id);

        if(!isExists){
            return res.status(200).json({
                success: false,
                msg: "Conversation doesn't exists!",
            });
        }

        const chats = await Chat.find({
            conversation_id
        })
        .populate('user_id','name email')
        .populate('chat_bot_id', 'name image')
        .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            msg: "Messages get Successfully!",
            data: chats
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

const getImages = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { chat_bot_id } = req.query;
        const user_id = req.user._id;

        const images = await TextToImage.find({
            user_id,
            chat_bot_id
        });

        return res.status(200).json({
            success: true,
            msg: "Images get Successfully!",
            data: images
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

const downloadImage = async (req, res) => {

    try {

        const imageUrl = req.query.url;
        if(!imageUrl){
            return res.status(500).send("Error fetching image");
        }

        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        res.setHeader("Content-Type", "image/jpeg");
        res.setHeader("Content-Disposition", 'attachment; filename="download.jpg"');
        return res.send(response.data);

    }
    catch (error) {
        return res.status(500).send(error.message);
    }

};

const deleteImage = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { id } = req.body;

        const image = await TextToImage.findByIdAndDelete(id);
        if(!image){
            return res.status(400).json({
                success: false,
                msg: "Image not found!",
            });
        }

        const filePath = path.join(__dirname,'../public/'+image.file_path);
        await deleteFile(filePath);

        return res.status(200).json({
            success: true,
            msg: "Images deleted Successfully!",
            data: image
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

module.exports = {
    sendMessage,
    createAIImage,
    getMessages,
    getImages,
    downloadImage,
    deleteImage
}