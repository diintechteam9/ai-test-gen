require('dotenv').config();

const generateQuestion=async(req,res)=>{
    const { prompt, questionCount, subject } = req.body;
    if (!prompt || !questionCount) {
        return res.status(400).json({ error: 'prompt and questionCount are required.' });
    }
    const models = [
        // 'deepseek/deepseek-prover-v2'
        // 'google/gemma-3n-e2b-it:free'
        'anthropic/claude-3-haiku'
    ];
    async function generateQuestions(prompt, count, subject) {
        const subjectContext = subject ? ` in the subject of ${subject}` : '';
        const questionPrompt = `Generate ${count} multiple choice questions based on the following topic: "${prompt}"${subjectContext}

For each question, provide:
1. A clear question text
2. Four options (A, B, C, D) with one correct answer
3. A brief solution/explanation

Format the response as JSON with this structure:
{
  "questions": [
    {
      "questionText": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "solution": "give only Correct answer from the options don't send any further suggestion"
    }
  ]
}

Make sure the questions are educational, clear, and appropriate for the topic and subject.`;

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
                        messages: [{ role: 'user', content: questionPrompt }],
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
                        if (parsed.questions && Array.isArray(parsed.questions)) {
                            return parsed.questions;
                        }
                    } catch (parseErr) {
                        // If JSON parsing fails, try to extract questions from text
                        console.log('Failed to parse JSON, trying text extraction');
                        return extractQuestionsFromText(content, count);
                    }
                }
            } catch (err) {
                console.error('Error with model:', model, err);
                continue;
            }
        }
        return [];
    }

    function extractQuestionsFromText(text, count) {
        const questions = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        for (let i = 0; i < Math.min(count, Math.floor(lines.length / 6)); i++) {
            const startIndex = i * 6;
            const questionText = lines[startIndex]?.replace(/^\d+\.?\s*/, '').trim();
            const options = [
                lines[startIndex + 1]?.replace(/^[A-D]\.?\s*/, '').trim(),
                lines[startIndex + 2]?.replace(/^[A-D]\.?\s*/, '').trim(),
                lines[startIndex + 3]?.replace(/^[A-D]\.?\s*/, '').trim(),
                lines[startIndex + 4]?.replace(/^[A-D]\.?\s*/, '').trim()
            ].filter(Boolean);
            const solution = lines[startIndex + 5]?.replace(/^[Ss]olution:?\s*/, '').trim();

            if (questionText && options.length === 4) {
                questions.push({
                    questionText,
                    options,
                    correctAnswer: 0, // Default to first option
                    solution: solution || 'No solution provided'
                });
            }
        }
        return questions;
    }
    try {
        const questions = await generateQuestions(prompt, questionCount, subject);
        res.json({ 
            success: true, 
            questions: questions,
            count: questions.length 
        });
    } catch (err) {
        console.error('Generate questions error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports={generateQuestion};