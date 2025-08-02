const express=require('express');
const {generateQuestion}=require('../controller/generatequestioncontroller');
const router=express.Router();

// POST /generate-questions
router.post('/generate-question',generateQuestion); 

module.exports = router;