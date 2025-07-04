const mongoose = require('mongoose');

const speechToText = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    text:{
        type: String,
        default: ''
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

speechToText.virtual("fullUrl").get(function(){
    const baseUrl = process.env.BASE_URL;
    return this.file_path.startsWith('http') ? this.file_path : `${baseUrl}${this.file_path}`;
});

speechToText.set('toJSON', {virtuals: true});
speechToText.set('toObject', {virtuals: true});

const SpeechToText = mongoose.model('SpeechToText', speechToText);

module.exports = SpeechToText;