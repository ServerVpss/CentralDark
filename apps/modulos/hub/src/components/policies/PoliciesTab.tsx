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
import type { Policy } from '@/types/policies';

export function PoliciesTab() {
  const { policies, loading, error, refresh } = usePolicies();
  const { user, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.tool.toLowerCase().includes(search.toLowerCase()) ||
      p.environment.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' ||
      (filterType === 'needs_approval' ? p.needs_approval : String(p.tier) === filterType);
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

  const handleCreateClick = () => {
    setActionError(null);
    handleCreate();
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
          <Button size="sm" onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-1" /> Nova Política
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por tool ou environment..."
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
          <option value="all">Todos os tiers</option>
          <option value="0">Tier 0</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
          <option value="4">Tier 4 (desativado)</option>
          <option value="needs_approval">Requer aprovação</option>
        </select>
      </div>

      {actionError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </div>
      )}

      {showEditor && (
        <PolicyEditor
          policy={editingPolicy}
          onClose={handleEditorClose}
          onError={setActionError}
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
                      {policy.tool}
                      <RuleBadge tier={policy.tier} needsApproval={policy.needs_approval} />
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Environment: {policy.environment}
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
                  <Badge variant="outline">Tier: {policy.tier}</Badge>
                  {policy.needs_approval && (
                    <Badge variant="outline">Requer aprovação</Badge>
                  )}
                  <span>Criado: {new Date(policy.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}