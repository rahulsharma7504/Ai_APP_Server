const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    image:{
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
const ImageRecognition = mongoose.model('ImageRecognition', schema);

module.exports = ImageRecognition;