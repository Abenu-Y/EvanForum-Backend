const express = require('express')
const router = express.Router()


const {addnewanswer,getAnswers, deleteSpecificAnswer,updateSpecificAnswer} = require('../controller/answer')


router.post('/new-answer', addnewanswer)
router.get('/:answerdetail',getAnswers)
router.delete('/delete/:ID/:AnsID',deleteSpecificAnswer)
router.put('/update/:UID',updateSpecificAnswer)

module.exports = router