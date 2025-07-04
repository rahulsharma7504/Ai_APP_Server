const { validationResult } = require('express-validator');
const TextToSpeech = require("../models/textToSpeechModel");
const SpeechToText = require("../models/speechToTextModel");
const ChatBot = require("../models/chatBotModel");
const Conversation = require("../models/conversationModel");
const ImageRecognition = require("../models/imageRecognitionModel");

const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { deleteFile } = require("../utils/helper");

const { uploadToCloudinary } = require("../utils/uploadCloudinary");

const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const textToSpeech = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { text, voice = "alloy" } = req.body;
        const user_id = req.user._id;

        const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice,
            input: text,
        });

        const fileName = `audio_${Date.now()}_${uuidv4()}.mp3`;
        const audioDir = path.join(__dirname, "../public/tts");

        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }

        const audioPath = path.join(audioDir, fileName);

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(audioPath, buffer);

        const data = await TextToSpeech.create({
            user_id,
            text,
            file_path: `tts/${fileName}`
        });

        return res.status(200).json({
            success: true,
            msg: "Text to Speech Converted Successfully!",
            data
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const getTextToSpeech = async (req, res) => {

    try {

        const user_id = req.user._id;

        const data = await TextToSpeech.find({ user_id }).sort({ _id: -1 });

        return res.status(200).json({
            success: true,
            msg: "Text to Speech data!",
            data
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const speechToText = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user_id = req.user._id;
        const filePath = path.join(__dirname, "../public/speech", req.file.filename);

        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
        });
        console.log(response);

        const transcript = response.text;

        const data = await SpeechToText.create({
            user_id,
            text: transcript,
            file_path: "speech/" + req.file.filename
        });

        return res.status(200).json({
            success: true,
            msg: "Speech to Text Converted Successfully!",
            data
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const getChatBots = async (req, res) => {

    try {

        const { id } = req.query;
        let data = null;
        if (id) {
            data = await ChatBot.findOne({ _id: id });
        }
        else {
            data = await ChatBot.find({}, { _id: 1, name: 1, type: 1 }).lean();
        }

        return res.status(200).json({
            success: true,
            msg: "Chat Bots",
            data: data
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

}

const getConversations = async (req, res) => {

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

        const data = await Conversation.find({
            user_id,
            chat_bot_id
        }).sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            msg: "Conversations",
            data: data
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

}

const ttsDownload = async (req, res) => {

    try {

        const { url, name } = req.query;
        if (!url) {
            return res.status(500).send("Error fetching speech");
        }
        else if (!name) {
            return res.status(500).send("Error fetching name");
        }

        const response = await axios.get(url, { responseType: "arraybuffer" });
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", 'attachment; filename="' + name + '"');
        return res.send(response.data);

    }
    catch (error) {
        return res.status(500).send(error.message);
    }

};

const deleteTTS = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { id } = req.body;

        const speech = await TextToSpeech.findByIdAndDelete(id);
        if (!speech) {
            return res.status(400).json({
                success: false,
                msg: "Speech not found!",
            });
        }

        const filePath = path.join(__dirname, '../public/' + speech.file_path);
        await deleteFile(filePath);

        return res.status(200).json({
            success: true,
            msg: "Speech deleted Successfully!",
            data: speech
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

const getSpeechToText = async (req, res) => {

    try {

        const user_id = req.user._id;

        const data = await SpeechToText.find({ user_id }).sort({ _id: -1 });

        return res.status(200).json({
            success: true,
            msg: "Speech-to-Text data!",
            data
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const deleteSTT = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { id } = req.body;

        const text = await SpeechToText.findByIdAndDelete(id);
        if (!text) {
            return res.status(400).json({
                success: false,
                msg: "Text not found!",
            });
        }

        const filePath = path.join(__dirname, '../public/' + text.file_path);
        await deleteFile(filePath);

        return res.status(200).json({
            success: true,
            msg: "Text deleted Successfully!",
            data: text
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

const imageRecognition = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user_id = req.user._id;
        const imageUrl = await uploadToCloudinary(req.file.path);

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Please describe this image in detail." },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl
                            },
                        },
                    ],
                },
            ],
        });

        const ai_response = response.choices[0].message.content;

        const data = await ImageRecognition.create({
            user_id,
            image: imageUrl,
            ai_message: ai_response
        });

        return res.status(200).json({
            success: true,
            msg: "Image Recognition Fetch Successfully!",
            data
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

const getImageRecognition = async (req, res) => {

    try {

        const user_id = req.user._id;

        const data = await ImageRecognition.find({ user_id }).sort({ _id: -1 });

        return res.status(200).json({
            success: true,
            msg: "Image Recognition data!",
            data
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const deleteImageRecognition = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { id } = req.body;

        const imrData = await ImageRecognition.findByIdAndDelete(id);
        if (!imrData) {
            return res.status(400).json({
                success: false,
                msg: "Data not found!",
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Datae deleted Successfully!",
            data: imrData
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
    textToSpeech,
    getTextToSpeech,
    speechToText,
    getChatBots,
    getConversations,
    ttsDownload,
    deleteTTS,
    getSpeechToText,
    deleteSTT,
    imageRecognition,
    getImageRecognition,
    deleteImageRecognition
}