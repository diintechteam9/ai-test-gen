require('dotenv').config();

const generatePrompt = async (req, res) => {
    const { storyScript } = req.body;
    
    if (!storyScript) {
        return res.status(400).json({ 
            error: 'storyScript is required.' 
        });
    }

    const models = [
        'anthropic/claude-3-haiku'
    ];

    async function generateImagePrompts(storyScript) {
        const imagePromptGenerator = `Generate image prompts for each sentence in this story:

Story: "${storyScript}"

For each sentence in the story, create a detailed image prompt that would generate a visual representation of that sentence. 

Requirements:
1. Split the story into individual sentences
2. For each sentence, create a descriptive image prompt
3. Make prompts detailed and visually descriptive
4. Use art style: "digital art, educational illustration, clean and colorful"
5. Number each prompt in order

Format the response as JSON with this structure:
{
  "imagePrompts": [
    {
      "prompt": "Detailed image prompt for first sentence"
    },
    {
      "prompt": "Detailed image prompt for second sentence"
    }
  ]
}

Make the image prompts descriptive, educational, and suitable for generating illustrations.`;

        for (const model of models) {
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model,
                        messages: [{ role: 'user', content: imagePromptGenerator }],
                        max_tokens: 2000,
                        temperature: 0.7
                    })
                });
                
                if (!response.ok) continue;
                
                const data = await response.json();
                const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
                    ? data.choices[0].message.content
                    : '';
                    
                if (content) {
                    try {
                        // Try to parse as JSON
                        const parsed = JSON.parse(content);
                        if (parsed.imagePrompts && Array.isArray(parsed.imagePrompts)) {
                            return parsed.imagePrompts;
                        }
                    } catch (parseErr) {
                        // If JSON parsing fails, create prompts from text
                        console.log('Failed to parse JSON, creating prompts from text');
                        return createImagePromptsFromText(content, storyScript);
                    }
                }
            } catch (err) {
                console.error('Error with model:', model, err);
                continue;
            }
        }
        return [];
    }

    function createImagePromptsFromText(text, storyScript) {
        // Split story into sentences
        const sentences = storyScript.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        
        const imagePrompts = [];
        
        sentences.forEach((sentence, index) => {
            const cleanSentence = sentence.trim();
            if (cleanSentence) {
                imagePrompts.push({
                    number: index + 1,
                    sentence: cleanSentence,
                    prompt: `Digital art illustration of: ${cleanSentence}, educational style, clean and colorful, suitable for learning materials`
                });
            }
        });
        
        return imagePrompts;
    }

    try {
        const imagePrompts = await generateImagePrompts(storyScript);
        
        if (imagePrompts.length === 0) {
            return res.status(500).json({ 
                error: 'Failed to generate image prompts. Please try again.' 
            });
        }

        res.json(imagePrompts);
    } catch (err) {
        console.error('Generate image prompts error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { generatePrompt };