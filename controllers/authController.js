const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async(req, res) => {

    try{

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array() 
            });
        }

        const { name, email, password } = req.body;
        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            image: 'uploads/'+req.file.filename,
            password: encryptedPassword
        });
        await newUser.save();

        return res.status(200).json({
            success: true,
            msg: "Register Successfully!",
            data: newUser 
        });

    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

const generateAccessToken = async(user) => {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2h" });
    return token;
}

const generateRefreshToken = async(user) => {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "4h" });
    return token;
}

const login = async(req, res) => {

    try{

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array() 
            });
        }

        const { email, password } = req.body;

        const userData = await User.findOne({ email });
        userData.image = userData.image.startsWith('http') ? userData.image : `${process.env.BASE_URL}${userData.image}`

        if(!userData){
            return res.status(400).json({
                success: false,
                msg: 'Email and Password is incorect!',
            });
        }

        const passwordMatch = await bcrypt.compare(password, userData.password);

        if(!passwordMatch){
            return res.status(400).json({
                success: false,
                msg: 'Email and Password is incorect!',
            });
        }

        const accessToken = await generateAccessToken({ user: userData });
        const refreshToken = await generateRefreshToken({ user: userData });

        return res.status(200).json({
            success: true,
            msg: "Loging Successfully!",
            data: userData,
            accessToken,
            refreshToken
        });

    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

const profile = async(req, res) => {

    try{

        const userData = req.user;

        return res.status(200).json({
            success: true,
            msg: "User Profile Data!",
            data: userData 
        });

    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }

};

module.exports = {
    register,
    login,
    profile
}