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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      bot_conversation_states: {
        Row: {
          bot_id: string | null
          created_at: string
          expires_at: string
          id: string
          state_data: Json | null
          state_type: string
          telegram_user_id: number
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          state_data?: Json | null
          state_type: string
          telegram_user_id: number
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          state_data?: Json | null
          state_type?: string
          telegram_user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "bot_conversation_states_bot_id_fkey"
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      bot_settings: {
        Row: {
          announce_payments: boolean | null
          auto_delete_messages: boolean | null
          bot_id: string | null
          created_at: string
          custom_emojis: string[] | null
          fake_engagement_enabled: boolean | null
          fake_engagement_interval_minutes: number | null
          fake_engagement_last_sent: string | null
          fake_engagement_names: string[] | null
          fixed_emoji: string | null
          group_chat_id: number | null
          group_title: string | null
          group_url: string | null
          id: string
          message_effect: string | null
          mute_new_members: boolean | null
          owner_ids: number[] | null
          react_to_messages: boolean | null
          reaction_mode: string | null
          show_typing: boolean | null
          terms_enabled: boolean | null
          terms_text: string | null
          updated_at: string
        }
        Insert: {
          announce_payments?: boolean | null
          auto_delete_messages?: boolean | null
          bot_id?: string | null
          created_at?: string
          custom_emojis?: string[] | null
          fake_engagement_enabled?: boolean | null
          fake_engagement_interval_minutes?: number | null
          fake_engagement_last_sent?: string | null
          fake_engagement_names?: string[] | null
          fixed_emoji?: string | null
          group_chat_id?: number | null
          group_title?: string | null
          group_url?: string | null
          id?: string
          message_effect?: string | null
          mute_new_members?: boolean | null
          owner_ids?: number[] | null
          react_to_messages?: boolean | null
          reaction_mode?: string | null
          show_typing?: boolean | null
          terms_enabled?: boolean | null
          terms_text?: string | null
          updated_at?: string
        }
        Update: {
          announce_payments?: boolean | null
          auto_delete_messages?: boolean | null
          bot_id?: string | null
          created_at?: string
          custom_emojis?: string[] | null
          fake_engagement_enabled?: boolean | null
          fake_engagement_interval_minutes?: number | null
          fake_engagement_last_sent?: string | null
          fake_engagement_names?: string[] | null
          fixed_emoji?: string | null
          group_chat_id?: number | null
          group_title?: string | null
          group_url?: string | null
          id?: string
          message_effect?: string | null
          mute_new_members?: boolean | null
          owner_ids?: number[] | null
          react_to_messages?: boolean | null
          reaction_mode?: string | null
          show_typing?: boolean | null
          terms_enabled?: boolean | null
          terms_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_settings_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: true
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_messages: {
        Row: {
          bot_id: string | null
          created_at: string
          id: string
          interval_minutes: number | null
          is_active: boolean | null
          last_sent_at: string | null
          message_template: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          id?: string
          interval_minutes?: number | null
          is_active?: boolean | null
          last_sent_at?: string | null
          message_template: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          id?: string
          interval_minutes?: number | null
          is_active?: boolean | null
          last_sent_at?: string | null
          message_template?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      paginated_results: {
        Row: {
          chat_id: number
          created_at: string
          current_page: number
          expires_at: string
          id: string
          message_id: number | null
          pages: Json
          total_pages: number
        }
        Insert: {
          chat_id: number
          created_at?: string
          current_page?: number
          expires_at?: string
          id?: string
          message_id?: number | null
          pages: Json
          total_pages: number
        }
        Update: {
          chat_id?: number
          created_at?: string
          current_page?: number
          expires_at?: string
          id?: string
          message_id?: number | null
          pages?: Json
          total_pages?: number
        }
        Relationships: []
      }
      payment_gateway_settings: {
        Row: {
          auto_approve: boolean | null
          created_at: string
          gateway_type: string | null
          id: string
          is_sandbox: boolean | null
          notification_enabled: boolean | null
          pix_key: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          auto_approve?: boolean | null
          created_at?: string
          gateway_type?: string | null
          id?: string
          is_sandbox?: boolean | null
          notification_enabled?: boolean | null
          pix_key?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          auto_approve?: boolean | null
          created_at?: string
          gateway_type?: string | null
          id?: string
          is_sandbox?: boolean | null
          notification_enabled?: boolean | null
          pix_key?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          config: Json
          created_at: string | null
          gateway_type: string
          id: string
          is_active: boolean | null
          min_deposit: number | null
          name: string
          proxy_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string | null
          gateway_type: string
          id?: string
          is_active?: boolean | null
          min_deposit?: number | null
          name: string
          proxy_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          gateway_type?: string
          id?: string
          is_active?: boolean | null
          min_deposit?: number | null
          name?: string
          proxy_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          gateway_response: Json | null
          id: string
          payment_method: string | null
          plan_id: string | null
          status: string
          subscription_id: string | null
          txid: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          gateway_response?: Json | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          status: string
          subscription_id?: string | null
          txid?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          gateway_response?: Json | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          subscription_id?: string | null
          txid?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_payments: {
        Row: {
          bot_id: string | null
          created_at: string
          expires_at: string
          id: string
          loc_id: string | null
          pix_copy_paste: string | null
          pix_qrcode: string | null
          plan_code: string
          plan_days: number
          plan_id: string | null
          plan_name: string
          status: string | null
          telegram_chat_id: number | null
          telegram_message_id: number | null
          telegram_user_id: number | null
          txid: string
          user_id: string
          value: number
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          loc_id?: string | null
          pix_copy_paste?: string | null
          pix_qrcode?: string | null
          plan_code: string
          plan_days: number
          plan_id?: string | null
          plan_name: string
          status?: string | null
          telegram_chat_id?: number | null
          telegram_message_id?: number | null
          telegram_user_id?: number | null
          txid: string
          user_id: string
          value: number
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          loc_id?: string | null
          pix_copy_paste?: string | null
          pix_qrcode?: string | null
          plan_code?: string
          plan_days?: number
          plan_id?: string | null
          plan_name?: string
          status?: string | null
          telegram_chat_id?: number | null
          telegram_message_id?: number | null
          telegram_user_id?: number | null
          txid?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "pending_payments_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pix_transactions: {
        Row: {
          amount: number
          bot_id: string | null
          created_at: string | null
          description: string | null
          e2e_id: string | null
          expires_at: string | null
          external_id: string | null
          gateway: string
          id: string
          loc_id: string | null
          paid_at: string | null
          qr_code_text: string | null
          qr_code_url: string | null
          status: string | null
          telegram_user_id: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bot_id?: string | null
          created_at?: string | null
          description?: string | null
          e2e_id?: string | null
          expires_at?: string | null
          external_id?: string | null
          gateway?: string
          id?: string
          loc_id?: string | null
          paid_at?: string | null
          qr_code_text?: string | null
          qr_code_url?: string | null
          status?: string | null
          telegram_user_id?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bot_id?: string | null
          created_at?: string | null
          description?: string | null
          e2e_id?: string | null
          expires_at?: string | null
          external_id?: string | null
          gateway?: string
          id?: string
          loc_id?: string | null
          paid_at?: string | null
          qr_code_text?: string | null
          qr_code_url?: string | null
          status?: string | null
          telegram_user_id?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pix_transactions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_updates: {
        Row: {
          bot_id: string
          created_at: string | null
          id: string
          update_id: number
        }
        Insert: {
          bot_id: string
          created_at?: string | null
          id?: string
          update_id: number
        }
        Update: {
          bot_id?: string
          created_at?: string | null
          id?: string
          update_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "processed_updates_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          days: number
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          max_bots: number | null
          max_messages_per_day: number | null
          name: string
          price: number
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          days: number
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          max_bots?: number | null
          max_messages_per_day?: number | null
          name: string
          price: number
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          days?: number
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          max_bots?: number | null
          max_messages_per_day?: number | null
          name?: string
          price?: number
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      telegram_subscriptions: {
        Row: {
          bot_id: string | null
          created_at: string
          expires_at: string
          id: string
          plan_code: string
          plan_days: number
          plan_id: string | null
          plan_name: string
          started_at: string
          status: string | null
          telegram_user_id: number
          txid: string | null
          value: number
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          plan_code: string
          plan_days: number
          plan_id?: string | null
          plan_name: string
          started_at?: string
          status?: string | null
          telegram_user_id: number
          txid?: string | null
          value: number
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          plan_code?: string
          plan_days?: number
          plan_id?: string | null
          plan_name?: string
          started_at?: string
          status?: string | null
          telegram_user_id?: number
          txid?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "telegram_subscriptions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_user_terms: {
        Row: {
          accepted: boolean
          accepted_at: string | null
          bot_id: string | null
          created_at: string
          id: string
          telegram_user_id: number
          updated_at: string
        }
        Insert: {
          accepted?: boolean
          accepted_at?: string | null
          bot_id?: string | null
          created_at?: string
          id?: string
          telegram_user_id: number
          updated_at?: string
        }
        Update: {
          accepted?: boolean
          accepted_at?: string | null
          bot_id?: string | null
          created_at?: string
          id?: string
          telegram_user_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_user_terms_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
