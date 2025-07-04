const mongoose = require('mongoose');

const chatBotSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
    },
    prompt_message: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        enum: [ 0, 1] // 0-> Disabled, 1 -> Enabled
    },
    type: {
        type: Number,
        default: 0,
        enum: [ 0, 1] // 0-> Text Bots, 1 -> Image Bots
    }
},
{
    timestamps: { createdAt: true, updatedAt: true }
}
);

chatBotSchema.virtual("fullImageUrl").get(function(){
    const baseUrl = process.env.BASE_URL;
    return this.image.startsWith('http') ? this.image : `${baseUrl}${this.image}`;
});

chatBotSchema.set('toJSON', {virtuals: true});
chatBotSchema.set('toObject', {virtuals: true});


const ChatBot = mongoose.model('ChatBot', chatBotSchema);

module.exports = ChatBot;