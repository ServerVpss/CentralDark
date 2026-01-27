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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_providers: {
        Row: {
          base_url: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          port: number | null
          updated_at: string
        }
        Insert: {
          base_url: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          port?: number | null
          updated_at?: string
        }
        Update: {
          base_url?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          port?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          created_at: string
          credits_used: number | null
          id: string
          provider_id: string | null
          query_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credits_used?: number | null
          id?: string
          provider_id?: string | null
          query_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credits_used?: number | null
          id?: string
          provider_id?: string | null
          query_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "api_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_analytics: {
        Row: {
          active_users: number | null
          blocked_messages: number | null
          bot_id: string | null
          created_at: string
          date: string
          id: string
          links_blocked: number | null
          messages_received: number | null
          messages_sent: number | null
          new_users: number | null
          spam_detected: number | null
        }
        Insert: {
          active_users?: number | null
          blocked_messages?: number | null
          bot_id?: string | null
          created_at?: string
          date?: string
          id?: string
          links_blocked?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          new_users?: number | null
          spam_detected?: number | null
        }
        Update: {
          active_users?: number | null
          blocked_messages?: number | null
          bot_id?: string | null
          created_at?: string
          date?: string
          id?: string
          links_blocked?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          new_users?: number | null
          spam_detected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_analytics_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_security_settings: {
        Row: {
          anti_flood_action: string | null
          anti_flood_enabled: boolean | null
          anti_flood_interval_seconds: number | null
          anti_flood_max_messages: number | null
          anti_link_action: string | null
          anti_link_enabled: boolean | null
          anti_spam_action: string | null
          anti_spam_enabled: boolean | null
          anti_spam_interval_seconds: number | null
          anti_spam_max_messages: number | null
          bot_id: string | null
          created_at: string
          id: string
          updated_at: string
          welcome_message: string | null
          welcome_message_enabled: boolean | null
        }
        Insert: {
          anti_flood_action?: string | null
          anti_flood_enabled?: boolean | null
          anti_flood_interval_seconds?: number | null
          anti_flood_max_messages?: number | null
          anti_link_action?: string | null
          anti_link_enabled?: boolean | null
          anti_spam_action?: string | null
          anti_spam_enabled?: boolean | null
          anti_spam_interval_seconds?: number | null
          anti_spam_max_messages?: number | null
          bot_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          welcome_message?: string | null
          welcome_message_enabled?: boolean | null
        }
        Update: {
          anti_flood_action?: string | null
          anti_flood_enabled?: boolean | null
          anti_flood_interval_seconds?: number | null
          anti_flood_max_messages?: number | null
          anti_link_action?: string | null
          anti_link_enabled?: boolean | null
          anti_spam_action?: string | null
          anti_spam_enabled?: boolean | null
          anti_spam_interval_seconds?: number | null
          anti_spam_max_messages?: number | null
          bot_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          welcome_message?: string | null
          welcome_message_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_security_settings_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: true
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      query_history: {
        Row: {
          created_at: string
          id: string
          provider_id: string | null
          query_input: string
          query_result: Json | null
          query_type: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id?: string | null
          query_input: string
          query_result?: Json | null
          query_type: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string | null
          query_input?: string
          query_result?: Json | null
          query_type?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "query_history_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "api_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_bots: {
        Row: {
          bot_id: number | null
          bot_username: string | null
          created_at: string
          health_status: string | null
          id: string
          is_active: boolean | null
          last_health_check: string | null
          name: string
          token: string
          updated_at: string
          webhook_active: boolean | null
          webhook_url: string | null
        }
        Insert: {
          bot_id?: number | null
          bot_username?: string | null
          created_at?: string
          health_status?: string | null
          id?: string
          is_active?: boolean | null
          last_health_check?: string | null
          name: string
          token: string
          updated_at?: string
          webhook_active?: boolean | null
          webhook_url?: string | null
        }
        Update: {
          bot_id?: number | null
          bot_username?: string | null
          created_at?: string
          health_status?: string | null
          id?: string
          is_active?: boolean | null
          last_health_check?: string | null
          name?: string
          token?: string
          updated_at?: string
          webhook_active?: boolean | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      telegram_messages: {
        Row: {
          blocked_reason: string | null
          bot_id: string | null
          chat_id: number
          chat_type: string | null
          created_at: string
          from_first_name: string | null
          from_user_id: number | null
          from_username: string | null
          id: string
          is_blocked: boolean | null
          message_text: string | null
          message_type: string | null
          raw_data: Json | null
          telegram_message_id: number | null
        }
        Insert: {
          blocked_reason?: string | null
          bot_id?: string | null
          chat_id: number
          chat_type?: string | null
          created_at?: string
          from_first_name?: string | null
          from_user_id?: number | null
          from_username?: string | null
          id?: string
          is_blocked?: boolean | null
          message_text?: string | null
          message_type?: string | null
          raw_data?: Json | null
          telegram_message_id?: number | null
        }
        Update: {
          blocked_reason?: string | null
          bot_id?: string | null
          chat_id?: number
          chat_type?: string | null
          created_at?: string
          from_first_name?: string | null
          from_user_id?: number | null
          from_username?: string | null
          id?: string
          is_blocked?: boolean | null
          message_text?: string | null
          message_type?: string | null
          raw_data?: Json | null
          telegram_message_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
