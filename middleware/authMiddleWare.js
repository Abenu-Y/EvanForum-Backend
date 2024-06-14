const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

async function autoMiddleWare(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ msg: "NO AUTORIZATION" });
    }

    const token = authHeader.split(' ')[1]
    // console.log(authHeader, " ****** " , token)
    // console.log(token)
    if(token == 'null'){
       return   res.status(StatusCodes.UNAUTHORIZED).json({msg:'NULL AUTORIZATION'})
    }

    try {
        const {username, userid}= jwt.verify(token, process.env.JWT_SECRET);
        req.user ={username,userid}
        // console.log(req.user)
        next()
        // return res.status(StatusCodes.OK).json({data})

    } catch (error) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ msg: "INVALID USER" });
    }
}


module.exports = autoMiddleWare