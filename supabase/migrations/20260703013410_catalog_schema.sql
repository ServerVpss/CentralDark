-- supabase/migrations/20251001_catalog_schema.sql
CREATE SCHEMA IF NOT EXISTS catalog;

CREATE TABLE catalog.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  base_url TEXT,
  status TEXT DEFAULT 'active',
  version TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalog.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES catalog.servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  input_schema JSONB DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  version TEXT,
  is_deprecated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(server_id, name)
);

CREATE TABLE catalog.tool_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES catalog.tools(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  input_schema JSONB,
  output_schema JSONB,
  changelog TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalog.sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  tools_found INTEGER DEFAULT 0,
  tools_added INTEGER DEFAULT 0,
  tools_updated INTEGER DEFAULT 0,
  tools_removed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE catalog.health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES catalog.servers(id) ON DELETE CASCADE,
  status TEXT,
  response_time_ms INTEGER,
  checked_at TIMESTAMPTZ DEFAULT now(),
  error_message TEXT
);

-- RLS
ALTER TABLE catalog.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.tool_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.health_checks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "authenticated_read_servers" ON catalog.servers FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_role_all_servers" ON catalog.servers FOR ALL TO service_role USING (true);
CREATE POLICY "authenticated_read_tools" ON catalog.tools FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_role_all_tools" ON catalog.tools FOR ALL TO service_role USING (true);
CREATE POLICY "authenticated_read_tool_versions" ON catalog.tool_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_role_all_tool_versions" ON catalog.tool_versions FOR ALL TO service_role USING (true);
CREATE POLICY "authenticated_read_sync_runs" ON catalog.sync_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_role_all_sync_runs" ON catalog.sync_runs FOR ALL TO service_role USING (true);
CREATE POLICY "authenticated_read_health_checks" ON catalog.health_checks FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_role_all_health_checks" ON catalog.health_checks FOR ALL TO service_role USING (true);

-- Indexes
CREATE INDEX idx_tools_server_id ON catalog.tools(server_id);
CREATE INDEX idx_tools_name ON catalog.tools(name);
CREATE INDEX idx_tool_versions_tool_id ON catalog.tool_versions(tool_id);
CREATE INDEX idx_sync_runs_status ON catalog.sync_runs(status);
CREATE INDEX idx_health_checks_server_id ON catalog.health_checks(server_id);
