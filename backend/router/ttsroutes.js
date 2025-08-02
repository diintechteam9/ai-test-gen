const express = require('express');
const router = express.Router();

const { textToSpeech } = require('../controller/testtospeechcontroller');

// Convert text to speech
router.post('/convert', textToSpeech);

module.exports = router; 