const { validationResult } = require('express-validator');
const fs = require("fs");
const pdfParse = require("pdf-parse");
const SinglePDFModel = require("../models/singlePDFModel");
const PdfFileModel = require("../models/pdfFileModel");
const SinglePDFChatModel = require("../models/singlePDFChatModel");
const PdfConversationModel = require("../models/pdfConversationModel");
const PdfChatModel = require("../models/pdfChatModel");
const FileEmbedding = require("../models/fileEmbeddingModel");
const helper = require("../utils/helper")

const savePdfFile = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user_id = req.user._id;

        const bufferData = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(bufferData);
        const pdfText = pdfData.text;

        const pdfCreateData = await SinglePDFModel.create({
            user_id,
            content: pdfText,
            file_name: req.file.filename,
            file_path: 'pdfs/'+req.file.filename
        })


        return res.status(200).json({
            success: true,
            msg: "PDF Uploaded Successfully!",
            data: pdfCreateData
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const getPdfFiles = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user_id = req.user._id;

        const pdfData = await SinglePDFModel.find({
            user_id
        });


        return res.status(200).json({
            success: true,
            msg: "PDF data!",
            data: pdfData
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const chatWithPdf = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user_id = req.user._id;
        const { pdf_id, question } = req.body;
        
        const pdfData = await SinglePDFModel.findOne({
            _id: pdf_id,
            user_id
        });

        if(!pdfData){
            return res.status(200).json({
                success: false,
                msg: "PDF doesn't exist!",
            });
        }

        const ai_message = await helper.chatWithPdf(pdfData.content, question);

        const pdfChat = await SinglePDFChatModel.create({
            user_id,
            pdf_id,
            user_message: question,
            ai_message
        });

        return res.status(200).json({
            success: true,
            msg: "PDF Chat Data",
            data: pdfChat
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const getSinglePDFChats = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user_id = req.user._id;
        const { pdf_id } = req.query;

        const pdfData = await SinglePDFModel.findOne({
            _id: pdf_id,
            user_id
        });

        if(!pdfData){
            return res.status(400).json({
                success: false,
                msg: "PDF not Found!",
            });
        }
        
        const pdfChats = await SinglePDFChatModel.find({
            pdf_id,
            user_id
        }).sort({ createdAt: 1 });


        return res.status(200).json({
            success: true,
            msg: "PDF data!",
            data: pdfChats
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const savePDFs = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user_id = req.user._id;

        if(!req.files || req.files.length === 0){
            return res.status(400).json({
                success: false,
                msg: "No files uploaded",
            });
        }

        const savedFiles = await Promise.all(req.files.map(async(file) => {
            const newPdfEntry = new PdfFileModel({
                user_id,
                file_name: file.filename,
                file_path: 'pdfs/'+file.filename
            });

            const savePdf = await newPdfEntry.save();

            const dataBuffer = fs.readFileSync(file.path);
            const pdfData = await pdfParse(dataBuffer);
            const pdfText = pdfData.text;
            const chunks = helper.splitIntoChunks(pdfText, 150);
            console.log(chunks);
            await helper.processChunks(chunks, savePdf);
        }));


        return res.status(200).json({
            success: true,
            msg: "PDFs Uploaded Successfully!"
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const chatWithMultiplePDF = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user_id = req.user._id;
        const { question, conversation_id } = req.body;

        let chatConversationId = conversation_id;
        if(!chatConversationId){
            const newConversation = await PdfConversationModel.create({
                user_id,
                last_message: question
            });

            chatConversationId = newConversation._id;
        }
        else{
            await PdfConversationModel.findByIdAndUpdate(chatConversationId, {
                last_message: question
            });
        }

        const newChat = await PdfChatModel.create({
            user_id,
            conversation_id: chatConversationId,
            user_message: question,
            ai_message: ''
        });

        const queryEmbedding = await helper.generateEmbedding(question);

        const embeddings = await FileEmbedding.find({
            pdf_id:{
                $in: await PdfFileModel.find({ user_id }).distinct("_id")
            }
        });

        let bestMatch = null;
        let highestSimilarity = -1;
        for(const embedding  of embeddings){
            const similarity = helper.cosineSimilarity(embedding.embedding, queryEmbedding);
            if(similarity > highestSimilarity){
                highestSimilarity = similarity;
                bestMatch = embedding;
            }
        }

        if(!bestMatch){
            const contentNotFound = "No relevent content found.";
            await PdfConversationModel.findByIdAndUpdate(chatConversationId, {
                last_message: contentNotFound
            });

            await PdfChatModel.findByIdAndUpdate(newChat._id,{
                ai_message: contentNotFound
            });
            
            return res.status(200).json({
                success: true,
                id: newChat._id,
                message: contentNotFound,
                conversation_id: chatConversationId
            });
        }

        const aiReply = await helper.pdfChatAI(bestMatch, question);

        await PdfConversationModel.findByIdAndUpdate(chatConversationId, {
            last_message: aiReply
        });

        const updatedChat = await PdfChatModel.findByIdAndUpdate(
            newChat._id,
            { $set: { ai_message: aiReply } },
            { new:true }
        );

        return res.status(200).json({
            success: true,
            id: newChat._id,
            data: updatedChat,
            conversation_id: chatConversationId
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const getPdfs = async (req, res) => {

    try {

        const user_id = req.user._id;
        const { pdf_id } = req.query;
        let data = null;
        if(pdf_id){
            data = await PdfFileModel.findOne({
                _id: pdf_id
            }).populate('embeddings');
        }else{
            data = await PdfFileModel.find({
                user_id
            }).populate('embeddings');
        }

        return res.status(200).json({
            success: true,
            msg: "PDFs data!",
            data:data
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const updateChunk = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { id, text } = req.body;
        const chunkData = await FileEmbedding.findOne({_id: id});

        if(!chunkData){
            return res.status(400).json({
                success: false,
                msg: "Chunk not Found!",
            });
        }
        const embedding = await helper.generateEmbedding(text);
        chunkData.embedding = embedding;
        chunkData.content = text;
        const updatedData = await chunkData.save();

        return res.status(200).json({
            success: true,
            msg: "Chunk Updated Successfully!",
            data:updatedData
        });

    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
}

const deletePdfData = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { id, is_pdf } = req.body;
        if(is_pdf == 1){
            const deletePdf = await PdfFileModel.findByIdAndDelete(id);
            if(!deletePdf){
                return res.status(400).json({
                    success: false,
                    msg: "PDF not Found!",
                });
            }

            await FileEmbedding.deleteMany({
                pdf_id: id
            });

            return res.status(200).json({
                success: true,
                msg: "PDF Deleted Successfully!",
                data: deletePdf
            });

        }

        const deletedData = await FileEmbedding.findByIdAndDelete(id);

        if(!deletedData){
            return res.status(400).json({
                success: false,
                msg: "Chunk not Found!",
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Chunk Deleted Successfully!",
            data:deletedData
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

        const user_id = req.user._id;

        const data = await PdfConversationModel.find({
            user_id,
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

const getConversationMessages = async (req, res) => {

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

        const isExists = await PdfConversationModel.findOne({
            _id:conversation_id, 
            user_id
        });

        if(!isExists){
            return res.status(200).json({
                success: false,
                msg: "Conversation doesn't exists!",
            });
        }

        const chats = await PdfChatModel.find({
            conversation_id
        })
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

module.exports = {
    savePdfFile,
    getPdfFiles,
    chatWithPdf,
    getSinglePDFChats,
    savePDFs,
    chatWithMultiplePDF,
    getPdfs,
    updateChunk,
    deletePdfData,
    getConversations,
    getConversationMessages
}