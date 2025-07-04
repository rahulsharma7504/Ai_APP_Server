const multer = require("multer");
const path = require("path");

const allowMimeTypes = [
    "image/jpeg","image/png","image/gif","image/webp"
];

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname, "../public/uploads"));
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
        cb(new Error("Invalid file type. Allowed: jpeg, png, gif, webp"), false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, //10 MB
}).single("image");

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