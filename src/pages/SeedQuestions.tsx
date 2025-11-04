import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SeedQuestions() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const { toast } = useToast();

  const seedAllQuestions = async () => {
    setIsSeeding(true);
    setProgress('Fetching all games...');

    try {
      // Fetch all games
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .order('chapter', { ascending: true })
        .order('game_number', { ascending: true });

      if (gamesError) throw gamesError;
      if (!games || games.length === 0) {
        throw new Error('No games found');
      }

      const difficulties = ['easy', 'medium', 'hard'];
      let totalGenerated = 0;
      let totalAttempted = 0;

      for (const game of games) {
        for (const difficulty of difficulties) {
          totalAttempted++;
          setProgress(
            `Generating questions for ${game.chapter} - ${game.game_title} (${difficulty})... ${totalAttempted}/${games.length * 3}`
          );

          try {
            // Check if questions already exist
            const { data: existing } = await supabase
              .from('questions')
              .select('id')
              .eq('game_id', game.id)
              .eq('difficulty', difficulty);

            if (existing && existing.length >= 10) {
              console.log(`Skipping ${game.game_title} (${difficulty}) - already has questions`);
              continue;
            }

            // Call seed-questions function
            const { data, error } = await supabase.functions.invoke('seed-questions', {
              body: {
                gameId: game.id,
                difficulty: difficulty,
                count: 10,
              },
            });

            if (error) {
              console.error(`Error seeding ${game.game_title} (${difficulty}):`, error);
              continue;
            }

            if (data?.success) {
              totalGenerated += data.count || 0;
              console.log(`Generated ${data.count} questions for ${game.game_title} (${difficulty})`);
            }
          } catch (error) {
            console.error(`Error processing ${game.game_title} (${difficulty}):`, error);
          }
        }
      }

      setProgress(`Completed! Generated ${totalGenerated} questions.`);
      toast({
        title: "Success",
        description: `Generated ${totalGenerated} questions across all games and difficulties.`,
      });
    } catch (error) {
      console.error('Error seeding questions:', error);
      setProgress('Error occurred during seeding');
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Seed Questions Database</CardTitle>
          <CardDescription>
            Generate and store questions for all games and difficulty levels. This will pre-populate
            the database with questions to avoid API rate limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <Button
              onClick={seedAllQuestions}
              disabled={isSeeding}
              size="lg"
              className="w-full"
            >
              {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSeeding ? 'Generating Questions...' : 'Generate All Questions'}
            </Button>

            {progress && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{progress}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p>This will:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Generate 10 questions per game per difficulty level</li>
                <li>Skip games that already have 10+ questions</li>
                <li>Use AI to create contextually relevant questions</li>
                <li>Store all questions in the database for instant access</li>
              </ul>
              <p className="mt-4 font-semibold">
                Note: This process may take several minutes to complete.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
