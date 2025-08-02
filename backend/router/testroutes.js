const express=require('express');
const router=express.Router();

const {createTest, getAllTest, updateTest,deleteTest}=require('../controller/testcontroller');

router.post('/generate-test',createTest);
router.get('/all-test',getAllTest);
router.delete('/delete-test/:id',deleteTest);
router.put('/update-test/:id',updateTest);

module.exports = router;
