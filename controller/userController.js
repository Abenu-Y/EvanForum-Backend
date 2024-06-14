
//dbconnection import 

const dbconnection = require('../db/db.config')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {StatusCodes} = require('http-status-codes');
// const { use } = require('../routes/userRoute');

async function register(req, res) {

    const { username, firstname, lastname, password, email } = req.body;

    if (!username || !firstname || !lastname || !password || !email) {

        return res.status(400).json({msg:'please provide all requirements'})

    }
    

    try {

        //!check if the user is already exists 
        const checkUserData = `SELECT username, userid from users WHERE username =? or email = ?`
        const [user]= await dbconnection.query(checkUserData,[username, email])
        // return res.json({user:user})
        
        // console.log(user)

        if(user.length > 0 ){
            return res.status(StatusCodes.BAD_REQUEST).json({msg:'user already registered'})
        }

        if(password.length < 10){
            return res.status(StatusCodes.BAD_REQUEST).json({msg:'password is too short'})
        }

        //* encrypt password
             
        //* generate 
            const salt = await bcrypt.genSalt(10)
         const hashedPassword = await bcrypt.hash(password, salt)
         

        //todo insert new user to db
        const enterUserData = `INSERT INTO users (username, FirstName, LastName, email, password) VALUES ( ?,?,?,?,?)`
        await dbconnection.query(enterUserData,[username,firstname, lastname, email, hashedPassword] )

        return res.status(StatusCodes.CREATED).json({msg:'new user created'})
        
    } catch (error) {
        console.log(error.message)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"something went wrong, try again later"})
    }

}

async function login(req, res) {
    const {email, password} = req.body;
    // console.log(email,password)

    if(!email || !password){
        return res.status(StatusCodes.BAD_REQUEST).json({msg:'please enter all required fields'})
    }

    try {

        //!check if the entered email is exists 
        const checkUserData = `SELECT username, userid, password  from users WHERE  email = ? `
        const [user]= await dbconnection.query(checkUserData,[email])

        if(user.length < 1){
            return res.status(StatusCodes.BAD_REQUEST).json({msg:'invalid credential'})
        }
        
        // else{
        //     return res.json({user:user})
        // }

        //? check/compare hashed password with user entered passowrd
      let isMatch =   await bcrypt.compare(password,user[0].password)
    //   console.log(isMatch) <= boolean

      if(!isMatch){
            //   res.send('login')  
          return res.status(StatusCodes.BAD_REQUEST).json({msg:'invalid credential or passsword'})

      }
    //   else{
    //       return res.status(StatusCodes.BAD_REQUEST).json({msg:'invalid credential or passsword'})
    //   }


    //* Destructure 

    const username = user[0].username
    const userid = user[0].userid
    
    const token  = jwt.sign({username, userid},process.env.JWT_SECRET,{expiresIn:'1d'})


         //console.log(user)
         return res.status(StatusCodes.OK).json({msg:'user succesfully logged in ',token,username})

        //return res.json({user:user})
        
    } catch (error) {
        console.log(error.message)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:"something went wrong, try again later"})
    }
    //res.send('login')
}


async function checkUser(req, res) {
    const { username , userid } = req.user
    res.status(StatusCodes.OK).json({msg:'valid user', username, userid })
    // res.send('check user')
}


module.exports = { register, login, checkUser }