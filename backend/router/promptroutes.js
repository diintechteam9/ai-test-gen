const express = require('express');
const router = express.Router();

const { generatePrompt } = require('../controller/generatepromptcontroller');

// Generate image prompts from story script
router.post('/generate-prompt', generatePrompt);

module.exports = router; 