export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_progress: {
        Row: {
          best_accuracy: number | null
          completed_at: string | null
          created_at: string | null
          difficulty: string
          game_id: string
          hints_used: number | null
          id: string
          questions_completed: number | null
          stars_earned: number | null
          unlocked: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_accuracy?: number | null
          completed_at?: string | null
          created_at?: string | null
          difficulty: string
          game_id: string
          hints_used?: number | null
          id?: string
          questions_completed?: number | null
          stars_earned?: number | null
          unlocked?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_accuracy?: number | null
          completed_at?: string | null
          created_at?: string | null
          difficulty?: string
          game_id?: string
          hints_used?: number | null
          id?: string
          questions_completed?: number | null
          stars_earned?: number | null
          unlocked?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_progress_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          chapter: string
          created_at: string | null
          game_concept: string
          game_number: number
          game_title: string
          id: string
        }
        Insert: {
          chapter: string
          created_at?: string | null
          game_concept: string
          game_number: number
          game_title: string
          id?: string
        }
        Update: {
          chapter?: string
          created_at?: string | null
          game_concept?: string
          game_number?: number
          game_title?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          grade: number
          id: string
          name: string
          subjects: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          grade: number
          id: string
          name: string
          subjects?: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          grade?: number
          id?: string
          name?: string
          subjects?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          earned_at: string | null
          id: string
          metadata: Json | null
          reward_description: string | null
          reward_title: string
          reward_type: string
          user_id: string
        }
        Insert: {
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          reward_description?: string | null
          reward_title: string
          reward_type: string
          user_id: string
        }
        Update: {
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          reward_description?: string | null
          reward_title?: string
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string | null
          difficulty: string | null
          duration_seconds: number | null
          end_time: string | null
          game_id: string | null
          id: string
          start_time: string | null
          subject: string
          tasks_completed: number | null
          tasks_correct: number | null
          total_hints_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          game_id?: string | null
          id?: string
          start_time?: string | null
          subject: string
          tasks_completed?: number | null
          tasks_correct?: number | null
          total_hints_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          game_id?: string | null
          id?: string
          start_time?: string | null
          subject?: string
          tasks_completed?: number | null
          tasks_correct?: number | null
          total_hints_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      task_results: {
        Row: {
          correct: boolean
          created_at: string | null
          difficulty: number
          hints_used: number | null
          id: string
          response_time_ms: number
          session_id: string
          skipped: boolean | null
          subject: string
          task_id: string
          topic: string
          user_id: string
        }
        Insert: {
          correct: boolean
          created_at?: string | null
          difficulty: number
          hints_used?: number | null
          id?: string
          response_time_ms: number
          session_id: string
          skipped?: boolean | null
          subject: string
          task_id: string
          topic: string
          user_id: string
        }
        Update: {
          correct?: boolean
          created_at?: string | null
          difficulty?: number
          hints_used?: number | null
          id?: string
          response_time_ms?: number
          session_id?: string
          skipped?: boolean | null
          subject?: string
          task_id?: string
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_performance: {
        Row: {
          created_at: string | null
          difficulty_level: number | null
          ema_accuracy: number | null
          ema_hints: number | null
          ema_time: number | null
          id: string
          last_session_date: string | null
          streak_days: number | null
          subject: string
          tokens: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          difficulty_level?: number | null
          ema_accuracy?: number | null
          ema_hints?: number | null
          ema_time?: number | null
          id?: string
          last_session_date?: string | null
          streak_days?: number | null
          subject: string
          tokens?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          difficulty_level?: number | null
          ema_accuracy?: number | null
          ema_hints?: number | null
          ema_time?: number | null
          id?: string
          last_session_date?: string | null
          streak_days?: number | null
          subject?: string
          tokens?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_session_stats: {
        Args: { p_is_correct: boolean; p_session_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
