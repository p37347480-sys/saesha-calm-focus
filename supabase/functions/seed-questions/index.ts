const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GameData {
  id: string;
  chapter: string;
  game_title: string;
  game_concept: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gameId, difficulty, count = 20 } = await req.json();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!lovableApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Get game data
    const gameResponse = await fetch(`${supabaseUrl}/rest/v1/games?id=eq.${gameId}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });
    
    const games = await gameResponse.json();
    if (!games || games.length === 0) {
      throw new Error('Game not found');
    }
    
    const game: GameData = games[0];
    
    const generatedQuestions = [];
    
    // Generate questions
    for (let i = 0; i < count; i++) {
      const systemPrompt = `You are an educational mathematics content generator for Class 11-12 students (Indian CBSE curriculum).

Generate a UNIQUE, THEME-SPECIFIC mathematics question for the game "${game.game_title}" which focuses EXCLUSIVELY on "${game.game_concept}" within the chapter "${game.chapter}".

🎯 CRITICAL INSTRUCTIONS FOR UNIQUENESS:
1. This is question ${i + 1} for THIS SPECIFIC GAME - make it completely unique to this game's theme
2. The question MUST be contextually tied to "${game.game_title}" - use its specific scenario/setting
3. DO NOT create generic trigonometry questions - make them specific to the game's concept
4. Use the game's unique context in the word problem (e.g., if it's about heights, use buildings/towers; if it's about waves, use ocean/sound waves)
5. Each question should feel like it belongs ONLY to this game, not to any other game

Difficulty: ${difficulty}

THEME-SPECIFIC EXAMPLES:
- "Skyline Surveyor" → Questions about measuring building heights, distances between structures, shadow calculations
- "Wave Lab" → Questions about amplitude, frequency, phase shifts, wave transformations, graph analysis
- "Mountain Rescue Drone" → Questions about 3D angles of elevation/depression, drone positioning, terrain mapping
- "Clock Tower Challenge" → Questions about clock hands, time-based angles, tower shadows at different times

CRITICAL FORMATTING RULES:
1. Return ONLY valid JSON, no markdown code blocks
2. IMPORTANT: In JSON strings, ALL backslashes must be escaped as double backslashes (\\\\)
3. For LaTeX in JSON: use \\\\frac not \\frac, \\\\sin not \\sin, \\\\sqrt not \\sqrt, etc.
4. Do not include any text before or after the JSON object
5. Use inline LaTeX notation within dollar signs: $x^2$, $\\\\frac{1}{2}$, $\\\\sin \\\\theta$
6. Keep the narrative engaging and specific to the game's theme
7. Make the question feel like it's part of the game's unique storyline

Return JSON with this structure:
{
  "question": "Clear, theme-specific question with $LaTeX$ for math - must reference the game's unique context",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0,
  "explanation": "Step-by-step explanation with $LaTeX$ that relates to the game's theme",
  "hint": "Helpful hint with $LaTeX$ that guides within the game's context",
  "topic": "${game.game_concept}"
}`;
    
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
            { role: 'user', content: `Generate a completely unique, theme-specific question ${i + 1} for "${game.game_title}". Make sure it's contextually tied to the game's concept and feels different from any other game. Return ONLY valid JSON with properly escaped LaTeX (use \\\\ before all LaTeX commands).` }
          ],
          temperature: 0.8,
        }),
      });

      if (!aiResponse.ok) {
        console.error(`AI API error for question ${i + 1}:`, await aiResponse.text());
        continue;
      }

      const aiData = await aiResponse.json();
      let content = aiData.choices[0].message.content;
      
      // Clean response
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        content = content.substring(firstBrace, lastBrace + 1);
      }
      
      // Fix LaTeX escaping
      const latexCommands = ['frac', 'sqrt', 'sin', 'cos', 'tan', 'theta', 'alpha', 'beta', 'gamma', 'pi', 'circ'];
      const commandPattern = latexCommands.join('|');
      const latexRegex = new RegExp(`(?<!\\\\)\\\\(${commandPattern})`, 'g');
      content = content.replace(latexRegex, '\\\\$1');

      try {
        const question = JSON.parse(content);
        
        // Insert into database
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/questions`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            game_id: gameId,
            difficulty: difficulty,
            question_text: question.question,
            options: question.options,
            correct_answer: question.correctAnswer,
            explanation: question.explanation,
            hint: question.hint || '',
            topic: question.topic,
          }),
        });
        
        if (insertResponse.ok) {
          const inserted = await insertResponse.json();
          generatedQuestions.push(inserted[0]);
          console.log(`Generated question ${i + 1}/${count}`);
        }
      } catch (error) {
        console.error(`Failed to parse/insert question ${i + 1}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: generatedQuestions.length,
        questions: generatedQuestions 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in seed-questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
