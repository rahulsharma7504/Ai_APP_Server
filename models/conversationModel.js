const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    chat_bot_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ChatBot'
    },
    last_message:{
        type: String,
        default: ''
    }

},
{
    timestamps: { createdAt: true, updatedAt: true }
}
);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;