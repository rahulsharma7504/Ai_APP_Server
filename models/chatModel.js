const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Conversation'
    },
    chat_bot_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ChatBot'
    },
    user_message:{
        type: String,
        default: ''
    },
    ai_message:{
        type: String,
        default: ''
    },
    type: {
        type: Number,
        default: 0,
        enum: [ 0, 1] // 0-> AI Text, 1 -> AI Image
    }

},
{
    timestamps: { createdAt: true, updatedAt: true }
}
);
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;