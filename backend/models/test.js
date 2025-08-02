const mongoose=require('mongoose');

const TestSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    duration:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    tags:{
        type:Array,
        required:true,
    },
    coverimage:{
        type:String,
        required:true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model('Tests',TestSchema);