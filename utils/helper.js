const fs = require("fs").promises;
const ChatBot = require("../models/chatBotModel");
const Chat = require("../models/chatModel");
const Conversation = require("../models/conversationModel");
const FileEmbedding = require("../models/fileEmbeddingModel");
const axios = require("axios");
const path = require("path");

const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const deleteFile = async (filePath) => {
    try {

        await fs.unlink(filePath);
        console.log("File deleted successfully!");
    }
    catch (error) {
        console.log(error.message);
    }
}

const isBotExists = async (id) => {
    try {

        const isExists = await ChatBot.findOne({ _id: id });
        if (!isExists) {
            return false;
        }
        return isExists;

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

const isConversationExists = async (id) => {
    try {

        const isExists = await Conversation.findOne({ _id: id });
        if (!isExists) {
            return false;
        }
        return true;

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

const isConversationExistWithUser = async (id, user_id) => {
    try {

        const isExists = await Conversation.findOne({ _id: id, user_id });
        if (!isExists) {
            return false;
        }
        return true;

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

const createConversation = async (user_id, chat_bot_id, message) => {
    try {

        const conversation = await Conversation.create({
            user_id,
            chat_bot_id,
            last_message: message
        });

        return conversation._id;

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

const updateConversation = async (conversation_id, message) => {
    try {

        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversation_id,
            { $set: { last_message: message } },
            { new: true }
        );

        return updatedConversation;

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

const createChat = async (user_id, conversation_id, chat_bot_id, message, type) => {
    try {

        const chat = await Chat.create({
            user_id,
            conversation_id,
            chat_bot_id,
            user_message: message,
            type
        });

        return chat._id;

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

const updateChat = async (id, ai_message) => {
    try {

        const updatedChat = await Chat.findByIdAndUpdate(
            id,
            { $set: { ai_message: ai_message } },
            { new: true }
        );

        return updatedChat;

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

const getLastConversations = async (user_id, conversation_id, chat_bot_id) => {
    try {

        const chats = Chat.find({
            user_id,
            conversation_id,
            chat_bot_id
        })
        .limit(8)
        .lean();

        return chats;

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

const chatWithOpenAI = async (history, user_id) => {
    try {

        const response = await openai.chat.completions.create({

            model: "gpt-3.5-turbo",
            messages: history,
            temperature: 1.0,
            frequency_penalty: 0,
            presence_penalty: 0,
            user: user_id

        });

        return response.choices[0].message.content;

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

const generateAIImage = async (prompt, size, quality) => {
    try {

        const response = await openai.images.generate({

            model: "dall-e-3",
            prompt: prompt,
            size: size,
            quality: quality,
            n: 1,

        });
        
        const imageUrl = response.data[0].url;

        console.log("Generated Image URL: ", imageUrl);

        const timestamp = Date.now();
        const fileName = `ai_image_${timestamp}.png`;
        const filePath = path.join(__dirname, "../public/ai-images/"+fileName);

        await downloadImage(imageUrl, filePath)
        return "ai-images/"+fileName;
    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

async function downloadImage(url, filePath) {
    try{

        const response = await axios({
            method: 'GET',
            url,
            responseType: "arraybuffer",
            timeout: 50000 //50 seconds
        });

        await fs.writeFile(filePath, response.data);
        return filePath;
    }
    catch(error){
        console.log("Error downloading image: ",error.message);
        throw error;
    }
} 

const chatWithPdf = async (context, question) => {
    try {

        const response = await openai.chat.completions.create({

            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "You are an AI that answers based on uploaded PDFs." },
                { role: "user", content: `Context: ${context}\n\nQuesion: ${question}` },
            ],
            temperature: 0.7,
        });

        return response.choices[0].message.content;

    }
    catch (error) {
        console.log(error.message);
        throw error;
    }
}

const splitIntoChunks = (text, chunkSize) => {
    try {

        const words = text.trim().split(/\s+/);
        const chunks = [];

        for(let i = 0; i < words.length; i += chunkSize){
            chunks.push(words.slice(i, i + chunkSize).join(' '));
        }

        return chunks;
    }
    catch (error) {
        return [];
    }
}

async function generateEmbedding(text){
    try{

        const response = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: text
        });

        return response.data[0].embedding;

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

async function processChunks(chunks, pdf){
    try{

        for(const chunk of chunks){
            const embedding = await generateEmbedding(chunk);
            await FileEmbedding.create({
                pdf_id: pdf._id,
                embedding: embedding,
                content: chunk
            });
        }

    }
    catch (error) {
        console.log(error.message);
    }
}

function cosineSimilarity(vecA, vecB) {
    let dot = 0.0;
    let magA = 0.0;
    let magB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

const pdfChatAI = async(bestMatch, question) => {
    try{

        const prompt = `You are an AI assistant. 
        Answer the user's question based on the provided context.
        \n\nContext:\n${bestMatch.content}\n\nUser Question:\n${question}\n\nAI Response:`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {role: 'system', content: 'You are a helpful assistant.'},
                {role: 'user', content: prompt }
            ],
            temperature: 0.7,
        });

        return response.choices[0].message.content || 'I am not sure how to answer that.';

    }
    catch (error) {
        console.log(error.message);
        return null;
    }
}

module.exports = {
    deleteFile,
    isBotExists,
    isConversationExists,
    createConversation,
    updateConversation,
    createChat,
    updateChat,
    getLastConversations,
    chatWithOpenAI,
    generateAIImage,
    isConversationExistWithUser,
    chatWithPdf,
    splitIntoChunks,
    processChunks,
    generateEmbedding,
    cosineSimilarity,
    pdfChatAI
}