
//dbconnection import 

const dbconnection = require('../db/db.config')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {StatusCodes} = require('http-status-codes');
// const { use } = require('../routes/userRoute');

//* for reset password

const crypto = require('crypto');
const nodemailer = require('nodemailer');

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


// Configure Nodemailer
// console.log(process.env.AdminEmail, process.env.AdminPassword)
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.AdminEmail,
//     pass: process.env.AdminPassword
//   }
// });

// async function reset(req, res) {
//     // console.log('here we come')
//     const email = req.body.email;
//     console.log(email)


//   const token = crypto.randomBytes(20).toString('hex');
//   const expires = new Date(Date.now() + 3600000); // 1 hour

//   const query = 'UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE email = ?';


//     try {
//         const response = await dbconnection.query(query, [token, expires, email])
 
//         if (response[0].affectedRows === 0) {
//               return res.status(StatusCodes.BAD_REQUEST).send('Email not found or error updating user');
//             }


//           const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//               user: process.env.AdminEmail,
//               pass: process.env.AdminPassword
//             }
//           });
          
//             const resetUrl = `http://localhost:3000/reset/${token}`;
//             const mailOptions = {
//               from: process.env.AdminEmail,
//               to: email,
//               subject: 'Password Reset',
//               text: `Click the following link to reset your password: ${resetUrl}`
//             };
          
//             transporter.sendMail(mailOptions, (error, info) => {
//               if (error) {
//                 return res.status(500).send('Error sending email');
//               }
//               res.send('Password reset email sent!');
//             });

            
//     } catch (error) {
//        console.log(error)
//        return res.status(StatusCodes.BAD_GATEWAY).json({msg:'something went wrong!'})
//     }

//   // console.log('here we go ...')
// }
 
  
async function sendToken(req, res) {
  const email = req.body.email;
  console.log('Email received for password reset:', email);

  const token = crypto.randomBytes(20).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour

  if(!email){
    return res.status(StatusCodes.BAD_REQUEST).send('bado email');
  }

  const query = 'UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE email = ?';

  try {
    const [response] = await dbconnection.query(query, [token, expires, email]);
    
    if (response.affectedRows === 0) {
      return res.status(StatusCodes.BAD_REQUEST).send('Email not found or error updating user');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.AdminEmail,
        pass: process.env.PASS
      }
    });

    const mailOptions = {
      from: process.env.AdminEmail,
      to: email,
      subject: 'Password Reset',
      text: `Insert this Reset Key in the form :- ${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email');
      }
      console.log('Password reset email sent:', info.response);
      res.send('Password reset email sent!');
    });
    
  } catch (error) {
    console.error('Error in reset function:', error);
    return res.status(StatusCodes.BAD_GATEWAY).json({ msg: 'Something went wrong!' });
  }
}



async function reset(req,res){

    const{newPassword,token} =req.body;

   
 try {

      const [result] = await dbconnection.query(`SELECT password, resetToken, resetTokenExpires FROM users WHERE resetToken = ?`,[token])

      if(result[0]?.resetToken === token){
        console.log('valid user , u can go update password')
        const query = 'UPDATE users SET password =?  WHERE resetToken = ?';

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await dbconnection.query(query,[hashedPassword,token])

//update resetToken
     const resetquery = 'UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE resetToken = ?';
     await dbconnection.query(resetquery,[' ',' ',result[0].resetToken])
     return res.status(StatusCodes.CREATED).json({msg:'operation successfully completed'})
   
      }

      return res.status(StatusCodes.BAD_REQUEST).json({msg:'use the latest reset key or the reset key provided is invalid.'})

    
      
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.BAD_GATEWAY).json({ msg: 'Something went wrong!' });
    }
    

}






module.exports = { register, login, checkUser ,reset,sendToken}