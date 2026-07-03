import React, { useState } from 'react';
import { usePolicies } from '@/hooks/usePolicies';
import { PolicyEditor } from './PolicyEditor';
import { RuleBadge } from './RuleBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Shield, Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface Policy {
  id: string;
  name: string;
  description?: string;
  rule_type: 'allow' | 'block' | 'require_veto';
  target_tool_id?: string;
  target_server_id?: string;
  enabled: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function PoliciesTab() {
  const { policies, loading, error, refresh } = usePolicies();
  const { user, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || p.rule_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingPolicy(null);
    setShowEditor(true);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingPolicy(null);
    refresh();
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Carregando políticas...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive mb-2">Erro ao carregar políticas</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Políticas de Segurança</h2>
          <Badge variant="outline">{policies.length} regras</Badge>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1" /> Nova Política
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar políticas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="all">Todos os tipos</option>
          <option value="allow">Allow</option>
          <option value="block">Block</option>
          <option value="require_veto">Require Veto</option>
        </select>
      </div>

      {showEditor && (
        <PolicyEditor
          policy={editingPolicy}
          onClose={handleEditorClose}
        />
      )}

      <div className="grid gap-3">
        {filteredPolicies.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma política encontrada
            </CardContent>
          </Card>
        ) : (
          filteredPolicies.map(policy => (
            <Card key={policy.id} className={!policy.enabled ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {policy.name}
                      <RuleBadge type={policy.rule_type} />
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {policy.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                      {policy.enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(policy)}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {policy.target_tool_id && (
                    <Badge variant="outline">Tool: {policy.target_tool_id}</Badge>
                  )}
                  {policy.target_server_id && (
                    <Badge variant="outline">Server: {policy.target_server_id}</Badge>
                  )}
                  <span>Criado por: {policy.created_by}</span>
                  <span>Atualizado: {new Date(policy.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}