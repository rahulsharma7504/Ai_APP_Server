const jwt = require('jsonwebtoken');

const verifyToken = async(req, res, next) => {

    const token = req.body.token || req.query.token || req.headers["authorization"];
    
    if(!token){
        return res.status(403).json({
            success: false,
            msg: 'A token is required for authentication',
        });
    }
    try{

        const bearer = token.split(' ');
        const bearerToken = bearer[1];

        const decodedData = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET);
        if(!decodedData.user.is_admin){
            return res.status(403).json({
                success: false,
                msg: "Oops! You don't have permission to access this route!",
            });
        }
        req.user = decodedData.user;
    }
    catch(error){
        return res.status(401).json({
            success: false,
            msg: 'A token is required for authentication',
        });
    }

    return next();

};

module.exports = verifyToken;