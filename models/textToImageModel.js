const mongoose = require('mongoose');

const textToImage = new mongoose.Schema({

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
    text:{
        type: String,
        required: true
    },
    size:{
        type: String,
        required: true
    },
    file_path:{
        type: String,
        required: true
    }
},
{
    timestamps: { createdAt: true, updatedAt: true }
}
);

textToImage.virtual("fullImageUrl").get(function(){
    const baseUrl = process.env.BASE_URL;
    return this.file_path.startsWith('http') ? this.file_path : `${baseUrl}${this.file_path}`;
});

textToImage.set('toJSON', {virtuals: true});
textToImage.set('toObject', {virtuals: true});

const TextToImage = mongoose.model('TextToImage', textToImage);

module.exports = TextToImage;