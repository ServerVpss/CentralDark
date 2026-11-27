import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { usePolicies } from '@/hooks/usePolicies';
import type { Policy } from '@/types/policies';

interface PolicyEditorProps {
  policy: Policy | null;
  onClose: () => void;
  onError?: (message: string) => void;
}

// NOTA: api.policies é uma VIEW somente leitura de hub.policies (sistema PDP oficial).
// addPolicy/updatePolicy hoje sempre lançam erro amigável (ver usePolicies.ts) — este
// formulário existe pra manter a UI, mas a escrita real ainda não está disponível.
export function PolicyEditor({ policy, onClose, onError }: PolicyEditorProps) {
  const { addPolicy, updatePolicy } = usePolicies();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Policy>>(policy || {
    tool: '',
    environment: '*',
    tier: 1,
    needs_approval: false,
    enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (policy?.id) {
        await updatePolicy(policy.id, formData);
      } else {
        await addPolicy(formData);
      }
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar policy:', err);
      onError?.(err?.message || 'Erro ao salvar política');
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
            <Label htmlFor="tool">Tool</Label>
            <Input
              id="tool"
              value={formData.tool || ''}
              onChange={e => setFormData(prev => ({ ...prev, tool: e.target.value }))}
              placeholder="ex: github_commit, deploy_status, *"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Input
              id="environment"
              value={formData.environment ?? '*'}
              onChange={e => setFormData(prev => ({ ...prev, environment: e.target.value }))}
              placeholder="ex: prod, dev, *"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">Tier (0-4)</Label>
            <select
              id="tier"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.tier ?? 1}
              onChange={e => setFormData(prev => ({ ...prev, tier: Number(e.target.value) }))}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4 (sempre deny)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="needs_approval"
              checked={!!formData.needs_approval}
              onChange={e => setFormData(prev => ({ ...prev, needs_approval: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="needs_approval">Requer aprovação humana</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={!!formData.enabled}
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
