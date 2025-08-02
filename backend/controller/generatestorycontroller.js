require('dotenv').config();

const generateStory = async (req, res) => {
    const { question, options, solution } = req.body;
    
    if (!question || !options || !solution) {
        return res.status(400).json({ 
            error: 'question, options, and solution are required.' 
        });
    }

    if (!Array.isArray(options) || options.length !== 4) {
        return res.status(400).json({ 
            error: 'options must be an array with exactly 4 elements.' 
        });
    }

    const models = [
        'anthropic/claude-3-haiku'
    ];

    async function generateStoryFromQuestion(question, options, solution) {
        const storyPrompt = `Create a short and simple educational story based on this question:

Question: "${question}"
Options: 
A) ${options[0]}
B) ${options[1]}
C) ${options[2]}
D) ${options[3]}
Correct Answer: ${solution}

Generate a brief, engaging story that:
1. Is short and simple (2-3 sentences maximum)
2. Incorporates the question concept naturally
3. Makes learning fun and memorable
4. Is easy to understand for students
5. Helps reinforce the educational concept

Return ONLY the story content as plain text, no JSON formatting, no titles, no metadata. Just the story itself.`;

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
                        messages: [{ role: 'user', content: storyPrompt }],
                        max_tokens: 500,
                        temperature: 0.7
                    })
                });
                
                if (!response.ok) continue;
                
                const data = await response.json();
                const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
                    ? data.choices[0].message.content
                    : '';
                    
                if (content) {
                    // Return the story content directly without any parsing
                    return content.trim();
                }
            } catch (err) {
                console.error('Error with model:', model, err);
                continue;
            }
        }
        return null;
    }

    function createStructuredStory(text, question, options, solution) {
        // Return only the story content
        return text.trim();
    }

    try {
        const story = await generateStoryFromQuestion(question, options, solution);
        
        if (!story) {
            return res.status(500).json({ 
                error: 'Failed to generate story. Please try again.' 
            });
        }

        // Return only the story content for audio generation
        const storyContent = story;
        
        res.json({ 
            storyScript: storyContent
        });
    } catch (err) {
        console.error('Generate story error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { generateStory };