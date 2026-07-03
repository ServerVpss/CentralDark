import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { usePolicies } from '@/hooks/usePolicies';
import { RuleBadge } from './RuleBadge';
import { Shield, Plus, Save, X } from 'lucide-react';

interface PolicyForm {
  name: string;
  description: string;
  rule_type: 'allow' | 'block' | 'require_veto';
  target_tool_id: string;
  target_server_id: string;
  enabled: boolean;
}

const emptyForm: PolicyForm = {
  name: '',
  description: '',
  rule_type: 'allow',
  target_tool_id: '',
  target_server_id: '',
  enabled: true,
};

export function PolicyEditor() {
  const { policies, addPolicy, updatePolicy, loading } = usePolicies();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<PolicyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updatePolicy(editingId, form);
    } else {
      await addPolicy(form);
    }
    setForm(emptyForm);
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (policy: any) => {
    setForm({
      name: policy.name,
      description: policy.description || '',
      rule_type: policy.rule_type,
      target_tool_id: policy.target_tool_id || '',
      target_server_id: policy.target_server_id || '',
      enabled: policy.enabled,
    });
    setEditingId(policy.id);
    setIsOpen(true);
  };

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Carregando editor de políticas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Políticas de Segurança
        </h3>
        <Button onClick={() => { setForm(emptyForm); setEditingId(null); setIsOpen(!isOpen); }} variant={isOpen ? 'outline' : 'default'} size="sm">
          {isOpen ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {isOpen ? 'Cancelar' : 'Nova Política'}
        </Button>
      </div>

      {isOpen && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="rule_type">Tipo de Regra</Label>
                <Select value={form.rule_type} onValueChange={v => setForm({ ...form, rule_type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">Allow</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="require_veto">Require Veto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target_tool_id">Tool ID (opcional)</Label>
                <Input id="target_tool_id" value={form.target_tool_id} onChange={e => setForm({ ...form, target_tool_id: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="target_server_id">Server ID (opcional)</Label>
                <Input id="target_server_id" value={form.target_server_id} onChange={e => setForm({ ...form, target_server_id: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="enabled" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
                <Label htmlFor="enabled">Ativa</Label>
              </div>
              <Button type="submit" className="w-full">
                <Save className="h-4 w-4 mr-1" />
                {editingId ? 'Atualizar' : 'Criar'} Política
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {policies.map(policy => (
          <Card key={policy.id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleEdit(policy)}>
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RuleBadge type={policy.rule_type} />
                <div>
                  <p className="font-medium">{policy.name}</p>
                  {policy.description && <p className="text-sm text-muted-foreground">{policy.description}</p>}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${policy.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                {policy.enabled ? 'Ativa' : 'Inativa'}
              </span>
            </CardContent>
          </Card>
        ))}
        {policies.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhuma política cadastrada.</p>
        )}
      </div>
    </div>
  );
}
