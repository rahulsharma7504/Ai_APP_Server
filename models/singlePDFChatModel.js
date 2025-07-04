const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    pdf_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SinglePdf'
    },
    user_message:{
        type: String,
        default: ''
    },
    ai_message:{
        type: String,
        default: ''
    },
},
{
    timestamps: { createdAt: true, updatedAt: true }
}
);

const SinglePdfChat = mongoose.model('SinglePdfChat', chatSchema);

module.exports = SinglePdfChat;