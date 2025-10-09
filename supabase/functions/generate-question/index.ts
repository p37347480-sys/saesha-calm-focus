const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuestionRequest {
  subject: string;
  topic: string;
  difficulty: number;
  taskType: string;
  grade: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, topic, difficulty, taskType, grade }: QuestionRequest = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Create adaptive system prompt based on task type
    const systemPrompt = `You are an expert CBSE educator for Class ${grade}. Generate high-quality ${taskType} questions for ${subject} - ${topic}.

Task Types Guide:
- Speed Concept: Quick 3-4 min recall questions (MCQ format)
- Problem Breakdown: 6-8 min step-by-step problem solving
- Puzzle: 5-6 min pattern/logic-based challenges
- Reading+Extraction: 5-6 min comprehension with passage
- Flashcard: 2-3 min quick definition/term matching

Difficulty Levels:
1 = Basic recall
2 = Understanding + simple application
3 = Analysis + moderate problem solving
4 = Complex synthesis
5 = Advanced application + critical thinking

Return a JSON object with this exact structure:
{
  "id": "unique_id",
  "subject": "${subject}",
  "topic": "${topic}",
  "task_type": "${taskType}",
  "difficulty": ${difficulty},
  "grade": ${grade},
  "prompt": "The question text",
  "answer_options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0,
  "hints": ["Hint 1", "Hint 2"],
  "explanation": "Detailed explanation of the answer",
  "passage": "Optional passage for Reading+Extraction type",
  "estimated_time_seconds": 180
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a ${taskType} question for ${subject} - ${topic} at difficulty level ${difficulty}.` }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const question = JSON.parse(data.choices[0].message.content);

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
