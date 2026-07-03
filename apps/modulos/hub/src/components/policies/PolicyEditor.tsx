import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { usePolicies } from '@/hooks/usePolicies';
import type { Policy, RuleType } from '@/types/policies';

interface PolicyEditorProps {
  policy: Policy | null;
  onClose: () => void;
}

export function PolicyEditor({ policy, onClose }: PolicyEditorProps) {
  const { addPolicy, updatePolicy } = usePolicies();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Policy>>(policy || {
    name: '',
    description: '',
    rule_type: 'allow',
    enabled: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (policy?.id) {
        await updatePolicy(policy.id, formData);
      } else {
        await addPolicy(formData as Omit<Policy, 'id' | 'created_at' | 'updated_at'>);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar policy:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{policy ? 'Editar Política' : 'Nova Política'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rule_type">Tipo de Regra</Label>
            <select
              id="rule_type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.rule_type || 'allow'}
              onChange={e => setFormData(prev => ({ ...prev, rule_type: e.target.value as RuleType }))}
            >
              <option value="allow">Permitir (Allow)</option>
              <option value="block">Bloquear (Block)</option>
              <option value="require_veto">Exigir Veto</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={e => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="enabled">Ativa</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
