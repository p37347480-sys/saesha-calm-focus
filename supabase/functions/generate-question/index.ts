const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuestionRequest {
  chapter: string;
  gameTitle: string;
  gameConcept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionNumber?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: QuestionRequest = await req.json();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    // Map difficulty to detailed level description
    const difficultyMap = {
      easy: 'Easy level - Focus on basic concepts, simple calculations, single-step problems. Target time: 2-3 minutes per question.',
      medium: 'Medium level - Multi-step problems, require conceptual understanding and application. Target time: 4-5 minutes per question.',
      hard: 'Hard level - Complex problems, advanced applications, require deep understanding and multiple concepts. Target time: 6-8 minutes per question.'
    };

    // Build a dynamic prompt based on the game context
    const systemPrompt = `You are an educational mathematics content generator for Class 11-12 students (Indian CBSE curriculum).

Generate a mathematics question for the game "${request.gameTitle}" which focuses on "${request.gameConcept}" within the chapter "${request.chapter}".

Difficulty: ${difficultyMap[request.difficulty]}

CRITICAL FORMATTING RULES:
1. Return ONLY valid JSON, no markdown code blocks
2. IMPORTANT: In JSON strings, ALL backslashes must be escaped as double backslashes (\\\\)
3. For LaTeX in JSON: use \\\\frac not \\frac, \\\\sin not \\sin, \\\\sqrt not \\sqrt, etc.
4. Do not include any text before or after the JSON object
5. Use inline LaTeX notation within dollar signs for ALL mathematical expressions: $x^2$, $\\\\frac{1}{2}$, $\\\\sin \\\\theta$
6. For display equations, use double dollar signs: $$\\\\int_0^1 x^2 dx$$
7. Keep the narrative simple and engaging - avoid complex backstories
8. Write in clear, conversational English that students can easily read

Return a JSON object with this exact structure:
{
  "id": "unique-question-id",
  "question": "Write a clear, engaging question using $LaTeX$ for math. Keep it simple and focused. Example: 'In a triangle ABC, if $\\angle A = 30^\\circ$ and $\\angle B = 60^\\circ$, find $\\angle C$.'",
  "options": [
    "Option 1 with $math$ if needed",
    "Option 2 with $math$ if needed", 
    "Option 3 with $math$ if needed",
    "Option 4 with $math$ if needed"
  ],
  "correctAnswer": 0,
  "explanation": "Clear step-by-step explanation using $LaTeX$ for mathematical expressions. Make it educational and easy to understand.",
  "hint": "A helpful hint using $LaTeX$ notation for any mathematical expressions. Guide their thinking without giving away the answer.",
  "topic": "${request.gameConcept}",
  "difficulty": "${request.difficulty}"
}

IMPORTANT EXAMPLES (remember to double-escape backslashes in JSON):
- Write: "Find the value of $\\\\sin 30^\\\\circ$" NOT "Find the value of sin 30°"
- Write: "If $x^2 + 5x + 6 = 0$" NOT "If x² + 5x + 6 = 0"
- Write: "Calculate $\\\\frac{3}{4} + \\\\frac{1}{2}$" NOT "Calculate 3/4 + 1/2"
- Write: "The angle $\\\\theta$ measures..." NOT "The angle θ measures..."

Make the question:
- Clear and conversational, like a friendly teacher explaining
- Use simple sentences, avoid complex game narratives
- Age-appropriate for Class 11-12 students
- Include visual or real-world context when possible
- Use Indian curriculum notation (₹ for currency, meters for distance, etc.)
- Aligned with CBSE Class 11-12 standards
- ADHD-friendly: clear structure, simple language, focused question

The correctAnswer should be the index (0-3) of the correct option.
Options should be distinct and plausible to test understanding.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate question ${request.questionNumber || 1} for this game level. Make it engaging and contextually relevant to the game theme. Return ONLY valid JSON.` }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI API error:', errorText);
      throw new Error(`Lovable AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let generatedContent = aiData.choices[0].message.content;
    
    console.log('Raw AI response:', generatedContent);
    
    // Clean up the response - handle various formats
    // Remove markdown code blocks
    generatedContent = generatedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    // Remove any leading/trailing whitespace
    generatedContent = generatedContent.trim();
    // Remove any text before the first { or after the last }
    const firstBrace = generatedContent.indexOf('{');
    const lastBrace = generatedContent.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      console.error('No JSON object found in response:', generatedContent);
      throw new Error('No valid JSON object found in AI response');
    }
    
    generatedContent = generatedContent.substring(firstBrace, lastBrace + 1);
    
    // Fix common LaTeX escaping issues in JSON strings
    // The AI sometimes uses single backslashes in JSON which is invalid
    // We need to escape backslashes that appear before LaTeX commands
    // This regex finds backslashes followed by common LaTeX commands and escapes them
    const latexCommands = ['frac', 'sqrt', 'sin', 'cos', 'tan', 'theta', 'alpha', 'beta', 'gamma', 'delta', 'pi', 'int', 'sum', 'prod', 'lim', 'infty', 'text', 'cdot', 'times', 'div', 'pm', 'leq', 'geq', 'neq', 'approx', 'equiv', 'circ', 'angle'];
    
    // Create a regex pattern for all LaTeX commands
    const commandPattern = latexCommands.join('|');
    const latexRegex = new RegExp(`(?<!\\\\)\\\\(${commandPattern})`, 'g');
    
    // Escape single backslashes before LaTeX commands
    generatedContent = generatedContent.replace(latexRegex, '\\\\$1');
    
    // Parse the JSON response
    let question;
    try {
      question = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent);
      console.error('Parse error:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate required fields
    if (!question.options || !Array.isArray(question.options)) {
      console.error('Invalid question format - missing or invalid options:', question);
      throw new Error('Invalid question format: options must be an array');
    }

    if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      console.error('Invalid correctAnswer:', question.correctAnswer);
      throw new Error('Invalid question format: correctAnswer must be a valid index');
    }

    console.log('Successfully parsed question:', question.id);

    return new Response(JSON.stringify(question), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
