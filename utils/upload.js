const multer = require("multer");
const path = require("path");

const allowMimeTypes = [
    "audio/mp3","video/mp4","audio/mpeg","audio/mpga","audio/m4a",
    "audio/wav","video/webm"
];

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname, "../public/speech"));
    },
    filename: function(req, file, cb){
        cb(null, `audio_${Date.now()}_${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if(allowMimeTypes.includes(file.mimetype)){
        cb(null, true);
    }
    else{
        cb(new Error("Invalid file type. Allowed: mp3, mp4, mpeg, mpga, m4a, wav, and webm"), false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 }, //25 MB
}).single("audio");

const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if(err){
            return res.status(400).json({
                success: false,
                message: err.message
            })
        }

        next();
    });
}

module.exports = uploadMiddleware;