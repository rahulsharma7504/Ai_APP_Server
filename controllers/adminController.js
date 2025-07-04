const ChatBot = require('../models/chatBotModel');
const { validationResult } = require('express-validator');
const path = require("path");
const { deleteFile } = require("../utils/helper");

const addChatBot = async(req, res) => {

    try{

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array() 
            });
        }

        const { name, message, prompt_message, type } = req.body;

        const chatBot = new ChatBot({
            name,
            message,
            prompt_message,
            image: 'images/'+req.file.filename,
            type
        });
        await chatBot.save();

        return res.status(200).json({
            success: true,
            msg: "Chat Bot Created Successfully!",
            data: chatBot 
        });

    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

}

const getChatBots = async(req, res) => {

    try{

        const chatBots = await ChatBot.find({});
        return res.status(200).json({
            success: true,
            msg: "Chat Bots",
            data: chatBots 
        });

    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

}

const updateChatBot = async(req, res) => {

    try{

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array() 
            });
        }

        const {id, name, message, prompt_message, type } = req.body;

        const data = {
            name,
            message,
            prompt_message,
            type
        }

        if(req.file !== undefined){
            data.image = 'images/'+req.file.filename;

            const chatBot = await ChatBot.findOne({ _id: id });

            const oldFilePath = path.join(__dirname, '../public/'+chatBot.image);
            await deleteFile(oldFilePath);

        }

        const chatBotData = await ChatBot.findByIdAndUpdate({ _id: id },
            {
                $set: data
            },
            {
                new: true
            }
        )

        return res.status(200).json({
            success: true,
            msg: "Chat Bot Updated Successfully!",
            data: chatBotData
        });

    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

}

const deleteChatBot = async(req, res) => {

    try{

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array() 
            });
        }

        const { id } = req.body;

        const chatBot = await ChatBot.findOne({ _id: id });

        const oldFilePath = path.join(__dirname, '../public/'+chatBot.image);
        await deleteFile(oldFilePath);

        const data = await ChatBot.deleteOne({ _id: id });


        return res.status(200).json({
            success: true,
            msg: "Chat Bot Deleted Successfully!",
            data: data 
        });

    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

}

module.exports = {
    addChatBot,
    getChatBots,
    updateChatBot,
    deleteChatBot
}