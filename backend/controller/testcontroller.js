const { json } = require('express');
const Test=require('../models/test');

createTest=async(req,res)=>{
    try {
        const test=new Test(req.body);
        await test.save();
        res.status(201).json(test);
    } catch (err) {
        res.status(400).json({error:err.message});
        
    }
};


getAllTest=async(req,res)=>{
    try {
        const all=await Test.find();
        res.json(all);
        
    } catch (err) {
        res.status(500).json({error:err.message});  
    }
}


updateTest=async(req,res)=>{
 try {
    const test= await Test.findByIdAndUpdate(req.params.id,req.body,{new:true});
    if(!test) return res.status(404).json({error:'Test not found'});
    res.json(test);
    
 } catch (err) {
    res.status(500).json({error:err.message});
    
 }
}
deleteTest=async(req,res)=>{
    try {
        const test=await Test.findByIdAndDelete(req.params.id);
        if(!test){
            return res.status(404).json({error:'Test not found'});
        }
        res.json({message:'Test deleted successfully'});
        
    } catch (err) {
        res.status(500).json({error:err.message});
        
    }
}

module.exports={createTest, getAllTest,updateTest, deleteTest};