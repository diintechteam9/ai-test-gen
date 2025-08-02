const express=require('express');
const {generateStory}=require('../controller/generatestorycontroller');
const router=express.Router();


router.post('/generate-story',generateStory);


module.exports=router;