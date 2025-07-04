const mongoose = require('mongoose');

const textToSpeech = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    text:{
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

textToSpeech.virtual("fullUrl").get(function(){
    const baseUrl = process.env.BASE_URL;
    return this.file_path.startsWith('http') ? this.file_path : `${baseUrl}${this.file_path}`;
});

textToSpeech.set('toJSON', {virtuals: true});
textToSpeech.set('toObject', {virtuals: true});

const TextToSpeech = mongoose.model('TextToSpeech', textToSpeech);

module.exports = TextToSpeech;