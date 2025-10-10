import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStats {
  streak: number;
  minutesToday: number;
  accuracy: number;
  tokensEarned: number;
  loading: boolean;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    minutesToday: 0,
    accuracy: 0,
    tokensEarned: 0,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setStats({ streak: 0, minutesToday: 0, accuracy: 0, tokensEarned: 0, loading: false });
      return;
    }

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-user-stats');

        if (error) throw error;

        const todayMinutes = Math.round(
          (data.todaySessions?.reduce((acc: number, s: any) => acc + (s.duration_seconds || 0), 0) || 0) / 60
        );

        const allPerformance = data.performance || [];
        const avgAccuracy = allPerformance.length > 0
          ? Math.round(
              allPerformance.reduce((acc: number, p: any) => acc + (p.ema_accuracy || 0), 0) / allPerformance.length * 100
            )
          : 0;

        const totalTokens = allPerformance.reduce((acc: number, p: any) => acc + (p.tokens || 0), 0);
        const maxStreak = Math.max(...allPerformance.map((p: any) => p.streak_days || 0), 0);

        setStats({
          streak: maxStreak,
          minutesToday: todayMinutes,
          accuracy: avgAccuracy,
          tokensEarned: totalTokens,
          loading: false,
        });
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        setStats({ streak: 0, minutesToday: 0, accuracy: 0, tokensEarned: 0, loading: false });
      }
    };

    fetchStats();
  }, [user]);

  return stats;
};
