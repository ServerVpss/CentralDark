# COMANDO - hub-types.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\src\integrations\supabase\hub-types.ts
**SHA:** fc732c0d630febec
**Timestamp:** 2026-08-28T02:57:44.139403
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- window_start: string

### Ouro Bruto (primeiros 5000 chars)
```
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
      agent_events: {
        Row: {
          acao: string
          agent: string
          alvo: string | null
          area: string
          id: number
          metadata: Json
          status: string
          ts: string
        }
        Insert: {
          acao: string
          agent: string
          alvo?: string | null
          area: string
          id?: number
          metadata?: Json
          status?: string
          ts?: string
        }
        Update: {
          acao?: string
          agent?: string
          alvo?: string | null
          area?: string
          id?: number
          metadata?: Json
          status?: string
          ts?: string
        }
        Relationships: []
      }
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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          id?:
```