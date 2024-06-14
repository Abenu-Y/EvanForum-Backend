const mysql = require('mysql2')

const dbConnection = mysql.createPool(
    {
        user:process.env.USER,
        host:'localhost',
        password:process.env.PASSWORD,
        database:process.env.DATABASE,
        connectionLimit:10
        
    }
)

//console.log(process.env.USER, " " , process.env.PASSWORD, " " , process.env.DATABASE, "  " , process.env.JWT_SECRET)
console.log(process.env.SOME)
// dbConnection.execute("select 'test' ",(err,result)=>{
//     if(err){
//         console.log(err.message)
//         // console.log(err)
//     }else{
//         console.log(result)
//     }
// })


module.exports = dbConnection.promise()