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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_group_connections: {
        Row: {
          connection_id: string
          created_at: string
          group_id: string
          id: string
          workspace_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          group_id: string
          id?: string
          workspace_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          group_id?: string
          id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_group_connections_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_group_connections_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_group_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      access_group_permissions: {
        Row: {
          created_at: string
          group_id: string
          is_seed: boolean
          permission_key: string
        }
        Insert: {
          created_at?: string
          group_id: string
          is_seed?: boolean
          permission_key: string
        }
        Update: {
          created_at?: string
          group_id?: string
          is_seed?: boolean
          permission_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_group_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      access_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_seed: boolean
          is_system: boolean
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_seed?: boolean
          is_system?: boolean
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_seed?: boolean
          is_system?: boolean
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_groups_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_admin_audit_logs: {
        Row: {
          action: string | null
          admin_user_id: string | null
          command_text: string
          confirmed: boolean
          created_at: string
          error: string | null
          id: string
          intent: string | null
          ip: string | null
          needs_confirmation: boolean
          result: Json | null
          route_opened: string | null
          session_id: string | null
          status: string
          user_agent: string | null
          workspace_id: string | null
        }
        Insert: {
          action?: string | null
          admin_user_id?: string | null
          command_text: string
          confirmed?: boolean
          created_at?: string
          error?: string | null
          id?: string
          intent?: string | null
          ip?: string | null
          needs_confirmation?: boolean
          result?: Json | null
          route_opened?: string | null
          session_id?: string | null
          status?: string
          user_agent?: string | null
          workspace_id?: string | null
        }
        Update: {
          action?: string | null
          admin_user_id?: string | null
          command_text?: string
          confirmed?: boolean
          created_at?: string
          error?: string | null
          id?: string
          intent?: string | null
          ip?: string | null
          needs_confirmation?: boolean
          result?: Json | null
          route_opened?: string | null
          session_id?: string | null
          status?: string
          user_agent?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      ai_admin_sessions: {
        Row: {
          activated_at: string
          active: boolean
          admin_user_id: string
          blocked_until: string | null
          created_at: string
          expires_at: string
          failed_attempts: number
          id: string
          ip: string | null
          last_used_at: string
          user_agent: string | null
        }
        Insert: {
          activated_at?: string
          active?: boolean
          admin_user_id: string
          blocked_until?: string | null
          created_at?: string
          expires_at: string
          failed_attempts?: number
          id?: string
          ip?: string | null
          last_used_at?: string
          user_agent?: string | null
        }
        Update: {
          activated_at?: string
          active?: boolean
          admin_user_id?: string
          blocked_until?: string | null
          created_at?: string
          expires_at?: string
          failed_attempts?: number
          id?: string
          ip?: string | null
          last_used_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_agent_configs: {
        Row: {
          active: boolean
          blocked_topics: Json
          created_at: string
          id: string
          is_seed: boolean
          model: string
          name: string
          sector_id: string | null
          system_prompt: string
          temperature: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          blocked_topics?: Json
          created_at?: string
          id?: string
          is_seed?: boolean
          model?: string
          name: string
          sector_id?: string | null
          system_prompt?: string
          temperature?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          blocked_topics?: Json
          created_at?: string
          id?: string
          is_seed?: boolean
          model?: string
          name?: string
          sector_id?: string | null
          system_prompt?: string
          temperature?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_configs_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_configs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_call_log: {
        Row: {
          completion_tokens: number | null
          connection_id: string | null
          cost_usd: number | null
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          latency_ms: number | null
          model_id: string | null
          profile_key: string | null
          prompt_tokens: number | null
          provider_slug: string | null
          status: string
          total_tokens: number | null
          used_fallback: boolean
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          completion_tokens?: number | null
          connection_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          model_id?: string | null
          profile_key?: string | null
          prompt_tokens?: number | null
          provider_slug?: string | null
          status: string
          total_tokens?: number | null
          used_fallback?: boolean
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          completion_tokens?: number | null
          connection_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          model_id?: string | null
          profile_key?: string | null
          prompt_tokens?: number | null
          provider_slug?: string | null
          status?: string
          total_tokens?: number | null
          used_fallback?: boolean
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_call_log_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "ai_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_call_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_connections: {
        Row: {
          api_key_encrypted: string | null
          api_key_last4: string | null
          base_url: string | null
          created_at: string
          created_by: string | null
          extra_config: Json
          id: string
          is_active: boolean
          is_default: boolean
          is_managed: boolean
          label: string
          last_test_at: string | null
          last_test_error: string | null
          last_test_status: string | null
          provider_id: string
          status: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_key_last4?: string | null
          base_url?: string | null
          created_at?: string
          created_by?: string | null
          extra_config?: Json
          id?: string
          is_active?: boolean
          is_default?: boolean
          is_managed?: boolean
          label: string
          last_test_at?: string | null
          last_test_error?: string | null
          last_test_status?: string | null
          provider_id: string
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_key_last4?: string | null
          base_url?: string | null
          created_at?: string
          created_by?: string | null
          extra_config?: Json
          id?: string
          is_active?: boolean
          is_default?: boolean
          is_managed?: boolean
          label?: string
          last_test_at?: string | null
          last_test_error?: string | null
          last_test_status?: string | null
          provider_id?: string
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_connections_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          connection_id: string
          context_window: number | null
          cost_in_per_1k: number | null
          cost_out_per_1k: number | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          model_id: string
          sort_order: number
          supports_tools: boolean
          supports_vision: boolean
          updated_at: string
        }
        Insert: {
          connection_id: string
          context_window?: number | null
          cost_in_per_1k?: number | null
          cost_out_per_1k?: number | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          model_id: string
          sort_order?: number
          supports_tools?: boolean
          supports_vision?: boolean
          updated_at?: string
        }
        Update: {
          connection_id?: string
          context_window?: number | null
          cost_in_per_1k?: number | null
          cost_out_per_1k?: number | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          model_id?: string
          sort_order?: number
          supports_tools?: boolean
          supports_vision?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_models_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "ai_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profiles: {
        Row: {
          backup_connection_id: string | null
          backup_model_id: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          max_cost_per_call_usd: number | null
          primary_connection_id: string | null
          primary_model_id: string | null
          profile_key: string
          timeout_ms: number
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          backup_connection_id?: string | null
          backup_model_id?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          max_cost_per_call_usd?: number | null
          primary_connection_id?: string | null
          primary_model_id?: string | null
          profile_key: string
          timeout_ms?: number
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          backup_connection_id?: string | null
          backup_model_id?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          max_cost_per_call_usd?: number | null
          primary_connection_id?: string | null
          primary_model_id?: string | null
          profile_key?: string
          timeout_ms?: number
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_profiles_backup_connection_id_fkey"
            columns: ["backup_connection_id"]
            isOneToOne: false
            referencedRelation: "ai_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profiles_backup_model_id_fkey"
            columns: ["backup_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profiles_primary_connection_id_fkey"
            columns: ["primary_connection_id"]
            isOneToOne: false
            referencedRelation: "ai_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profiles_primary_model_id_fkey"
            columns: ["primary_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_providers: {
        Row: {
          created_at: string
          docs_url: string | null
          id: string
          is_active: boolean
          is_managed: boolean
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          docs_url?: string | null
          id?: string
          is_active?: boolean
          is_managed?: boolean
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          docs_url?: string | null
          id?: string
          is_active?: boolean
          is_managed?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_log: {
        Row: {
          completion_tokens: number
          context: string | null
          cost_usd: number
          created_at: string
          error: string | null
          id: string
          is_seed: boolean
          latency_ms: number | null
          metadata: Json
          model: string
          operation: string
          prompt_tokens: number
          provider: string
          session_id: string | null
          status: string
          total_tokens: number
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          completion_tokens?: number
          context?: string | null
          cost_usd?: number
          created_at?: string
          error?: string | null
          id?: string
          is_seed?: boolean
          latency_ms?: number | null
          metadata?: Json
          model: string
          operation?: string
          prompt_tokens?: number
          provider: string
          session_id?: string | null
          status?: string
          total_tokens?: number
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          completion_tokens?: number
          context?: string | null
          cost_usd?: number
          created_at?: string
          error?: string | null
          id?: string
          is_seed?: boolean
          latency_ms?: number | null
          metadata?: Json
          model?: string
          operation?: string
          prompt_tokens?: number
          provider?: string
          session_id?: string | null
          status?: string
          total_tokens?: number
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_conversations: {
        Row: {
          created_at: string
          id: string
          mode: string
          model: string | null
          page_path: string | null
          title: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string
          model?: string | null
          page_path?: string | null
          title?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          model?: string | null
          page_path?: string | null
          title?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      assistant_errors: {
        Row: {
          ai_suggestion: string | null
          conversation_id: string | null
          created_at: string
          friendly_summary: string | null
          id: string
          message: string
          mode: string
          page_path: string | null
          payload: Json | null
          source: string
          stack: string | null
          technical_report: string | null
          telegram_error: string | null
          telegram_sent_at: string | null
          user_agent: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          ai_suggestion?: string | null
          conversation_id?: string | null
          created_at?: string
          friendly_summary?: string | null
          id?: string
          message: string
          mode?: string
          page_path?: string | null
          payload?: Json | null
          source: string
          stack?: string | null
          technical_report?: string | null
          telegram_error?: string | null
          telegram_sent_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          ai_suggestion?: string | null
          conversation_id?: string | null
          created_at?: string
          friendly_summary?: string | null
          id?: string
          message?: string
          mode?: string
          page_path?: string | null
          payload?: Json | null
          source?: string
          stack?: string | null
          technical_report?: string | null
          telegram_error?: string | null
          telegram_sent_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_errors_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          latency_ms: number | null
          model: string | null
          role: string
          tokens_in: number | null
          tokens_out: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          model?: string | null
          role: string
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          model?: string | null
          role?: string
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          after: Json | null
          before: Json | null
          category: string | null
          created_at: string
          diff: Json | null
          entity: string | null
          entity_id: string | null
          id: string
          payload: Json
          workspace_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after?: Json | null
          before?: Json | null
          category?: string | null
          created_at?: string
          diff?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          payload?: Json
          workspace_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after?: Json | null
          before?: Json | null
          category?: string | null
          created_at?: string
          diff?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          payload?: Json
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_runs: {
        Row: {
          attempts: number
          cloud_location: string | null
          cloud_uploaded: boolean
          code_size_bytes: number | null
          created_at: string
          current_step: string | null
          db_size_bytes: number | null
          destination: string | null
          downloaded_at: string | null
          downloaded_by: string | null
          duration_ms: number | null
          error_message: string | null
          file_path: string | null
          finished_at: string | null
          id: string
          media_size_bytes: number | null
          progress_log: Json
          progress_percent: number
          sessions_size_bytes: number | null
          size_bytes: number | null
          started_at: string
          status: string
          status_message: string | null
          trigger_source: string
          vps_last_seen_at: string | null
          vps_started_at: string | null
          vps_worker_id: string | null
        }
        Insert: {
          attempts?: number
          cloud_location?: string | null
          cloud_uploaded?: boolean
          code_size_bytes?: number | null
          created_at?: string
          current_step?: string | null
          db_size_bytes?: number | null
          destination?: string | null
          downloaded_at?: string | null
          downloaded_by?: string | null
          duration_ms?: number | null
          error_message?: string | null
          file_path?: string | null
          finished_at?: string | null
          id?: string
          media_size_bytes?: number | null
          progress_log?: Json
          progress_percent?: number
          sessions_size_bytes?: number | null
          size_bytes?: number | null
          started_at?: string
          status?: string
          status_message?: string | null
          trigger_source?: string
          vps_last_seen_at?: string | null
          vps_started_at?: string | null
          vps_worker_id?: string | null
        }
        Update: {
          attempts?: number
          cloud_location?: string | null
          cloud_uploaded?: boolean
          code_size_bytes?: number | null
          created_at?: string
          current_step?: string | null
          db_size_bytes?: number | null
          destination?: string | null
          downloaded_at?: string | null
          downloaded_by?: string | null
          duration_ms?: number | null
          error_message?: string | null
          file_path?: string | null
          finished_at?: string | null
          id?: string
          media_size_bytes?: number | null
          progress_log?: Json
          progress_percent?: number
          sessions_size_bytes?: number | null
          size_bytes?: number | null
          started_at?: string
          status?: string
          status_message?: string | null
          trigger_source?: string
          vps_last_seen_at?: string | null
          vps_started_at?: string | null
          vps_worker_id?: string | null
        }
        Relationships: []
      }
      backup_secrets: {
        Row: {
          aws_access_key_id: string | null
          aws_s3_bucket: string | null
          aws_secret_access_key: string | null
          b2_application_key: string | null
          b2_bucket_name: string | null
          b2_key_id: string | null
          encryption_password: string | null
          github_repo: string | null
          github_token: string | null
          id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          aws_access_key_id?: string | null
          aws_s3_bucket?: string | null
          aws_secret_access_key?: string | null
          b2_application_key?: string | null
          b2_bucket_name?: string | null
          b2_key_id?: string | null
          encryption_password?: string | null
          github_repo?: string | null
          github_token?: string | null
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          aws_access_key_id?: string | null
          aws_s3_bucket?: string | null
          aws_secret_access_key?: string | null
          b2_application_key?: string | null
          b2_bucket_name?: string | null
          b2_key_id?: string | null
          encryption_password?: string | null
          github_repo?: string | null
          github_token?: string | null
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          contact_id: string | null
          created_at: string
          error: string | null
          id: string
          is_seed: boolean
          message_id: string | null
          name: string | null
          phone: string
          sent_at: string | null
          status: Database["public"]["Enums"]["campaign_recipient_status"]
          workspace_id: string
        }
        Insert: {
          campaign_id: string
          contact_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          is_seed?: boolean
          message_id?: string | null
          name?: string | null
          phone: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_recipient_status"]
          workspace_id: string
        }
        Update: {
          campaign_id?: string
          contact_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          is_seed?: boolean
          message_id?: string | null
          name?: string | null
          phone?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_recipient_status"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          channel: string
          connection_id: string | null
          created_at: string
          created_by: string | null
          finished_at: string | null
          id: string
          is_seed: boolean
          message_body: string | null
          name: string
          paused_reason: string | null
          scheduled_at: string | null
          segment: Json
          started_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          template_lang: string | null
          template_name: string | null
          template_vars: Json
          total_failed: number
          total_recipients: number
          total_sent: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          channel?: string
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          finished_at?: string | null
          id?: string
          is_seed?: boolean
          message_body?: string | null
          name: string
          paused_reason?: string | null
          scheduled_at?: string | null
          segment?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          template_lang?: string | null
          template_name?: string | null
          template_vars?: Json
          total_failed?: number
          total_recipients?: number
          total_sent?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          channel?: string
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          finished_at?: string | null
          id?: string
          is_seed?: boolean
          message_body?: string | null
          name?: string
          paused_reason?: string | null
          scheduled_at?: string | null
          segment?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          template_lang?: string | null
          template_name?: string | null
          template_vars?: Json
          total_failed?: number
          total_recipients?: number
          total_sent?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      cash_ledger: {
        Row: {
          amount: number
          category: string | null
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          metadata: Json
          payment_request_id: string | null
          source: string
          type: string
          workspace_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          payment_request_id?: string | null
          source?: string
          type: string
          workspace_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          payment_request_id?: string | null
          source?: string
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_ledger_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "pix_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_ledger_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_flows: {
        Row: {
          active: boolean
          bot_type: string
          connection_id: string | null
          created_at: string
          created_by: string | null
          graph: Json
          hits_count: number
          id: string
          is_multi_step: boolean
          is_seed: boolean
          keywords: string[]
          last_triggered_at: string | null
          match_mode: string
          name: string
          priority: number
          reply_message: string
          sector_id: string | null
          settings: Json
          steps: Json
          trigger_type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          bot_type?: string
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          graph?: Json
          hits_count?: number
          id?: string
          is_multi_step?: boolean
          is_seed?: boolean
          keywords?: string[]
          last_triggered_at?: string | null
          match_mode?: string
          name: string
          priority?: number
          reply_message: string
          sector_id?: string | null
          settings?: Json
          steps?: Json
          trigger_type?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          bot_type?: string
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          graph?: Json
          hits_count?: number
          id?: string
          is_multi_step?: boolean
          is_seed?: boolean
          keywords?: string[]
          last_triggered_at?: string | null
          match_mode?: string
          name?: string
          priority?: number
          reply_message?: string
          sector_id?: string | null
          settings?: Json
          steps?: Json
          trigger_type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      chatbot_sessions: {
        Row: {
          contact_phone: string
          context: Json
          current_step_id: string | null
          expires_at: string
          finished_at: string | null
          flow_id: string
          id: string
          last_interaction_at: string
          started_at: string
          workspace_id: string
        }
        Insert: {
          contact_phone: string
          context?: Json
          current_step_id?: string | null
          expires_at?: string
          finished_at?: string | null
          flow_id: string
          id?: string
          last_interaction_at?: string
          started_at?: string
          workspace_id: string
        }
        Update: {
          contact_phone?: string
          context?: Json
          current_step_id?: string | null
          expires_at?: string
          finished_at?: string | null
          flow_id?: string
          id?: string
          last_interaction_at?: string
          started_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      command_events: {
        Row: {
          command_args: Json
          command_name: string | null
          command_raw: string
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          result_payload: Json
          source: string
          status: string
          workspace_id: string
        }
        Insert: {
          command_args?: Json
          command_name?: string | null
          command_raw: string
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          result_payload?: Json
          source?: string
          status?: string
          workspace_id: string
        }
        Update: {
          command_args?: Json
          command_name?: string | null
          command_raw?: string
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          result_payload?: Json
          source?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "command_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_group_members: {
        Row: {
          added_at: string
          contact_id: string
          group_id: string
          is_seed: boolean
        }
        Insert: {
          added_at?: string
          contact_id: string
          group_id: string
          is_seed?: boolean
        }
        Update: {
          added_at?: string
          contact_id?: string
          group_id?: string
          is_seed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "contact_group_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "contact_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_seed: boolean
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_seed?: boolean
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_seed?: boolean
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_groups_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_imports: {
        Row: {
          created_at: string
          created_count: number
          duplicate_count: number
          error_count: number
          error_summary: Json
          file_type: string
          filename: string
          finished_at: string | null
          id: string
          status: string
          total_rows: number
          updated_count: number
          user_id: string | null
          valid_count: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_count?: number
          duplicate_count?: number
          error_count?: number
          error_summary?: Json
          file_type: string
          filename: string
          finished_at?: string | null
          id?: string
          status?: string
          total_rows?: number
          updated_count?: number
          user_id?: string | null
          valid_count?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_count?: number
          duplicate_count?: number
          error_count?: number
          error_summary?: Json
          file_type?: string
          filename?: string
          finished_at?: string | null
          id?: string
          status?: string
          total_rows?: number
          updated_count?: number
          user_id?: string | null
          valid_count?: number
          workspace_id?: string
        }
        Relationships: []
      }
      contact_tags: {
        Row: {
          contact_id: string
          created_at: string
          tag_id: string
          workspace_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          tag_id: string
          workspace_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          tag_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          assignee_id: string | null
          avatar_synced_at: string | null
          avatar_updated_at: string | null
          avatar_url: string | null
          birthday: string | null
          blocked: boolean
          channel_ids: string[]
          created_at: string
          ddi: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          id: string
          ignored: boolean
          is_seed: boolean
          label: string | null
          last_identity_change_at: string | null
          last_message_at: string | null
          last_name: string | null
          name: string | null
          nickname: string | null
          notes: string | null
          phone: string | null
          push_name: string | null
          source: string | null
          status: string
          tags: string[]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assignee_id?: string | null
          avatar_synced_at?: string | null
          avatar_updated_at?: string | null
          avatar_url?: string | null
          birthday?: string | null
          blocked?: boolean
          channel_ids?: string[]
          created_at?: string
          ddi?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          ignored?: boolean
          is_seed?: boolean
          label?: string | null
          last_identity_change_at?: string | null
          last_message_at?: string | null
          last_name?: string | null
          name?: string | null
          nickname?: string | null
          notes?: string | null
          phone?: string | null
          push_name?: string | null
          source?: string | null
          status?: string
          tags?: string[]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assignee_id?: string | null
          avatar_synced_at?: string | null
          avatar_updated_at?: string | null
          avatar_url?: string | null
          birthday?: string | null
          blocked?: boolean
          channel_ids?: string[]
          created_at?: string
          ddi?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          ignored?: boolean
          is_seed?: boolean
          label?: string | null
          last_identity_change_at?: string | null
          last_message_at?: string | null
          last_name?: string | null
          name?: string | null
          nickname?: string | null
          notes?: string | null
          phone?: string | null
          push_name?: string | null
          source?: string | null
          status?: string
          tags?: string[]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_cards: {
        Row: {
          assignee_id: string | null
          column_id: string
          contact_id: string
          created_at: string
          id: string
          notes: string | null
          position: number
          ticket_id: string | null
          title: string | null
          updated_at: string
          value_cents: number
          workspace_id: string
        }
        Insert: {
          assignee_id?: string | null
          column_id: string
          contact_id: string
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          ticket_id?: string | null
          title?: string | null
          updated_at?: string
          value_cents?: number
          workspace_id: string
        }
        Update: {
          assignee_id?: string | null
          column_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          ticket_id?: string | null
          title?: string | null
          updated_at?: string
          value_cents?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "crm_pipeline_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_cards_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_cards_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_cards_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipeline_columns: {
        Row: {
          color: string
          created_at: string
          id: string
          is_lost: boolean
          is_won: boolean
          position: number
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          position?: number
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          position?: number
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_pipeline_columns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      github_deploy_packages: {
        Row: {
          branch: string | null
          commit_sha: string | null
          created_at: string
          created_by: string | null
          file_path: string | null
          id: string
          notes: string | null
          size_bytes: number | null
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          branch?: string | null
          commit_sha?: string | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          size_bytes?: number | null
          status?: string
          updated_at?: string
          version: string
        }
        Update: {
          branch?: string | null
          commit_sha?: string | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          size_bytes?: number | null
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      github_deploys: {
        Row: {
          commit_message: string | null
          commit_sha: string | null
          created_at: string
          duration_ms: number | null
          http_status: number | null
          id: string
          response_message: string | null
          status: string
          trigger_type: string
          triggered_by: string | null
        }
        Insert: {
          commit_message?: string | null
          commit_sha?: string | null
          created_at?: string
          duration_ms?: number | null
          http_status?: number | null
          id?: string
          response_message?: string | null
          status?: string
          trigger_type?: string
          triggered_by?: string | null
        }
        Update: {
          commit_message?: string | null
          commit_sha?: string | null
          created_at?: string
          duration_ms?: number | null
          http_status?: number | null
          id?: string
          response_message?: string | null
          status?: string
          trigger_type?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      github_integration_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          message: string | null
          payload: Json
          status: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          payload?: Json
          status: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          payload?: Json
          status?: string
        }
        Relationships: []
      }
      github_integrations: {
        Row: {
          access_token: string | null
          app_id: string | null
          auth_type: Database["public"]["Enums"]["github_auth_type"]
          branch: string | null
          connected_at: string | null
          connected_by: string | null
          created_at: string
          id: string
          installation_id: string | null
          last_error: string | null
          last_sync_at: string | null
          permissions: Json
          repo_name: string | null
          repo_owner: string | null
          status: Database["public"]["Enums"]["github_integration_status"]
          updated_at: string
          vps_auto_deploy: boolean
          vps_last_deploy_at: string | null
          vps_last_deploy_message: string | null
          vps_last_deploy_status: string | null
          vps_pm2_process: string | null
          vps_target_path: string | null
          vps_webhook_secret: string | null
          vps_webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          app_id?: string | null
          auth_type?: Database["public"]["Enums"]["github_auth_type"]
          branch?: string | null
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string
          id?: string
          installation_id?: string | null
          last_error?: string | null
          last_sync_at?: string | null
          permissions?: Json
          repo_name?: string | null
          repo_owner?: string | null
          status?: Database["public"]["Enums"]["github_integration_status"]
          updated_at?: string
          vps_auto_deploy?: boolean
          vps_last_deploy_at?: string | null
          vps_last_deploy_message?: string | null
          vps_last_deploy_status?: string | null
          vps_pm2_process?: string | null
          vps_target_path?: string | null
          vps_webhook_secret?: string | null
          vps_webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          app_id?: string | null
          auth_type?: Database["public"]["Enums"]["github_auth_type"]
          branch?: string | null
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string
          id?: string
          installation_id?: string | null
          last_error?: string | null
          last_sync_at?: string | null
          permissions?: Json
          repo_name?: string | null
          repo_owner?: string | null
          status?: Database["public"]["Enums"]["github_integration_status"]
          updated_at?: string
          vps_auto_deploy?: boolean
          vps_last_deploy_at?: string | null
          vps_last_deploy_message?: string | null
          vps_last_deploy_status?: string | null
          vps_pm2_process?: string | null
          vps_target_path?: string | null
          vps_webhook_secret?: string | null
          vps_webhook_url?: string | null
        }
        Relationships: []
      }
      invite_acceptances: {
        Row: {
          accepted_at: string
          accepted_email: string
          accepted_phone: string | null
          id: string
          invite_id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string
          accepted_email: string
          accepted_phone?: string | null
          id?: string
          invite_id: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string
          accepted_email?: string
          accepted_phone?: string | null
          id?: string
          invite_id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_acceptances_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "workspace_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          error: string | null
          finished_at: string | null
          id: string
          notes: string | null
          params: Json
          scheduled_for: string
          started_at: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          params?: Json
          scheduled_for: string
          started_at?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          params?: Json
          scheduled_for?: string
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      master_announcement_reads: {
        Row: {
          announcement_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "master_announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      master_announcements: {
        Row: {
          active: boolean
          body: string | null
          created_at: string
          created_by: string | null
          icon: string | null
          id: string
          is_seed: boolean
          link_url: string | null
          pinned: boolean
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string
          created_by?: string | null
          icon?: string | null
          id?: string
          is_seed?: boolean
          link_url?: string | null
          pinned?: boolean
          title: string
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string
          created_by?: string | null
          icon?: string | null
          id?: string
          is_seed?: boolean
          link_url?: string | null
          pinned?: boolean
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string
        }
        Relationships: []
      }
      master_notifications: {
        Row: {
          body: string | null
          created_at: string
          event_key: string
          id: string
          link: string | null
          payload: Json | null
          read_by: string[]
          severity: string
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          event_key: string
          id?: string
          link?: string | null
          payload?: Json | null
          read_by?: string[]
          severity?: string
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          event_key?: string
          id?: string
          link?: string | null
          payload?: Json | null
          read_by?: string[]
          severity?: string
          title?: string
        }
        Relationships: []
      }
      master_settings: {
        Row: {
          android_apk_download_url: string
          android_apk_updated_at: string | null
          android_apk_version: string
          audit_retention_days: number
          backup_destination: string
          baileys_enabled: boolean
          baileys_mode: string
          baileys_server_token: string | null
          baileys_server_url: string | null
          baileys_webhook_secret: string | null
          created_at: string
          cron_secret: string | null
          default_trial_days: number
          embedded_signup_enabled: boolean
          force_refresh_token: string
          group_history_enabled: boolean
          group_message_retention_hours: number
          id: number
          intro_duration_ms: number
          intro_show_on_app: boolean
          landing_comparison: Json
          landing_hero: Json
          landing_metrics: Json
          landing_sections: Json
          maintenance_banner_minutes_before: number
          maintenance_window_enabled: boolean
          maintenance_window_end: string
          maintenance_window_start: string
          manual_mode_enabled: boolean
          meta_app_id: string | null
          meta_app_secret: string | null
          meta_config_id: string | null
          nexchat_theme_enabled: boolean
          payments_allow_outside_business_hours: boolean
          payments_allow_resend_after_expiration: boolean
          payments_allow_workspace_custom_templates: boolean
          payments_allow_workspace_override_limits: boolean
          payments_auto_collection_enabled: boolean
          payments_cash_flow_enabled: boolean
          payments_customer_self_pix_enabled: boolean
          payments_default_business_hours_end: string
          payments_default_business_hours_start: string
          payments_default_max_amount: number
          payments_default_max_reminders_per_day: number
          payments_default_max_reminders_per_payment: number
          payments_default_min_amount: number
          payments_default_min_interval_minutes: number
          payments_default_pix_expiration_minutes: number
          payments_manual_confirm_admin_only: boolean
          payments_manual_confirm_require_proof: boolean
          payments_manual_confirm_require_reason: boolean
          payments_manual_confirmation_enabled: boolean
          payments_module_enabled: boolean
          payments_pause_on_agent_takeover: boolean
          payments_pause_on_customer_reply: boolean
          payments_pix_commands_enabled: boolean
          payments_reminders_enabled: boolean
          payments_require_admin_for_expired_regen: boolean
          payments_tpl_collection_paused: string
          payments_tpl_last_warning: string
          payments_tpl_payment_confirmed: string
          payments_tpl_payment_not_found: string
          payments_tpl_pix_expired: string
          payments_tpl_pix_generated: string
          payments_tpl_reminder: string
          public_signup_enabled: boolean
          segredo_block_after_attempts: number
          segredo_block_minutes: number
          segredo_password_hash: string | null
          segredo_session_minutes: number
          super_admin_notify_connection_id: string | null
          super_admin_phone_e164: string | null
          ui_theme_mode: string
          updated_at: string
          version_banner_enabled: boolean
          version_check_interval_seconds: number
          whatsapp_log_retention_days: number
          wuzapi_update_status: Json
        }
        Insert: {
          android_apk_download_url?: string
          android_apk_updated_at?: string | null
          android_apk_version?: string
          audit_retention_days?: number
          backup_destination?: string
          baileys_enabled?: boolean
          baileys_mode?: string
          baileys_server_token?: string | null
          baileys_server_url?: string | null
          baileys_webhook_secret?: string | null
          created_at?: string
          cron_secret?: string | null
          default_trial_days?: number
          embedded_signup_enabled?: boolean
          force_refresh_token?: string
          group_history_enabled?: boolean
          group_message_retention_hours?: number
          id?: number
          intro_duration_ms?: number
          intro_show_on_app?: boolean
          landing_comparison?: Json
          landing_hero?: Json
          landing_metrics?: Json
          landing_sections?: Json
          maintenance_banner_minutes_before?: number
          maintenance_window_enabled?: boolean
          maintenance_window_end?: string
          maintenance_window_start?: string
          manual_mode_enabled?: boolean
          meta_app_id?: string | null
          meta_app_secret?: string | null
          meta_config_id?: string | null
          nexchat_theme_enabled?: boolean
          payments_allow_outside_business_hours?: boolean
          payments_allow_resend_after_expiration?: boolean
          payments_allow_workspace_custom_templates?: boolean
          payments_allow_workspace_override_limits?: boolean
          payments_auto_collection_enabled?: boolean
          payments_cash_flow_enabled?: boolean
          payments_customer_self_pix_enabled?: boolean
          payments_default_business_hours_end?: string
          payments_default_business_hours_start?: string
          payments_default_max_amount?: number
          payments_default_max_reminders_per_day?: number
          payments_default_max_reminders_per_payment?: number
          payments_default_min_amount?: number
          payments_default_min_interval_minutes?: number
          payments_default_pix_expiration_minutes?: number
          payments_manual_confirm_admin_only?: boolean
          payments_manual_confirm_require_proof?: boolean
          payments_manual_confirm_require_reason?: boolean
          payments_manual_confirmation_enabled?: boolean
          payments_module_enabled?: boolean
          payments_pause_on_agent_takeover?: boolean
          payments_pause_on_customer_reply?: boolean
          payments_pix_commands_enabled?: boolean
          payments_reminders_enabled?: boolean
          payments_require_admin_for_expired_regen?: boolean
          payments_tpl_collection_paused?: string
          payments_tpl_last_warning?: string
          payments_tpl_payment_confirmed?: string
          payments_tpl_payment_not_found?: string
          payments_tpl_pix_expired?: string
          payments_tpl_pix_generated?: string
          payments_tpl_reminder?: string
          public_signup_enabled?: boolean
          segredo_block_after_attempts?: number
          segredo_block_minutes?: number
          segredo_password_hash?: string | null
          segredo_session_minutes?: number
          super_admin_notify_connection_id?: string | null
          super_admin_phone_e164?: string | null
          ui_theme_mode?: string
          updated_at?: string
          version_banner_enabled?: boolean
          version_check_interval_seconds?: number
          whatsapp_log_retention_days?: number
          wuzapi_update_status?: Json
        }
        Update: {
          android_apk_download_url?: string
          android_apk_updated_at?: string | null
          android_apk_version?: string
          audit_retention_days?: number
          backup_destination?: string
          baileys_enabled?: boolean
          baileys_mode?: string
          baileys_server_token?: string | null
          baileys_server_url?: string | null
          baileys_webhook_secret?: string | null
          created_at?: string
          cron_secret?: string | null
          default_trial_days?: number
          embedded_signup_enabled?: boolean
          force_refresh_token?: string
          group_history_enabled?: boolean
          group_message_retention_hours?: number
          id?: number
          intro_duration_ms?: number
          intro_show_on_app?: boolean
          landing_comparison?: Json
          landing_hero?: Json
          landing_metrics?: Json
          landing_sections?: Json
          maintenance_banner_minutes_before?: number
          maintenance_window_enabled?: boolean
          maintenance_window_end?: string
          maintenance_window_start?: string
          manual_mode_enabled?: boolean
          meta_app_id?: string | null
          meta_app_secret?: string | null
          meta_config_id?: string | null
          nexchat_theme_enabled?: boolean
          payments_allow_outside_business_hours?: boolean
          payments_allow_resend_after_expiration?: boolean
          payments_allow_workspace_custom_templates?: boolean
          payments_allow_workspace_override_limits?: boolean
          payments_auto_collection_enabled?: boolean
          payments_cash_flow_enabled?: boolean
          payments_customer_self_pix_enabled?: boolean
          payments_default_business_hours_end?: string
          payments_default_business_hours_start?: string
          payments_default_max_amount?: number
          payments_default_max_reminders_per_day?: number
          payments_default_max_reminders_per_payment?: number
          payments_default_min_amount?: number
          payments_default_min_interval_minutes?: number
          payments_default_pix_expiration_minutes?: number
          payments_manual_confirm_admin_only?: boolean
          payments_manual_confirm_require_proof?: boolean
          payments_manual_confirm_require_reason?: boolean
          payments_manual_confirmation_enabled?: boolean
          payments_module_enabled?: boolean
          payments_pause_on_agent_takeover?: boolean
          payments_pause_on_customer_reply?: boolean
          payments_pix_commands_enabled?: boolean
          payments_reminders_enabled?: boolean
          payments_require_admin_for_expired_regen?: boolean
          payments_tpl_collection_paused?: string
          payments_tpl_last_warning?: string
          payments_tpl_payment_confirmed?: string
          payments_tpl_payment_not_found?: string
          payments_tpl_pix_expired?: string
          payments_tpl_pix_generated?: string
          payments_tpl_reminder?: string
          public_signup_enabled?: boolean
          segredo_block_after_attempts?: number
          segredo_block_minutes?: number
          segredo_password_hash?: string | null
          segredo_session_minutes?: number
          super_admin_notify_connection_id?: string | null
          super_admin_phone_e164?: string | null
          ui_theme_mode?: string
          updated_at?: string
          version_banner_enabled?: boolean
          version_check_interval_seconds?: number
          whatsapp_log_retention_days?: number
          wuzapi_update_status?: Json
        }
        Relationships: [
          {
            foreignKeyName: "master_settings_super_admin_notify_connection_id_fkey"
            columns: ["super_admin_notify_connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      member_business_hours: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time?: string
          id?: string
          start_time?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_business_hours_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_phone_number_events: {
        Row: {
          action: string
          connection_id: string | null
          created_at: string
          id: string
          message: string | null
          meta_error_code: string | null
          meta_error_message: string | null
          metadata: Json
          profile_id: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          action: string
          connection_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          meta_error_code?: string | null
          meta_error_message?: string | null
          metadata?: Json
          profile_id?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          action?: string
          connection_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          meta_error_code?: string | null
          meta_error_message?: string | null
          metadata?: Json
          profile_id?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: []
      }
      monitor_heartbeat: {
        Row: {
          alert_sent: boolean
          created_at: string
          details: Json
          id: string
          last_alert_at: string | null
          latency_ms: number | null
          status: string
          target: string
        }
        Insert: {
          alert_sent?: boolean
          created_at?: string
          details?: Json
          id?: string
          last_alert_at?: string | null
          latency_ms?: number | null
          status: string
          target: string
        }
        Update: {
          alert_sent?: boolean
          created_at?: string
          details?: Json
          id?: string
          last_alert_at?: string | null
          latency_ms?: number | null
          status?: string
          target?: string
        }
        Relationships: []
      }
      notification_event_catalog: {
        Row: {
          category: string
          channels_supported: string[]
          created_at: string
          description: string | null
          event_key: string
          id: string
          is_active: boolean
          severity_default: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          channels_supported?: string[]
          created_at?: string
          description?: string | null
          event_key: string
          id?: string
          is_active?: boolean
          severity_default?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          channels_supported?: string[]
          created_at?: string
          description?: string | null
          event_key?: string
          id?: string
          is_active?: boolean
          severity_default?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_events: {
        Row: {
          conversation_id: string | null
          created_at: string
          error_message: string | null
          id: string
          metadata: Json
          provider: string
          status: string
          type: string
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json
          provider?: string
          status?: string
          type: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json
          provider?: string
          status?: string
          type?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          attempt: number
          channel: string
          created_at: string
          destination_id: string | null
          destination_label: string | null
          error_code: string | null
          error_friendly: string | null
          error_technical: string | null
          event_key: string
          id: string
          payload: Json | null
          severity: string
          status: string
        }
        Insert: {
          attempt?: number
          channel: string
          created_at?: string
          destination_id?: string | null
          destination_label?: string | null
          error_code?: string | null
          error_friendly?: string | null
          error_technical?: string | null
          event_key: string
          id?: string
          payload?: Json | null
          severity: string
          status: string
        }
        Update: {
          attempt?: number
          channel?: string
          created_at?: string
          destination_id?: string | null
          destination_label?: string | null
          error_code?: string | null
          error_friendly?: string | null
          error_technical?: string | null
          event_key?: string
          id?: string
          payload?: Json | null
          severity?: string
          status?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          notify_when_assigned_only: boolean
          notify_when_chat_open: boolean
          push_enabled: boolean
          quiet_hours_enabled: boolean
          quiet_hours_end: string
          quiet_hours_start: string
          sound_choice: string
          sound_enabled: boolean
          sound_volume: number
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notify_when_assigned_only?: boolean
          notify_when_chat_open?: boolean
          push_enabled?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          sound_choice?: string
          sound_enabled?: boolean
          sound_volume?: number
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notify_when_assigned_only?: boolean
          notify_when_chat_open?: boolean
          push_enabled?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          sound_choice?: string
          sound_enabled?: boolean
          sound_volume?: number
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      notification_rules: {
        Row: {
          created_at: string
          event_key: string
          id: string
          in_app_enabled: boolean
          min_severity: string
          telegram_destination_ids: string[]
          telegram_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_key: string
          id?: string
          in_app_enabled?: boolean
          min_severity?: string
          telegram_destination_ids?: string[]
          telegram_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_key?: string
          id?: string
          in_app_enabled?: boolean
          min_severity?: string
          telegram_destination_ids?: string[]
          telegram_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_rules_event_key_fkey"
            columns: ["event_key"]
            isOneToOne: true
            referencedRelation: "notification_event_catalog"
            referencedColumns: ["event_key"]
          },
        ]
      }
      notification_telegram_bots: {
        Row: {
          bot_token: string
          bot_username: string | null
          created_at: string
          id: string
          is_active: boolean
          last_test_error: string | null
          last_test_status: string | null
          last_tested_at: string | null
          name: string
          updated_at: string
        }
        Insert: {
          bot_token: string
          bot_username?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_test_error?: string | null
          last_test_status?: string | null
          last_tested_at?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          bot_token?: string
          bot_username?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_test_error?: string | null
          last_test_status?: string | null
          last_tested_at?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_telegram_destinations: {
        Row: {
          bot_id: string
          can_send: boolean
          chat_id: number
          chat_type: string
          created_at: string
          id: string
          is_active: boolean
          last_test_error: string | null
          last_test_status: string | null
          last_tested_at: string | null
          title: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          bot_id: string
          can_send?: boolean
          chat_id: number
          chat_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_test_error?: string | null
          last_test_status?: string | null
          last_tested_at?: string | null
          title?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          bot_id?: string
          can_send?: boolean
          chat_id?: number
          chat_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_test_error?: string | null
          last_test_status?: string | null
          last_tested_at?: string | null
          title?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_telegram_destinations_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "notification_telegram_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_seed: boolean
          level: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_seed?: boolean
          level?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_seed?: boolean
          level?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      payment_collection_events: {
        Row: {
          channel_provider: string | null
          connection_id: string | null
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          message_body: string | null
          metadata: Json
          payment_request_id: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          channel_provider?: string | null
          connection_id?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          message_body?: string | null
          metadata?: Json
          payment_request_id?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          channel_provider?: string | null
          connection_id?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          message_body?: string | null
          metadata?: Json
          payment_request_id?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_collection_events_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "pix_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_collection_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateway_catalog: {
        Row: {
          base_url: string | null
          created_at: string
          description: string | null
          docs_url: string | null
          enabled_globally: boolean
          global_status: Database["public"]["Enums"]["gateway_global_status"]
          id: string
          is_implemented: boolean
          logo: string | null
          logo_url: string | null
          name: string
          notes: string | null
          provider_key: string
          sort_order: number
          supports_dynamic_qr: boolean
          supports_pix: boolean
          supports_refund: boolean
          supports_static_qr: boolean
          supports_webhook: boolean
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          created_at?: string
          description?: string | null
          docs_url?: string | null
          enabled_globally?: boolean
          global_status?: Database["public"]["Enums"]["gateway_global_status"]
          id?: string
          is_implemented?: boolean
          logo?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          provider_key: string
          sort_order?: number
          supports_dynamic_qr?: boolean
          supports_pix?: boolean
          supports_refund?: boolean
          supports_static_qr?: boolean
          supports_webhook?: boolean
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          created_at?: string
          description?: string | null
          docs_url?: string | null
          enabled_globally?: boolean
          global_status?: Database["public"]["Enums"]["gateway_global_status"]
          id?: string
          is_implemented?: boolean
          logo?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          provider_key?: string
          sort_order?: number
          supports_dynamic_qr?: boolean
          supports_pix?: boolean
          supports_refund?: boolean
          supports_static_qr?: boolean
          supports_webhook?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          base_url: string
          client_id: string | null
          client_secret: string | null
          created_at: string
          environment: string
          id: string
          is_active: boolean
          is_default: boolean
          label: string
          notes: string | null
          provider: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          base_url?: string
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          label?: string
          notes?: string | null
          provider: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          base_url?: string
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          label?: string
          notes?: string | null
          provider?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      payment_manual_confirmations: {
        Row: {
          amount: number
          confirmed_by_user_id: string
          created_at: string
          id: string
          metadata: Json
          payment_request_id: string
          proof_url: string | null
          reason: string
          workspace_id: string
        }
        Insert: {
          amount: number
          confirmed_by_user_id: string
          created_at?: string
          id?: string
          metadata?: Json
          payment_request_id: string
          proof_url?: string | null
          reason: string
          workspace_id: string
        }
        Update: {
          amount?: number
          confirmed_by_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          payment_request_id?: string
          proof_url?: string | null
          reason?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_manual_confirmations_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "pix_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_manual_confirmations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pix_static_keys: {
        Row: {
          beneficiary_city: string
          beneficiary_name: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_default: boolean
          key_type: string
          key_value: string
          label: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          beneficiary_city?: string
          beneficiary_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          key_type: string
          key_value: string
          label: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          beneficiary_city?: string
          beneficiary_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          key_type?: string
          key_value?: string
          label?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pix_static_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pix_transactions: {
        Row: {
          amount: number
          cancelled_at: string | null
          client_transaction_id: string | null
          connection_id: string | null
          contact_id: string | null
          conversation_id: string | null
          copy_paste: string | null
          created_at: string
          created_by: string | null
          created_by_type: string
          description: string | null
          end_to_end_id: string | null
          expires_at: string | null
          external_transaction_id: string | null
          fee: number | null
          id: string
          metadata: Json
          paid_at: string | null
          payer_document: string | null
          payer_name: string | null
          provider: string
          purpose: string | null
          qrcode_base64: string | null
          qrcode_url: string | null
          raw_payload: Json | null
          reference_id: string | null
          status: string
          transaction_method: string
          transaction_type: string
          updated_at: string
          webhook_payload: Json | null
          workspace_id: string | null
        }
        Insert: {
          amount: number
          cancelled_at?: string | null
          client_transaction_id?: string | null
          connection_id?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          copy_paste?: string | null
          created_at?: string
          created_by?: string | null
          created_by_type?: string
          description?: string | null
          end_to_end_id?: string | null
          expires_at?: string | null
          external_transaction_id?: string | null
          fee?: number | null
          id?: string
          metadata?: Json
          paid_at?: string | null
          payer_document?: string | null
          payer_name?: string | null
          provider?: string
          purpose?: string | null
          qrcode_base64?: string | null
          qrcode_url?: string | null
          raw_payload?: Json | null
          reference_id?: string | null
          status?: string
          transaction_method?: string
          transaction_type?: string
          updated_at?: string
          webhook_payload?: Json | null
          workspace_id?: string | null
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          client_transaction_id?: string | null
          connection_id?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          copy_paste?: string | null
          created_at?: string
          created_by?: string | null
          created_by_type?: string
          description?: string | null
          end_to_end_id?: string | null
          expires_at?: string | null
          external_transaction_id?: string | null
          fee?: number | null
          id?: string
          metadata?: Json
          paid_at?: string | null
          payer_document?: string | null
          payer_name?: string | null
          provider?: string
          purpose?: string | null
          qrcode_base64?: string | null
          qrcode_url?: string | null
          raw_payload?: Json | null
          reference_id?: string | null
          status?: string
          transaction_method?: string
          transaction_type?: string
          updated_at?: string
          webhook_payload?: Json | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pix_transactions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          allow_byok: boolean
          allow_embedded_signup: boolean
          allow_white_label: boolean
          created_at: string
          currency: string
          description: string | null
          features: Json
          id: string
          interval: string
          max_campaigns_per_month: number
          max_connections: number
          max_messages_per_month: number
          max_sectors: number
          max_users: number
          name: string
          price_cents: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          allow_byok?: boolean
          allow_embedded_signup?: boolean
          allow_white_label?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          interval?: string
          max_campaigns_per_month?: number
          max_connections?: number
          max_messages_per_month?: number
          max_sectors?: number
          max_users?: number
          name: string
          price_cents?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          allow_byok?: boolean
          allow_embedded_signup?: boolean
          allow_white_label?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          interval?: string
          max_campaigns_per_month?: number
          max_connections?: number
          max_messages_per_month?: number
          max_sectors?: number
          max_users?: number
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          address_complement: string | null
          avatar_url: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          country: string | null
          created_at: string
          ddi: string | null
          document: string | null
          document_type: string | null
          email: string | null
          full_name: string | null
          id: string
          last_name: string | null
          neighborhood: string | null
          onboarding_completed_at: string | null
          onboarding_step: number
          phone: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          ddi?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          neighborhood?: string | null
          onboarding_completed_at?: string | null
          onboarding_step?: number
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          ddi?: string | null
          document?: string | null
          document_type?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          neighborhood?: string | null
          onboarding_completed_at?: string | null
          onboarding_step?: number
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          endpoint: string | null
          external_id: string | null
          id: string
          is_active: boolean
          last_seen_at: string
          os: string | null
          provider: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          endpoint?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string
          os?: string | null
          provider?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          endpoint?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string
          os?: string | null
          provider?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      quick_replies: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          is_seed: boolean
          sector_id: string | null
          shortcut: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_seed?: boolean
          sector_id?: string | null
          shortcut: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_seed?: boolean
          sector_id?: string | null
          shortcut?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_replies_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_replies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      random_message_groups: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_seed: boolean
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_seed?: boolean
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_seed?: boolean
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      random_message_variants: {
        Row: {
          body: string
          created_at: string
          group_id: string
          id: string
          is_seed: boolean
          sort_order: number
          workspace_id: string
        }
        Insert: {
          body: string
          created_at?: string
          group_id: string
          id?: string
          is_seed?: boolean
          sort_order?: number
          workspace_id: string
        }
        Update: {
          body?: string
          created_at?: string
          group_id?: string
          id?: string
          is_seed?: boolean
          sort_order?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "random_message_variants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "random_message_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          actor_user_id: string | null
          blocked_until: string | null
          count: number
          created_at: string
          id: string
          ip_hash: string | null
          limit_value: number
          metadata: Json
          updated_at: string
          window_start: string
          workspace_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          blocked_until?: string | null
          count?: number
          created_at?: string
          id?: string
          ip_hash?: string | null
          limit_value: number
          metadata?: Json
          updated_at?: string
          window_start?: string
          workspace_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          blocked_until?: string | null
          count?: number
          created_at?: string
          id?: string
          ip_hash?: string | null
          limit_value?: number
          metadata?: Json
          updated_at?: string
          window_start?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      removed_qr_connections: {
        Row: {
          expires_at: string
          gateway_connection_id: string
          id: string
          removed_at: string
          removed_by: string | null
          workspace_id: string | null
        }
        Insert: {
          expires_at?: string
          gateway_connection_id: string
          id?: string
          removed_at?: string
          removed_by?: string | null
          workspace_id?: string | null
        }
        Update: {
          expires_at?: string
          gateway_connection_id?: string
          id?: string
          removed_at?: string
          removed_by?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      satisfaction_ratings: {
        Row: {
          comment: string | null
          contact_id: string
          created_at: string
          id: string
          is_seed: boolean
          rating: number
          ticket_id: string
          workspace_id: string
        }
        Insert: {
          comment?: string | null
          contact_id: string
          created_at?: string
          id?: string
          is_seed?: boolean
          rating: number
          ticket_id: string
          workspace_id: string
        }
        Update: {
          comment?: string | null
          contact_id?: string
          created_at?: string
          id?: string
          is_seed?: boolean
          rating?: number
          ticket_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_ratings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "satisfaction_ratings_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "satisfaction_ratings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_seed: boolean
          notes: string | null
          scheduled_at: string
          status: string
          ticket_id: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_seed?: boolean
          notes?: string | null
          scheduled_at: string
          status?: string
          ticket_id?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_seed?: boolean
          notes?: string | null
          scheduled_at?: string
          status?: string
          ticket_id?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      sectors: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          is_seed: boolean
          name: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_seed?: boolean
          name: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_seed?: boolean
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sectors_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_cents: number | null
          created_at: string
          current_period_end: string | null
          current_period_start: string
          gateway: string | null
          gateway_subscription_id: string | null
          id: string
          pix_copy_paste: string | null
          pix_expires_at: string | null
          pix_qr_code: string | null
          plan_id: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          gateway?: string | null
          gateway_subscription_id?: string | null
          id?: string
          pix_copy_paste?: string | null
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          plan_id: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          gateway?: string | null
          gateway_subscription_id?: string | null
          id?: string
          pix_copy_paste?: string | null
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      system_error_log: {
        Row: {
          actor_user_id: string | null
          area: string
          code: string | null
          context: Json
          created_at: string
          id: string
          message: string
          request_id: string | null
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          stack: string | null
          ticket_id: string | null
          workspace_id: string | null
        }
        Insert: {
          actor_user_id?: string | null
          area: string
          code?: string | null
          context?: Json
          created_at?: string
          id?: string
          message: string
          request_id?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          stack?: string | null
          ticket_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          actor_user_id?: string | null
          area?: string
          code?: string | null
          context?: Json
          created_at?: string
          id?: string
          message?: string
          request_id?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          stack?: string | null
          ticket_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_error_log_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_error_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      system_jobs: {
        Row: {
          created_at: string
          cron_expr: string
          description: string | null
          enabled: boolean
          endpoint_path: string
          error_count: number
          id: string
          last_duration_ms: number | null
          last_error: string | null
          last_run_at: string | null
          last_status: string | null
          name: string
          run_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          cron_expr: string
          description?: string | null
          enabled?: boolean
          endpoint_path: string
          error_count?: number
          id?: string
          last_duration_ms?: number | null
          last_error?: string | null
          last_run_at?: string | null
          last_status?: string | null
          name: string
          run_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          cron_expr?: string
          description?: string | null
          enabled?: boolean
          endpoint_path?: string
          error_count?: number
          id?: string
          last_duration_ms?: number | null
          last_error?: string | null
          last_run_at?: string | null
          last_status?: string | null
          name?: string
          run_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_routes: {
        Row: {
          area: string
          category: string
          created_at: string
          id: string
          label: string
          last_checked_at: string | null
          notes: string | null
          path: string
          permission: string | null
          sort_order: number
          status: string
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          area?: string
          category: string
          created_at?: string
          id?: string
          label: string
          last_checked_at?: string | null
          notes?: string | null
          path: string
          permission?: string | null
          sort_order?: number
          status?: string
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          area?: string
          category?: string
          created_at?: string
          id?: string
          label?: string
          last_checked_at?: string | null
          notes?: string | null
          path?: string
          permission?: string | null
          sort_order?: number
          status?: string
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_seed: boolean
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_seed?: boolean
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_seed?: boolean
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      ticket_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          ticket_id: string
          workspace_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          ticket_id: string
          workspace_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          ticket_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_events_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          author: Database["public"]["Enums"]["message_author"]
          author_user_id: string | null
          body: string | null
          channel_type: string | null
          connection_id: string | null
          created_at: string
          delivery: Database["public"]["Enums"]["message_delivery"]
          external_id: string | null
          id: string
          is_history_imported: boolean
          is_internal_note: boolean
          is_seed: boolean
          kind: Database["public"]["Enums"]["message_kind"]
          media_mime: string | null
          media_size_bytes: number | null
          media_status: string
          media_storage_path: string | null
          media_url: string | null
          meta_message_type: string | null
          provider: string | null
          raw_payload_sanitized: Json
          sender_contact_id: string | null
          ticket_id: string
          workspace_id: string
        }
        Insert: {
          author: Database["public"]["Enums"]["message_author"]
          author_user_id?: string | null
          body?: string | null
          channel_type?: string | null
          connection_id?: string | null
          created_at?: string
          delivery?: Database["public"]["Enums"]["message_delivery"]
          external_id?: string | null
          id?: string
          is_history_imported?: boolean
          is_internal_note?: boolean
          is_seed?: boolean
          kind?: Database["public"]["Enums"]["message_kind"]
          media_mime?: string | null
          media_size_bytes?: number | null
          media_status?: string
          media_storage_path?: string | null
          media_url?: string | null
          meta_message_type?: string | null
          provider?: string | null
          raw_payload_sanitized?: Json
          sender_contact_id?: string | null
          ticket_id: string
          workspace_id: string
        }
        Update: {
          author?: Database["public"]["Enums"]["message_author"]
          author_user_id?: string | null
          body?: string | null
          channel_type?: string | null
          connection_id?: string | null
          created_at?: string
          delivery?: Database["public"]["Enums"]["message_delivery"]
          external_id?: string | null
          id?: string
          is_history_imported?: boolean
          is_internal_note?: boolean
          is_seed?: boolean
          kind?: Database["public"]["Enums"]["message_kind"]
          media_mime?: string | null
          media_size_bytes?: number | null
          media_status?: string
          media_storage_path?: string | null
          media_url?: string | null
          meta_message_type?: string | null
          provider?: string | null
          raw_payload_sanitized?: Json
          sender_contact_id?: string | null
          ticket_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_sender_contact_id_fkey"
            columns: ["sender_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assignee_id: string | null
          channel: Database["public"]["Enums"]["ticket_channel"]
          channel_type: string
          chat_id: string | null
          closed_at: string | null
          connection_id: string | null
          contact_id: string
          created_at: string
          first_response_at: string | null
          group_id: string | null
          id: string
          is_seed: boolean
          last_message_at: string | null
          last_message_preview: string | null
          number: number
          opened_at: string
          phone_number_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          sector_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string | null
          unread_count: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assignee_id?: string | null
          channel?: Database["public"]["Enums"]["ticket_channel"]
          channel_type?: string
          chat_id?: string | null
          closed_at?: string | null
          connection_id?: string | null
          contact_id: string
          created_at?: string
          first_response_at?: string | null
          group_id?: string | null
          id?: string
          is_seed?: boolean
          last_message_at?: string | null
          last_message_preview?: string | null
          number?: number
          opened_at?: string
          phone_number_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          sector_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string | null
          unread_count?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assignee_id?: string | null
          channel?: Database["public"]["Enums"]["ticket_channel"]
          channel_type?: string
          chat_id?: string | null
          closed_at?: string | null
          connection_id?: string | null
          contact_id?: string
          created_at?: string
          first_response_at?: string | null
          group_id?: string | null
          id?: string
          is_seed?: boolean
          last_message_at?: string | null
          last_message_preview?: string | null
          number?: number
          opened_at?: string
          phone_number_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          sector_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string | null
          unread_count?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_forward_targets: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          error_count: number
          forward_count: number
          id: string
          last_error: string | null
          last_error_at: string | null
          last_forward_at: string | null
          name: string
          phone_number_id: string | null
          secret: string | null
          target_url: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          error_count?: number
          forward_count?: number
          id?: string
          last_error?: string | null
          last_error_at?: string | null
          last_forward_at?: string | null
          name: string
          phone_number_id?: string | null
          secret?: string | null
          target_url: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          error_count?: number
          forward_count?: number
          id?: string
          last_error?: string | null
          last_error_at?: string | null
          last_forward_at?: string | null
          name?: string
          phone_number_id?: string | null
          secret?: string | null
          target_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_trace: {
        Row: {
          chat_id: string | null
          connection_id: string | null
          contact_phone: string | null
          correlation_id: string
          created_at: string
          direction: string | null
          error_reason: string | null
          http_status: number | null
          id: string
          is_group: boolean | null
          media_kind: string | null
          payload_summary: Json | null
          source: string | null
          stage: string
          workspace_id: string | null
        }
        Insert: {
          chat_id?: string | null
          connection_id?: string | null
          contact_phone?: string | null
          correlation_id: string
          created_at?: string
          direction?: string | null
          error_reason?: string | null
          http_status?: number | null
          id?: string
          is_group?: boolean | null
          media_kind?: string | null
          payload_summary?: Json | null
          source?: string | null
          stage: string
          workspace_id?: string | null
        }
        Update: {
          chat_id?: string | null
          connection_id?: string | null
          contact_phone?: string | null
          correlation_id?: string
          created_at?: string
          direction?: string | null
          error_reason?: string | null
          http_status?: number | null
          id?: string
          is_group?: boolean | null
          media_kind?: string | null
          payload_summary?: Json | null
          source?: string | null
          stage?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      whatsapp_auto_messages: {
        Row: {
          away_enabled: boolean
          away_text: string
          connection_id: string
          created_at: string
          greeting_enabled: boolean
          greeting_text: string
          id: string
          timezone: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          away_enabled?: boolean
          away_text?: string
          connection_id: string
          created_at?: string
          greeting_enabled?: boolean
          greeting_text?: string
          id?: string
          timezone?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          away_enabled?: boolean
          away_text?: string
          connection_id?: string
          created_at?: string
          greeting_enabled?: boolean
          greeting_text?: string
          id?: string
          timezone?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      whatsapp_business_hours: {
        Row: {
          connection_id: string
          created_at: string
          enabled: boolean
          end_time: string
          id: string
          start_time: string
          updated_at: string
          weekday: number
          workspace_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          enabled?: boolean
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string
          weekday: number
          workspace_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          enabled?: boolean
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string
          weekday?: number
          workspace_id?: string
        }
        Relationships: []
      }
      whatsapp_calls: {
        Row: {
          call_id: string | null
          connection_id: string
          created_at: string
          duration_sec: number | null
          ended_at: string | null
          from_jid: string
          from_phone: string | null
          id: string
          is_group: boolean
          is_video: boolean
          kind: string
          offered_at: string | null
          raw: Json
          status: string | null
          ticket_id: string | null
          workspace_id: string
        }
        Insert: {
          call_id?: string | null
          connection_id: string
          created_at?: string
          duration_sec?: number | null
          ended_at?: string | null
          from_jid: string
          from_phone?: string | null
          id?: string
          is_group?: boolean
          is_video?: boolean
          kind: string
          offered_at?: string | null
          raw?: Json
          status?: string | null
          ticket_id?: string | null
          workspace_id: string
        }
        Update: {
          call_id?: string | null
          connection_id?: string
          created_at?: string
          duration_sec?: number | null
          ended_at?: string | null
          from_jid?: string
          from_phone?: string | null
          id?: string
          is_group?: boolean
          is_video?: boolean
          kind?: string
          offered_at?: string | null
          raw?: Json
          status?: string | null
          ticket_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_calls_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_calls_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_calls_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_connections: {
        Row: {
          access_token: string | null
          app_secret: string | null
          baileys_meta: Json
          baileys_server_url: string | null
          baileys_session_id: string | null
          code_request_cooldown_until: string | null
          connection_mode: string
          country_code: string | null
          created_at: string
          default_assignee_id: string | null
          default_sector_id: string | null
          display_name: string | null
          display_phone_number: string | null
          error_count: number
          formatted_phone_number: string | null
          id: string
          is_seed: boolean
          last_error: string | null
          last_error_at: string | null
          last_webhook_at: string | null
          last_webhook_validated_at: string | null
          messaging_tier: string | null
          meta_app_id: string | null
          meta_status: string | null
          migration_last_error: string | null
          migration_status: string | null
          name: string
          name_status: string | null
          onboarding_mode: string
          phone: string | null
          phone_number_id: string | null
          pin_set: boolean
          profile_id: string | null
          profile_picture_synced_at: string | null
          profile_picture_url: string | null
          provider: string
          qr_code: string | null
          quality_rating: string | null
          registered_at: string | null
          selected_webhook_events: Json
          session_data: Json | null
          status: string
          updated_at: string
          verification_method: string | null
          verify_token: string | null
          waba_id: string | null
          webhook_signature_mode: string
          workspace_id: string
        }
        Insert: {
          access_token?: string | null
          app_secret?: string | null
          baileys_meta?: Json
          baileys_server_url?: string | null
          baileys_session_id?: string | null
          code_request_cooldown_until?: string | null
          connection_mode?: string
          country_code?: string | null
          created_at?: string
          default_assignee_id?: string | null
          default_sector_id?: string | null
          display_name?: string | null
          display_phone_number?: string | null
          error_count?: number
          formatted_phone_number?: string | null
          id?: string
          is_seed?: boolean
          last_error?: string | null
          last_error_at?: string | null
          last_webhook_at?: string | null
          last_webhook_validated_at?: string | null
          messaging_tier?: string | null
          meta_app_id?: string | null
          meta_status?: string | null
          migration_last_error?: string | null
          migration_status?: string | null
          name: string
          name_status?: string | null
          onboarding_mode?: string
          phone?: string | null
          phone_number_id?: string | null
          pin_set?: boolean
          profile_id?: string | null
          profile_picture_synced_at?: string | null
          profile_picture_url?: string | null
          provider?: string
          qr_code?: string | null
          quality_rating?: string | null
          registered_at?: string | null
          selected_webhook_events?: Json
          session_data?: Json | null
          status?: string
          updated_at?: string
          verification_method?: string | null
          verify_token?: string | null
          waba_id?: string | null
          webhook_signature_mode?: string
          workspace_id: string
        }
        Update: {
          access_token?: string | null
          app_secret?: string | null
          baileys_meta?: Json
          baileys_server_url?: string | null
          baileys_session_id?: string | null
          code_request_cooldown_until?: string | null
          connection_mode?: string
          country_code?: string | null
          created_at?: string
          default_assignee_id?: string | null
          default_sector_id?: string | null
          display_name?: string | null
          display_phone_number?: string | null
          error_count?: number
          formatted_phone_number?: string | null
          id?: string
          is_seed?: boolean
          last_error?: string | null
          last_error_at?: string | null
          last_webhook_at?: string | null
          last_webhook_validated_at?: string | null
          messaging_tier?: string | null
          meta_app_id?: string | null
          meta_status?: string | null
          migration_last_error?: string | null
          migration_status?: string | null
          name?: string
          name_status?: string | null
          onboarding_mode?: string
          phone?: string | null
          phone_number_id?: string | null
          pin_set?: boolean
          profile_id?: string | null
          profile_picture_synced_at?: string | null
          profile_picture_url?: string | null
          provider?: string
          qr_code?: string | null
          quality_rating?: string | null
          registered_at?: string | null
          selected_webhook_events?: Json
          session_data?: Json | null
          status?: string
          updated_at?: string
          verification_method?: string | null
          verify_token?: string | null
          waba_id?: string | null
          webhook_signature_mode?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          jid: string
          joined_at: string | null
          left_at: string | null
          push_name: string | null
          role: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          jid: string
          joined_at?: string | null
          left_at?: string | null
          push_name?: string | null
          role?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          jid?: string
          joined_at?: string | null
          left_at?: string | null
          push_name?: string | null
          role?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_group_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_groups: {
        Row: {
          connection_id: string
          created_at: string
          description: string | null
          id: string
          is_announce: boolean
          is_locked: boolean
          jid: string
          name: string | null
          owner_jid: string | null
          participant_count: number
          picture_synced_at: string | null
          picture_url: string | null
          raw: Json
          subject: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_announce?: boolean
          is_locked?: boolean
          jid: string
          name?: string | null
          owner_jid?: string | null
          participant_count?: number
          picture_synced_at?: string | null
          picture_url?: string | null
          raw?: Json
          subject?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_announce?: boolean
          is_locked?: boolean
          jid?: string
          name?: string | null
          owner_jid?: string | null
          participant_count?: number
          picture_synced_at?: string | null
          picture_url?: string | null
          raw?: Json
          subject?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_groups_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_groups_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_holidays: {
        Row: {
          connection_id: string
          created_at: string
          date: string
          id: string
          label: string | null
          workspace_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          date: string
          id?: string
          label?: string | null
          workspace_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          date?: string
          id?: string
          label?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      whatsapp_media_jobs: {
        Row: {
          attempts: number
          connection_id: string
          created_at: string
          external_message_id: string | null
          id: string
          last_error: string | null
          max_attempts: number
          media_type: string
          next_attempt_at: string
          processed_at: string | null
          raw_message: Json | null
          status: string
          ticket_message_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          attempts?: number
          connection_id: string
          created_at?: string
          external_message_id?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number
          media_type: string
          next_attempt_at?: string
          processed_at?: string | null
          raw_message?: Json | null
          status?: string
          ticket_message_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          attempts?: number
          connection_id?: string
          created_at?: string
          external_message_id?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number
          media_type?: string
          next_attempt_at?: string
          processed_at?: string | null
          raw_message?: Json | null
          status?: string
          ticket_message_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_media_jobs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_media_jobs_ticket_message_id_fkey"
            columns: ["ticket_message_id"]
            isOneToOne: false
            referencedRelation: "ticket_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_media_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_message_log: {
        Row: {
          body: string | null
          connection_id: string
          contact_phone: string
          created_at: string
          direction: string
          error_code: string | null
          error_message: string | null
          id: string
          is_template: boolean
          message_id: string | null
          message_type: string
          meta_from: string | null
          meta_phone_number_id: string | null
          meta_timestamp: string | null
          raw_payload_sanitized: Json
          status: string
          template_name: string | null
          ticket_id: string | null
          workspace_id: string
        }
        Insert: {
          body?: string | null
          connection_id: string
          contact_phone: string
          created_at?: string
          direction: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          is_template?: boolean
          message_id?: string | null
          message_type?: string
          meta_from?: string | null
          meta_phone_number_id?: string | null
          meta_timestamp?: string | null
          raw_payload_sanitized?: Json
          status?: string
          template_name?: string | null
          ticket_id?: string | null
          workspace_id: string
        }
        Update: {
          body?: string | null
          connection_id?: string
          contact_phone?: string
          created_at?: string
          direction?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          is_template?: boolean
          message_id?: string | null
          message_type?: string
          meta_from?: string | null
          meta_phone_number_id?: string | null
          meta_timestamp?: string | null
          raw_payload_sanitized?: Json
          status?: string
          template_name?: string | null
          ticket_id?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      whatsapp_meta_profiles: {
        Row: {
          access_token: string
          app_secret: string | null
          created_at: string
          created_by: string | null
          id: string
          last_checked_at: string | null
          last_error: string | null
          name: string
          status: string
          updated_at: string
          waba_id: string
          workspace_id: string
        }
        Insert: {
          access_token: string
          app_secret?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          name: string
          status?: string
          updated_at?: string
          waba_id: string
          workspace_id: string
        }
        Update: {
          access_token?: string
          app_secret?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          name?: string
          status?: string
          updated_at?: string
          waba_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      whatsapp_presence: {
        Row: {
          connection_id: string
          contact_phone: string
          last_seen_at: string | null
          state: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          connection_id: string
          contact_phone: string
          last_seen_at?: string | null
          state?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          connection_id?: string
          contact_phone?: string
          last_seen_at?: string | null
          state?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_presence_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_presence_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_rate_state: {
        Row: {
          connection_id: string
          consecutive_errors: number
          cooldown_until: string | null
          hour_bucket: string
          hour_count: number
          last_429_at: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          connection_id: string
          consecutive_errors?: number
          cooldown_until?: string | null
          hour_bucket?: string
          hour_count?: number
          last_429_at?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          connection_id?: string
          consecutive_errors?: number
          cooldown_until?: string | null
          hour_bucket?: string
          hour_count?: number
          last_429_at?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      whatsapp_rate_state_backup_20260527_162021: {
        Row: {
          connection_id: string | null
          consecutive_errors: number | null
          cooldown_until: string | null
          hour_bucket: string | null
          hour_count: number | null
          last_429_at: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          connection_id?: string | null
          consecutive_errors?: number | null
          cooldown_until?: string | null
          hour_bucket?: string | null
          hour_count?: number | null
          last_429_at?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          connection_id?: string | null
          consecutive_errors?: number | null
          cooldown_until?: string | null
          hour_bucket?: string | null
          hour_count?: number | null
          last_429_at?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      whatsapp_rate_state_backup_20260527_162908: {
        Row: {
          connection_id: string | null
          consecutive_errors: number | null
          cooldown_until: string | null
          hour_bucket: string | null
          hour_count: number | null
          last_429_at: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          connection_id?: string | null
          consecutive_errors?: number | null
          cooldown_until?: string | null
          hour_bucket?: string | null
          hour_count?: number | null
          last_429_at?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          connection_id?: string | null
          consecutive_errors?: number | null
          cooldown_until?: string | null
          hour_bucket?: string | null
          hour_count?: number | null
          last_429_at?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          body: string
          buttons: Json
          category: string
          connection_id: string | null
          created_at: string
          created_by: string | null
          footer: string | null
          header: string | null
          id: string
          is_seed: boolean
          language: string
          last_synced_at: string | null
          meta_template_id: string | null
          name: string
          rejection_reason: string | null
          status: string
          updated_at: string
          variables: Json
          workspace_id: string
        }
        Insert: {
          body: string
          buttons?: Json
          category?: string
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          footer?: string | null
          header?: string | null
          id?: string
          is_seed?: boolean
          language?: string
          last_synced_at?: string | null
          meta_template_id?: string | null
          name: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          variables?: Json
          workspace_id: string
        }
        Update: {
          body?: string
          buttons?: Json
          category?: string
          connection_id?: string | null
          created_at?: string
          created_by?: string | null
          footer?: string | null
          header?: string | null
          id?: string
          is_seed?: boolean
          language?: string
          last_synced_at?: string | null
          meta_template_id?: string | null
          name?: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          variables?: Json
          workspace_id?: string
        }
        Relationships: []
      }
      whatsapp_webhook_events: {
        Row: {
          connection_id: string
          created_at: string
          error: string | null
          event_type: string
          http_method: string
          id: string
          phone_number_id: string | null
          raw_payload: Json
          signature_valid: boolean
          status_code: number
          workspace_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          error?: string | null
          event_type?: string
          http_method?: string
          id?: string
          phone_number_id?: string | null
          raw_payload?: Json
          signature_valid?: boolean
          status_code?: number
          workspace_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          error?: string | null
          event_type?: string
          http_method?: string
          id?: string
          phone_number_id?: string | null
          raw_payload?: Json
          signature_valid?: boolean
          status_code?: number
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_ai_keys: {
        Row: {
          active: boolean
          api_key: string
          created_at: string
          id: string
          last_test_at: string | null
          last_test_error: string | null
          last_test_ok: boolean | null
          provider: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          api_key: string
          created_at?: string
          id?: string
          last_test_at?: string | null
          last_test_error?: string | null
          last_test_ok?: boolean | null
          provider: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          api_key?: string
          created_at?: string
          id?: string
          last_test_at?: string | null
          last_test_error?: string | null
          last_test_ok?: boolean | null
          provider?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_announcement_reads: {
        Row: {
          announcement_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "workspace_announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_announcements: {
        Row: {
          active: boolean
          body: string | null
          created_at: string
          created_by: string | null
          icon: string | null
          id: string
          is_seed: boolean
          link_url: string | null
          pinned: boolean
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string
          created_by?: string | null
          icon?: string | null
          id?: string
          is_seed?: boolean
          link_url?: string | null
          pinned?: boolean
          title: string
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string
          created_by?: string | null
          icon?: string | null
          id?: string
          is_seed?: boolean
          link_url?: string | null
          pinned?: boolean
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_api_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          revoked: boolean
          scopes: string[]
          token_hash: string
          token_prefix: string
          updated_at: string
          use_count: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          revoked?: boolean
          scopes?: string[]
          token_hash: string
          token_prefix: string
          updated_at?: string
          use_count?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          revoked?: boolean
          scopes?: string[]
          token_hash?: string
          token_prefix?: string
          updated_at?: string
          use_count?: number
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_branding: {
        Row: {
          brand_name: string | null
          created_at: string
          email_from_name: string | null
          favicon_url: string | null
          hide_lovable_brand: boolean
          login_background_url: string | null
          logo_url: string | null
          primary_color: string | null
          sidebar_bg: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          brand_name?: string | null
          created_at?: string
          email_from_name?: string | null
          favicon_url?: string | null
          hide_lovable_brand?: boolean
          login_background_url?: string | null
          logo_url?: string | null
          primary_color?: string | null
          sidebar_bg?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          brand_name?: string | null
          created_at?: string
          email_from_name?: string | null
          favicon_url?: string | null
          hide_lovable_brand?: boolean
          login_background_url?: string | null
          logo_url?: string | null
          primary_color?: string | null
          sidebar_bg?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_controls: {
        Row: {
          banner_enabled: boolean
          banner_level: string
          banner_text: string | null
          block_ai: boolean
          block_campaigns: boolean
          block_new_signups: boolean
          block_whatsapp_interactive: boolean
          block_whatsapp_media: boolean
          block_whatsapp_send: boolean
          created_at: string
          is_paused: boolean
          paused_at: string | null
          paused_by_security: boolean
          paused_reason: string | null
          subscription_status: string
          updated_at: string
          white_label_override: boolean | null
          workspace_id: string
        }
        Insert: {
          banner_enabled?: boolean
          banner_level?: string
          banner_text?: string | null
          block_ai?: boolean
          block_campaigns?: boolean
          block_new_signups?: boolean
          block_whatsapp_interactive?: boolean
          block_whatsapp_media?: boolean
          block_whatsapp_send?: boolean
          created_at?: string
          is_paused?: boolean
          paused_at?: string | null
          paused_by_security?: boolean
          paused_reason?: string | null
          subscription_status?: string
          updated_at?: string
          white_label_override?: boolean | null
          workspace_id: string
        }
        Update: {
          banner_enabled?: boolean
          banner_level?: string
          banner_text?: string | null
          block_ai?: boolean
          block_campaigns?: boolean
          block_new_signups?: boolean
          block_whatsapp_interactive?: boolean
          block_whatsapp_media?: boolean
          block_whatsapp_send?: boolean
          created_at?: string
          is_paused?: boolean
          paused_at?: string | null
          paused_by_security?: boolean
          paused_reason?: string | null
          subscription_status?: string
          updated_at?: string
          white_label_override?: boolean | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_controls_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          is_primary: boolean
          is_verified: boolean
          updated_at: string
          verification_token: string
          verified_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          updated_at?: string
          verification_token?: string
          verified_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          updated_at?: string
          verification_token?: string
          verified_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_domains_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invites: {
        Row: {
          access_group_id: string | null
          created_at: string
          email: string | null
          expires_at: string
          id: string
          invited_by_user_id: string | null
          max_uses: number
          phone: string | null
          revoked_at: string | null
          revoked_by: string | null
          sector_ids: string[]
          status: Database["public"]["Enums"]["invite_status"]
          token_hash: string
          token_prefix: string
          updated_at: string
          used_count: number
          workspace_id: string
        }
        Insert: {
          access_group_id?: string | null
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          invited_by_user_id?: string | null
          max_uses?: number
          phone?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          sector_ids?: string[]
          status?: Database["public"]["Enums"]["invite_status"]
          token_hash: string
          token_prefix: string
          updated_at?: string
          used_count?: number
          workspace_id: string
        }
        Update: {
          access_group_id?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invited_by_user_id?: string | null
          max_uses?: number
          phone?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          sector_ids?: string[]
          status?: Database["public"]["Enums"]["invite_status"]
          token_hash?: string
          token_prefix?: string
          updated_at?: string
          used_count?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invites_access_group_id_fkey"
            columns: ["access_group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          access_group_id: string | null
          business_hours_enabled: boolean
          channel_ids: string[]
          created_at: string
          id: string
          is_active: boolean
          origin: Database["public"]["Enums"]["member_origin"]
          role: Database["public"]["Enums"]["app_role"]
          sector_ids: string[]
          user_id: string
          workspace_id: string
        }
        Insert: {
          access_group_id?: string | null
          business_hours_enabled?: boolean
          channel_ids?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          origin?: Database["public"]["Enums"]["member_origin"]
          role?: Database["public"]["Enums"]["app_role"]
          sector_ids?: string[]
          user_id: string
          workspace_id: string
        }
        Update: {
          access_group_id?: string | null
          business_hours_enabled?: boolean
          channel_ids?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          origin?: Database["public"]["Enums"]["member_origin"]
          role?: Database["public"]["Enums"]["app_role"]
          sector_ids?: string[]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_access_group_id_fkey"
            columns: ["access_group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_payment_gateways: {
        Row: {
          created_at: string
          credentials: Json
          display_name: string
          environment: string
          id: string
          is_default: boolean
          is_enabled: boolean
          last_error: string | null
          last_health_check_at: string | null
          provider_key: string
          public_config: Json
          status: string
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          credentials?: Json
          display_name?: string
          environment?: string
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          last_error?: string | null
          last_health_check_at?: string | null
          provider_key: string
          public_config?: Json
          status?: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          credentials?: Json
          display_name?: string
          environment?: string
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          last_error?: string | null
          last_health_check_at?: string | null
          provider_key?: string
          public_config?: Json
          status?: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_payment_gateways_provider_key_fkey"
            columns: ["provider_key"]
            isOneToOne: false
            referencedRelation: "payment_gateway_catalog"
            referencedColumns: ["provider_key"]
          },
          {
            foreignKeyName: "workspace_payment_gateways_provider_key_fkey"
            columns: ["provider_key"]
            isOneToOne: false
            referencedRelation: "payment_gateway_catalog_public"
            referencedColumns: ["provider_key"]
          },
          {
            foreignKeyName: "workspace_payment_gateways_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_payment_settings: {
        Row: {
          auto_collection_enabled: boolean
          auto_regenerate_expired_pix: boolean
          business_hours_end: string
          business_hours_only: boolean
          business_hours_start: string
          created_at: string
          customer_can_generate_pix: boolean
          default_gateway_provider_key: string | null
          max_amount: number
          max_reminders_per_day: number
          max_reminders_per_payment: number
          min_amount: number
          msg_expired_template: string | null
          msg_not_found_template: string | null
          msg_paid_template: string | null
          msg_paused_template: string | null
          msg_pix_template: string | null
          msg_reminder_template: string | null
          pix_commands_enabled: boolean
          pix_expiration_minutes: number
          reminder_intervals_minutes: Json
          require_admin_approval_after_expired: boolean
          stop_on_agent_takeover: boolean
          stop_on_customer_reply: boolean
          updated_at: string
          workspace_id: string
        }
        Insert: {
          auto_collection_enabled?: boolean
          auto_regenerate_expired_pix?: boolean
          business_hours_end?: string
          business_hours_only?: boolean
          business_hours_start?: string
          created_at?: string
          customer_can_generate_pix?: boolean
          default_gateway_provider_key?: string | null
          max_amount?: number
          max_reminders_per_day?: number
          max_reminders_per_payment?: number
          min_amount?: number
          msg_expired_template?: string | null
          msg_not_found_template?: string | null
          msg_paid_template?: string | null
          msg_paused_template?: string | null
          msg_pix_template?: string | null
          msg_reminder_template?: string | null
          pix_commands_enabled?: boolean
          pix_expiration_minutes?: number
          reminder_intervals_minutes?: Json
          require_admin_approval_after_expired?: boolean
          stop_on_agent_takeover?: boolean
          stop_on_customer_reply?: boolean
          updated_at?: string
          workspace_id: string
        }
        Update: {
          auto_collection_enabled?: boolean
          auto_regenerate_expired_pix?: boolean
          business_hours_end?: string
          business_hours_only?: boolean
          business_hours_start?: string
          created_at?: string
          customer_can_generate_pix?: boolean
          default_gateway_provider_key?: string | null
          max_amount?: number
          max_reminders_per_day?: number
          max_reminders_per_payment?: number
          min_amount?: number
          msg_expired_template?: string | null
          msg_not_found_template?: string | null
          msg_paid_template?: string | null
          msg_paused_template?: string | null
          msg_pix_template?: string | null
          msg_reminder_template?: string | null
          pix_commands_enabled?: boolean
          pix_expiration_minutes?: number
          reminder_intervals_minutes?: Json
          require_admin_approval_after_expired?: boolean
          stop_on_agent_takeover?: boolean
          stop_on_customer_reply?: boolean
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_payment_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_security_incidents: {
        Row: {
          actor_user_id: string | null
          connection_id: string | null
          created_at: string
          id: string
          ip_hash: string | null
          payload: Json
          provider: string | null
          released_at: string | null
          released_by: string | null
          released_reason: string | null
          severity: string
          status: string
          tamper_count: number
          ticket_id: string | null
          workspace_id: string
        }
        Insert: {
          actor_user_id?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          payload?: Json
          provider?: string | null
          released_at?: string | null
          released_by?: string | null
          released_reason?: string | null
          severity?: string
          status?: string
          tamper_count?: number
          ticket_id?: string | null
          workspace_id: string
        }
        Update: {
          actor_user_id?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          payload?: Json
          provider?: string | null
          released_at?: string | null
          released_by?: string | null
          released_reason?: string | null
          severity?: string
          status?: string
          tamper_count?: number
          ticket_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_security_incidents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_usage: {
        Row: {
          ai_responses_count: number
          campaigns_sent: number
          created_at: string
          id: string
          messages_sent: number
          month: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          ai_responses_count?: number
          campaigns_sent?: number
          created_at?: string
          id?: string
          messages_sent?: number
          month: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          ai_responses_count?: number
          campaigns_sent?: number
          created_at?: string
          id?: string
          messages_sent?: number
          month?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_voice_ai_settings: {
        Row: {
          active: boolean
          api_key_encrypted: string | null
          language: string
          max_seconds: number
          opening_message: string | null
          provider: string
          reply_with_voice: boolean
          status_note: string | null
          transcribe_incoming: boolean
          updated_at: string
          updated_by: string | null
          voice: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          api_key_encrypted?: string | null
          language?: string
          max_seconds?: number
          opening_message?: string | null
          provider?: string
          reply_with_voice?: boolean
          status_note?: string | null
          transcribe_incoming?: boolean
          updated_at?: string
          updated_by?: string | null
          voice?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          api_key_encrypted?: string | null
          language?: string
          max_seconds?: number
          opening_message?: string | null
          provider?: string
          reply_with_voice?: boolean
          status_note?: string | null
          transcribe_incoming?: boolean
          updated_at?: string
          updated_by?: string | null
          voice?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_webhook_deliveries: {
        Row: {
          attempt: number
          created_at: string
          error: string | null
          event: string
          http_status: number | null
          id: string
          latency_ms: number | null
          payload: Json
          status: string
          webhook_id: string
          workspace_id: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          error?: string | null
          event: string
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          payload?: Json
          status?: string
          webhook_id: string
          workspace_id: string
        }
        Update: {
          attempt?: number
          created_at?: string
          error?: string | null
          event?: string
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          payload?: Json
          status?: string
          webhook_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "workspace_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_webhooks: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          error_count: number
          events: string[]
          forward_count: number
          id: string
          last_error: string | null
          last_error_at: string | null
          last_forward_at: string | null
          last_status: number | null
          name: string
          secret: string | null
          target_url: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          error_count?: number
          events?: string[]
          forward_count?: number
          id?: string
          last_error?: string | null
          last_error_at?: string | null
          last_forward_at?: string | null
          last_status?: number | null
          name: string
          secret?: string | null
          target_url: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          error_count?: number
          events?: string[]
          forward_count?: number
          id?: string
          last_error?: string | null
          last_error_at?: string | null
          last_forward_at?: string | null
          last_status?: number | null
          name?: string
          secret?: string | null
          target_url?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      wuzapi_canary_runs: {
        Row: {
          abort_reason: string | null
          aborted_at: string | null
          aborted_by: string | null
          created_at: string
          finished_at: string | null
          gateway_endpoint: string | null
          health_checks: Json
          id: string
          last_error: string | null
          mode: string
          notes: string | null
          promoted_at: string | null
          promoted_by: string | null
          started_at: string
          started_by: string | null
          status: string
          target_ref: string | null
          target_sha: string | null
          updated_at: string
          whatsmeow_ref: string | null
        }
        Insert: {
          abort_reason?: string | null
          aborted_at?: string | null
          aborted_by?: string | null
          created_at?: string
          finished_at?: string | null
          gateway_endpoint?: string | null
          health_checks?: Json
          id?: string
          last_error?: string | null
          mode?: string
          notes?: string | null
          promoted_at?: string | null
          promoted_by?: string | null
          started_at?: string
          started_by?: string | null
          status?: string
          target_ref?: string | null
          target_sha?: string | null
          updated_at?: string
          whatsmeow_ref?: string | null
        }
        Update: {
          abort_reason?: string | null
          aborted_at?: string | null
          aborted_by?: string | null
          created_at?: string
          finished_at?: string | null
          gateway_endpoint?: string | null
          health_checks?: Json
          id?: string
          last_error?: string | null
          mode?: string
          notes?: string | null
          promoted_at?: string | null
          promoted_by?: string | null
          started_at?: string
          started_by?: string | null
          status?: string
          target_ref?: string | null
          target_sha?: string | null
          updated_at?: string
          whatsmeow_ref?: string | null
        }
        Relationships: []
      }
      wuzapi_production_deploys: {
        Row: {
          check_count: number
          consecutive_failures: number
          created_at: string
          finished_at: string | null
          health_metrics: Json
          id: string
          last_check_at: string | null
          monitoring_started_at: string | null
          previous_compose_hash: string | null
          previous_sha: string | null
          previous_whatsmeow_ref: string | null
          rollback_reason: string | null
          rollback_triggered_manually: boolean
          rolled_back_at: string | null
          status: string
          target_sha: string | null
          target_whatsmeow_ref: string | null
          triggered_at: string
          triggered_by: string | null
          updated_at: string
        }
        Insert: {
          check_count?: number
          consecutive_failures?: number
          created_at?: string
          finished_at?: string | null
          health_metrics?: Json
          id?: string
          last_check_at?: string | null
          monitoring_started_at?: string | null
          previous_compose_hash?: string | null
          previous_sha?: string | null
          previous_whatsmeow_ref?: string | null
          rollback_reason?: string | null
          rollback_triggered_manually?: boolean
          rolled_back_at?: string | null
          status?: string
          target_sha?: string | null
          target_whatsmeow_ref?: string | null
          triggered_at?: string
          triggered_by?: string | null
          updated_at?: string
        }
        Update: {
          check_count?: number
          consecutive_failures?: number
          created_at?: string
          finished_at?: string | null
          health_metrics?: Json
          id?: string
          last_check_at?: string | null
          monitoring_started_at?: string | null
          previous_compose_hash?: string | null
          previous_sha?: string | null
          previous_whatsmeow_ref?: string | null
          rollback_reason?: string | null
          rollback_triggered_manually?: boolean
          rolled_back_at?: string | null
          status?: string
          target_sha?: string | null
          target_whatsmeow_ref?: string | null
          triggered_at?: string
          triggered_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wuzapi_update_checks: {
        Row: {
          checked_by: string | null
          created_at: string
          id: string
          latest_remote_sha: string | null
          new_commits: Json
          new_commits_count: number
          repo: string
          risk: string
          risk_reasons: Json
          source: string
          whatsmeow_recently_bumped: boolean
          whatsmeow_ref: string | null
        }
        Insert: {
          checked_by?: string | null
          created_at?: string
          id?: string
          latest_remote_sha?: string | null
          new_commits?: Json
          new_commits_count?: number
          repo: string
          risk: string
          risk_reasons?: Json
          source?: string
          whatsmeow_recently_bumped?: boolean
          whatsmeow_ref?: string | null
        }
        Update: {
          checked_by?: string | null
          created_at?: string
          id?: string
          latest_remote_sha?: string | null
          new_commits?: Json
          new_commits_count?: number
          repo?: string
          risk?: string
          risk_reasons?: Json
          source?: string
          whatsmeow_recently_bumped?: boolean
          whatsmeow_ref?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      payment_gateway_catalog_public: {
        Row: {
          description: string | null
          docs_url: string | null
          enabled_globally: boolean | null
          global_status:
            | Database["public"]["Enums"]["gateway_global_status"]
            | null
          id: string | null
          is_implemented: boolean | null
          logo: string | null
          logo_url: string | null
          name: string | null
          provider_key: string | null
          sort_order: number | null
          supports_dynamic_qr: boolean | null
          supports_pix: boolean | null
          supports_refund: boolean | null
          supports_static_qr: boolean | null
          supports_webhook: boolean | null
        }
        Insert: {
          description?: string | null
          docs_url?: string | null
          enabled_globally?: boolean | null
          global_status?:
            | Database["public"]["Enums"]["gateway_global_status"]
            | null
          id?: string | null
          is_implemented?: boolean | null
          logo?: string | null
          logo_url?: string | null
          name?: string | null
          provider_key?: string | null
          sort_order?: number | null
          supports_dynamic_qr?: boolean | null
          supports_pix?: boolean | null
          supports_refund?: boolean | null
          supports_static_qr?: boolean | null
          supports_webhook?: boolean | null
        }
        Update: {
          description?: string | null
          docs_url?: string | null
          enabled_globally?: boolean | null
          global_status?:
            | Database["public"]["Enums"]["gateway_global_status"]
            | null
          id?: string | null
          is_implemented?: boolean | null
          logo?: string | null
          logo_url?: string | null
          name?: string | null
          provider_key?: string | null
          sort_order?: number | null
          supports_dynamic_qr?: boolean | null
          supports_pix?: boolean | null
          supports_refund?: boolean | null
          supports_static_qr?: boolean | null
          supports_webhook?: boolean | null
        }
        Relationships: []
      }
      ticket_timeline_v: {
        Row: {
          actor_user_id: string | null
          area: string | null
          created_at: string | null
          id: string | null
          kind: string | null
          payload: Json | null
          severity: string | null
          ticket_id: string | null
          title: string | null
          workspace_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _backup_secret_allowed_keys: { Args: never; Returns: string[] }
      _cron_secret_value: { Args: never; Returns: string }
      _mask_secret: { Args: { _v: string }; Returns: string }
      can_access_realtime_topic: {
        Args: { _extension: string; _topic: string }
        Returns: boolean
      }
      can_access_ticket: {
        Args: {
          _assignee_id: string
          _sector_id: string
          _workspace_id: string
        }
        Returns: boolean
      }
      cleanup_old_group_messages: {
        Args: { _dry_run?: boolean }
        Returns: Json
      }
      cleanup_old_logs: { Args: never; Returns: Json }
      cleanup_webhook_trace: { Args: never; Returns: undefined }
      clear_backup_secret: { Args: { _key: string }; Returns: Json }
      consume_rate_limit: {
        Args: {
          _action: string
          _actor_user_id?: string
          _ip_hash?: string
          _limit: number
          _window_seconds: number
          _workspace_id?: string
        }
        Returns: {
          allowed: boolean
          current_count: number
          retry_after_seconds: number
        }[]
      }
      get_active_maintenance: { Args: never; Returns: Json }
      get_android_apk_info: {
        Args: never
        Returns: {
          download_url: string
          updated_at: string
          version: string
        }[]
      }
      get_backup_secrets_for_cron: {
        Args: { _cron_secret: string }
        Returns: Json
      }
      get_backup_secrets_status: { Args: never; Returns: Json }
      get_github_access_token: { Args: never; Returns: string }
      get_github_vps_webhook_secret: { Args: never; Returns: string }
      get_landing_config: { Args: never; Returns: Json }
      get_master_public_settings: {
        Args: never
        Returns: {
          baileys_configured: boolean
          baileys_enabled: boolean
          embedded_signup_enabled: boolean
          manual_mode_enabled: boolean
          meta_app_id: string
          meta_config_id: string
          public_signup_enabled: boolean
        }[]
      }
      get_whatsapp_credentials: {
        Args: { _connection_id: string }
        Returns: {
          access_token: string
          app_secret: string
          phone_number_id: string
          waba_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_workspace_admin: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      record_backup_run: {
        Args: {
          _cloud_location: string
          _cloud_uploaded: boolean
          _code_size_bytes: number
          _cron_secret: string
          _db_size_bytes: number
          _error_message: string
          _file_path: string
          _finished_at: string
          _media_size_bytes: number
          _sessions_size_bytes: number
          _size_bytes: number
          _started_at: string
          _status: string
          _trigger_source?: string
        }
        Returns: string
      }
      register_notification_event: {
        Args: {
          _category: string
          _channels?: string[]
          _description: string
          _event_key: string
          _severity_default?: string
          _title: string
        }
        Returns: undefined
      }
      release_security_pause: {
        Args: {
          _confirm_text: string
          _incident_id: string
          _reason: string
          _workspace_id: string
        }
        Returns: Json
      }
      resolve_branding_by_host: { Args: { _host: string }; Returns: Json }
      seed_workspace_data: { Args: { _workspace_id: string }; Returns: Json }
      seed_workspace_extras: { Args: { _workspace_id: string }; Returns: Json }
      set_backup_secret: {
        Args: { _key: string; _value: string }
        Returns: Json
      }
      system_job_record_run: {
        Args: {
          _duration_ms: number
          _error: string
          _name: string
          _status: string
        }
        Returns: undefined
      }
      workspace_plan_limits: {
        Args: { _workspace_id: string }
        Returns: {
          allow_byok: boolean
          allow_embedded_signup: boolean
          max_campaigns_per_month: number
          max_connections: number
          max_messages_per_month: number
          max_sectors: number
          max_users: number
          plan_slug: string
        }[]
      }
    }
    Enums: {
      announcement_type:
        | "novidade"
        | "informativo"
        | "manutencao"
        | "atualizacao"
        | "correcao"
        | "aviso"
        | "lembrete"
      app_role: "admin" | "agent" | "super_admin"
      campaign_recipient_status: "pending" | "sent" | "failed" | "skipped"
      campaign_status:
        | "draft"
        | "scheduled"
        | "running"
        | "paused"
        | "completed"
        | "canceled"
        | "failed"
      gateway_global_status:
        | "ativo"
        | "desativado"
        | "em_breve"
        | "manutencao"
        | "bloqueado"
        | "pendente_adapter"
      github_auth_type: "pat" | "app"
      github_integration_status:
        | "not_connected"
        | "connected"
        | "permission_error"
        | "syncing"
        | "ready"
        | "failed"
      invite_status: "active" | "revoked" | "expired" | "used"
      member_origin: "owner_initial" | "invite" | "manual" | "master_added"
      message_author: "contact" | "agent" | "ai" | "bot" | "system"
      message_delivery:
        | "pending"
        | "sent"
        | "delivered"
        | "read"
        | "failed"
        | "media_pending"
      message_kind: "text" | "image" | "audio" | "document" | "video" | "note"
      ticket_channel: "whatsapp" | "webchat" | "manual"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status:
        | "open"
        | "in_progress"
        | "waiting_client"
        | "resolved"
        | "closed"
        | "critical"
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
      announcement_type: [
        "novidade",
        "informativo",
        "manutencao",
        "atualizacao",
        "correcao",
        "aviso",
        "lembrete",
      ],
      app_role: ["admin", "agent", "super_admin"],
      campaign_recipient_status: ["pending", "sent", "failed", "skipped"],
      campaign_status: [
        "draft",
        "scheduled",
        "running",
        "paused",
        "completed",
        "canceled",
        "failed",
      ],
      gateway_global_status: [
        "ativo",
        "desativado",
        "em_breve",
        "manutencao",
        "bloqueado",
        "pendente_adapter",
      ],
      github_auth_type: ["pat", "app"],
      github_integration_status: [
        "not_connected",
        "connected",
        "permission_error",
        "syncing",
        "ready",
        "failed",
      ],
      invite_status: ["active", "revoked", "expired", "used"],
      member_origin: ["owner_initial", "invite", "manual", "master_added"],
      message_author: ["contact", "agent", "ai", "bot", "system"],
      message_delivery: [
        "pending",
        "sent",
        "delivered",
        "read",
        "failed",
        "media_pending",
      ],
      message_kind: ["text", "image", "audio", "document", "video", "note"],
      ticket_channel: ["whatsapp", "webchat", "manual"],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: [
        "open",
        "in_progress",
        "waiting_client",
        "resolved",
        "closed",
        "critical",
      ],
    },
  },
} as const
