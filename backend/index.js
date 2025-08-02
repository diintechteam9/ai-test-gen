const express=require('express');
const cors = require('cors');
const dotenv= require('dotenv');
const connectDB=require('./config/db');
require('dotenv').config();

const app=express();

// middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const generateQuestionRoute = require('./router/generatequestionroutes');
const generateStoryRoute=require('./router/generatestoryroutes');
const testRoute=require('./router/testroutes');
const ttsRoute=require('./router/ttsroutes');
const promptRoute=require('./router/promptroutes');




app.use('/api/question', generateQuestionRoute);
app.use('/api/story',generateStoryRoute);
app.use('/api/test',testRoute);
app.use('/api/tts',ttsRoute);
app.use('/api/prompt',promptRoute);

// Basic error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

const PORT=4000;


connectDB().then(()=>{
  app.listen(PORT,()=>{
    console.log(`server is running on PORT: ${PORT}`);
});
});
