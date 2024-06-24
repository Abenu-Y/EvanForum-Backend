const express = require('express')
require('dotenv').config()
const cors = require('cors')


const app = express()
const port =1234
// const port =3306

// const 
app.use(cors(
    {
        origin:true
    }
))
app.get('/', (req,res)=>{
    res.send(`Welcome to the Abene's Evan-Forum APP`)
})


//* dbConnection import
const dbConnection = require('./db/db.config')


// json middleware to extract json data
app.use(express.json())

// user routes middleware file import
const useRoutes = require('./routes/userRoute')
const questionRoutes = require('./routes/questionRoute')
const autoMiddleWare = require('./middleware/authMiddleWare')
const answerRoutes = require('./routes/answerRoute')


app.use('/api/users',useRoutes)


//question middleware
app.use('/api/questions',autoMiddleWare,questionRoutes)




//answer middleware 

app.use('/api/answers',autoMiddleWare, answerRoutes)




//* register user
// app.post('/api/users/register',(req,res)=>{
//     res.send('register user')
// })


//? login user
// app.post('/api/users/login',(req,res)=>{
//     res.send('log in user')
// })


//todo check user
// app.get('/api/users/check',(req,res)=>{
//     res.send('register user')
// })


async function start(){
    try {

        const result =  await dbConnection.execute('select "test" ')
        // console.log(result)

        await app.listen(port,()=>{console.log('server is listening at port 1234')})
        console.log('database connection is established !')
        console.log(`app is running @ ${port}`)
         
     } catch (err) {
         
         console.log('err',err.message)
     }
     
}

start()

// app.listen(port, (err)=>{
//   if(err){
//     console.log(err.message)
//   }
//   else{
//     console.log(`app is running @ port ${port}`)
//   }
// })