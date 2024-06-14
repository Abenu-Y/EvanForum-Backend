const dbconnection = require('../db/db.config')
const {StatusCodes} = require('http-status-codes');


async function addnewanswer(req,res){

    const{answer,questionID} = req.body;
    
    if (!answer) {

        return res.status(StatusCodes.BAD_REQUEST).json({msg:'please provide the answer !'})

    }
  

 try {
    const userID = req.user.userid

    const insertNewAnswer = `INSERT INTO answers (userid,questionid,answer) VALUES( ?,?,?)`
    await dbconnection.query(insertNewAnswer,[userID,questionID,answer])

    return res.status(StatusCodes.OK).json({msg:`"A new question from User A and its answer from ${req.user.username}  are added to the database.`})
 } catch (error) {
    console.log(error)
 }
   
}

async function getAnswers(req,res){

   const QUestionID = req.params.answerdetail;
   // console.log(QUestionID)

   try {
      const getanswersANDusers = `SELECT  answers.answer,answers.answerid,  users.username FROM answers INNER JOIN users ON users.userid = answers.userid WHERE answers.questionid = ${QUestionID}`

      const [AnswerforspecicQuestion] = await dbconnection.query(getanswersANDusers)
     

      if(!AnswerforspecicQuestion.length){

         const getQuestiontitleANDdetail = `SELECT title , description from questions WHERE questionid =?`
         const [response] = await dbconnection.query(getQuestiontitleANDdetail, [QUestionID])
         // console.log("response", response[0])
         res.status(StatusCodes.OK).send(response)
      } else{
         console.log("mels",AnswerforspecicQuestion.length)
         res.status(StatusCodes.OK).send(AnswerforspecicQuestion)
      }

      
   } catch (error) {
       console.log(error)
   }
}

async function deleteSpecificAnswer(req,res){

   const QUestionID = req.params.ID;
   const {userid} =req.user
   // console.log(QUestionID)
   const AID=req.params.AnsID;

   try {
      const getAnswers = `SELECT userid FROM answers  WHERE questionid = ?`

      const [AnswerforspecicQuestion] = await dbconnection.query(getAnswers,[QUestionID])
      // console.log("69",AnswerforspecicQuestion)
      // console.log("here we go  the user id " ,AnswerforspecicQuestion[0].userid , " comapre with this ",userid)
      let flag = false ; 

      for(let i = 0; i<AnswerforspecicQuestion.length ; i++ ){
         if(AnswerforspecicQuestion[i].userid === userid){
           flag = true;
           break;
         }
       }

      if(AnswerforspecicQuestion.length > 0 && flag){

         const DeleteAnswer = `DELETE   FROM answers WHERE questionid = ? AND answerid = ?`
         const response = await dbconnection.query(DeleteAnswer, [QUestionID,AID])
         // console.log("your request is recieved and the answer is deleted", response[0])
         res.status(StatusCodes.OK).send(response)
      } else{
         // console.log("mels",AnswerforspecicQuestion[0].length)
         res.status(StatusCodes.OK).json({msg:'you have not access to delete this answer'})
      }
      
   } catch (error) {
       console.log(error)
   }
}


async function updateSpecificAnswer(req,res){
   const{newAnswer,AID} = req.body;
   const selectID = req.params.UID;
   const {userid} =req.user
   console.log(selectID )

   if (!newAnswer) {
      return res.status(400).json({ error: 'New answer is required' });
  }

   try {
      const IdentifyUser = `SELECT userid FROM answers  WHERE answers.questionid = ?`

      const [UserIdentification] = await dbconnection.query(IdentifyUser,[selectID ])
      // console.log("69",UserIdentification)
      // console.log("here we go  the user id " ,UserIdentification[0].userid , " comapre with this ",userid)
      let flag = false ; 

      for(let i = 0; i<UserIdentification.length ; i++ ){
         if(UserIdentification[i].userid === userid){
           flag = true;
           break;
         }
       }
       
      // console.log(flag)
      if(UserIdentification.length > 0 && flag){

         const UpdateAnswerQuery = `UPDATE answers SET answer = ? WHERE questionid = ? AND answerid =? `
         const [result] = await dbconnection.query(UpdateAnswerQuery, [newAnswer, selectID,AID])
         // console.log("your request is to update your answer is approved", result)
         res.status(StatusCodes.OK).json({msg:'the answer is updated! '})
      } else{
         // console.log("mels",UserIdentification[0].length)
         res.status(StatusCodes.OK).json({msg:'you have not access to update this answer'})
      }
      
   } catch (error) {
       console.log(error)
   }
}



module.exports = {addnewanswer,getAnswers,deleteSpecificAnswer,updateSpecificAnswer}