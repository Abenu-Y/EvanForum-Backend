const express = require('express')
const router = express.Router()


//authentication middleware

const authMiddleWare = require('../middleware/authMiddleWare')

//import user controller
const  {register,login,checkUser,reset, sendToken} = require('../controller/userController')


//* register user
router.post('/register',register)

//? login user
router.post('/login',login)

//!reset
router.post('/reset',sendToken)
router.post('/reset/update',reset)


//todo check user
router.get('/check',authMiddleWare ,checkUser)

module.exports = router