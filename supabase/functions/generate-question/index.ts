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
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
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

IMPORTANT FORMATTING RULES:
1. Return ONLY valid JSON, no markdown code blocks
2. Use proper JSON escaping for special characters
3. Do not include any text before or after the JSON object
4. Use LaTeX notation for mathematical expressions (e.g., \\frac{1}{2}, x^2, \\sqrt{x})

Return a JSON object with this exact structure:
{
  "id": "unique-question-id",
  "question": "The question text (use clear mathematical notation with LaTeX where needed)",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": 0,
  "explanation": "Step-by-step explanation of the solution with clear reasoning",
  "hint": "A helpful hint that guides thinking without giving away the answer directly",
  "topic": "${request.gameConcept}",
  "difficulty": "${request.difficulty}"
}

Make the question:
- Contextually relevant to the game theme "${request.gameTitle}"
- Age-appropriate for Class 11-12 students
- Clear and unambiguous with proper mathematical notation
- Include visual or real-world context when possible
- Use Indian curriculum notation (₹ for currency, meters for distance, etc.)
- Aligned with CBSE Class 11-12 standards
- ADHD-friendly: clear structure, visual cues, engaging context

The correctAnswer should be the index (0-3) of the correct option.
Options should be distinct and plausible to test understanding.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate question ${request.questionNumber || 1} for this game level. Make it engaging and contextually relevant to the game theme.` }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    let generatedContent = openAIData.choices[0].message.content;
    
    // Clean up the response - remove markdown code blocks if present
    generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON response
    let question;
    try {
      question = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

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
