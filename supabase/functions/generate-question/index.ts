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
    
    // Clean up the response - remove markdown code blocks if present
    generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON response
    let question;
    try {
      question = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Ensure all required fields are present
    if (!question.options || !Array.isArray(question.options)) {
      throw new Error('Invalid question format: options must be an array');
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
