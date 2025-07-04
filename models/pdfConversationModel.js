const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
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
const PdfConversation = mongoose.model('PdfConversation', conversationSchema);

module.exports = PdfConversation;