const express = require('express')
const router = express.Router()


//authentication middleware

// const authMiddleWare = require('../middleware/authMiddleWare')

const {addnewquestion,getallquestions,deleteQuestion, updateQuestion,getQuestionTitleAndDescription,totalQuestion} = require('../controller/question')

router.get('/all-questions', (req,res)=>{
      res.send('all-questions is here ')
})


router.post('/new-question', addnewquestion)
router.delete('/delete/:QID',deleteQuestion)
router.get('/getallquestions/:offset/:limit',getallquestions)
router.get('/titdescription/:QuestID',getQuestionTitleAndDescription)
router.put('/update/:QID',updateQuestion)
router.get('/noOfquestion',totalQuestion)


module.exports = router
