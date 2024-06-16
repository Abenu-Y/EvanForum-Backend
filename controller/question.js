const dbconnection = require('../db/db.config')
const {StatusCodes} = require('http-status-codes');
const generateUniqueId = require('generate-unique-id');



async function addnewquestion(req,res){

    const{ title, description,tag} = req.body;

    
    if (!title || !description || !tag) {

        return res.status(StatusCodes.BAD_REQUEST).json({msg:'please provide all requirements to post a question'})


    }

    const id2 = generateUniqueId({
        length: 4,
        useLetters: false,
        useNumbers:true
      })

   //  console.log(id2)

     try {

        const userID = req.user.userid
        const insertNewQuestion = `INSERT INTO questions (questionid,userid,title,description,tag) VALUES( ?,?,?,?,?)`
        await dbconnection.query(insertNewQuestion,[id2,userID,title,description,tag])
        
     } catch (error) {
        console.log(error)
     }

    return res.status(StatusCodes.OK).json({msg:`A new question asked by User ${req.user.username} is added to the database.`})

   
}

async function getallquestions(req,res){
  const {offset,limit} =req.params
//   console.log("offset" ,offset)
    try {
        
       const getAllQuestions = `SELECT
users.username,
questions.title,
questions.questionid,
COUNT(answers.answerid) AS num_answers
FROM
users
JOIN
questions ON users.userid = questions.userid
LEFT JOIN
answers ON questions.questionid = answers.questionid
GROUP BY
users.username,
questions.title,
questions.questionid
ORDER BY
    questions.id DESC
LIMIT ${limit} OFFSET ${offset}

 `

       const response = await dbconnection.query(getAllQuestions)
      //  console.log("response",response[0])
      //  console.log("end")/

       res.status(StatusCodes.OK).send(response[0])

    } catch (error) {
        console.log(error)
}

}

async function deleteQuestion(req,res){

    const QUestionID = req.params.QID;
    const {userid} =req.user
   //  console.log(QUestionID)

    
 
    try {
       const getQuestionRowData = `SELECT userid FROM questions  WHERE questionid = ?`
 
       const [singleQuestion] = await dbconnection.query(getQuestionRowData,[QUestionID])
      //  console.log("69",singleQuestion)
      //  console.log("here we go  the user id " ,singleQuestion[0].userid , " comapre with this ",userid)
      
 
       if(singleQuestion.length > 0 && userid == singleQuestion[0].userid ){
          const DeleteAnswerforThisQuestion = `DELETE   FROM answers WHERE questionid = ?`
          await dbconnection.query( DeleteAnswerforThisQuestion, [QUestionID])

          const DeleteQuestion = `DELETE   FROM questions WHERE questionid = ?`
          const response = await dbconnection.query(DeleteQuestion, [QUestionID])

         //  console.log("your request is recieved and the question is deleted", response[0])
          res.status(StatusCodes.OK).send(response)
       } else{
         //  console.log("mels",singleQuestion[0].length)
          res.status(StatusCodes.OK).json({msg:'you have not access to delete this question'})
       }
       
    } catch (error) {
        console.log(error)
    }
 }
 

 async function getQuestionTitleAndDescription(req,res){
   const QUestionID = req.params.QuestID;
   try {
       
      const getTitleandDescription = `SELECT  questions.title,questions.description ,questions.tag, users.username  FROM questions INNER JOIN users ON questions.userid = users.userid  WHERE questionid = ?`

      const response = await dbconnection.query( getTitleandDescription,[QUestionID])
      // console.log(response[0])

      res.status(StatusCodes.OK).send(response[0])

   } catch (error) {
       console.log(error)
}

}


 async function updateQuestion(req,res){

   const QUestionID = req.params.QID;
   const {userid} =req.user
   // console.log(QUestionID)

   const{ title, description,tag} = req.body;

    
    if (!title || !description || !tag) {

        return res.status(StatusCodes.BAD_REQUEST).json({msg:'please provide all requirements to post a question'})


    }

   try {
      const getQuestionRowData = `SELECT userid FROM questions  WHERE questionid = ?`

      const [singleQuestion] = await dbconnection.query(getQuestionRowData,[QUestionID])
      // console.log("69",singleQuestion)
      // console.log("here we go  the user id " ,singleQuestion[0].userid , " comapre with this ",userid)
     

      if(singleQuestion.length > 0 && userid == singleQuestion[0].userid ){
         const UpdateQuestionQuery = `UPDATE questions  SET title = ? , description = ? , tag = ? WHERE questionid = ?`
         await dbconnection.query( UpdateQuestionQuery, [title , description, tag, QUestionID])
    
         // console.log("your request approved and the question is updated !")
         res.status(StatusCodes.OK).json({msg:'succesfully updated !'})
      } else{
         console.log("mels",singleQuestion[0].length)
         res.status(StatusCodes.OK).json({msg:'you have not access to delete this question'})
      }
      
   } catch (error) {
       console.log(error)
   }
}


async function totalQuestion(req,res){
   try {
       const[ result] = await dbconnection.query('SELECT COUNT(questionid) AS num FROM questions') 
      //  console.log(result)

       res.status(StatusCodes.OK).json(result[0])

   } catch (error) {
      console.log(error)
        res.status(StatusCodes.BAD_REQUEST).send(error)
   }
}

async function searchedQuestions(req,res){
   try {
      const {searchWord}=req.body

      const SearchedQuest = `SELECT questions.title ,questions.questionid, users.username,COUNT(answers.answerid) AS num_answers FROM questions INNER JOIn users ON questions.userid=users.userid LEFT JOIN answers ON questions.questionid = answers.questionid WHERE questions.title LIKE ?   GROUP BY users.username, questions.title, questions.questionid`

       const[ result] = await dbconnection.query(SearchedQuest,[`%${searchWord}%`]) 
      //  console.log(result)

       res.status(StatusCodes.OK).json(result)

   } catch (error) {
      console.log(error)
        res.status(StatusCodes.BAD_REQUEST).send(error)
   }
}
module.exports = {addnewquestion,getallquestions,deleteQuestion,updateQuestion,getQuestionTitleAndDescription,totalQuestion,searchedQuestions}