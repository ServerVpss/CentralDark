import React from 'react';
import { Button } from '@/shared/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface AuditEntry {
  id: string;
  event_type: string;
  agent: string;
  action: string;
  target: string;
  result: string;
  veto_reason?: string;
  created_at: string;
}

interface AuditExportProps {
  data: AuditEntry[];
  filename?: string;
}

export function AuditExport({ data, filename = 'audit-log.csv' }: AuditExportProps) {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const headers = ['id', 'event_type', 'agent', 'action', 'target', 'result', 'veto_reason', 'created_at'];
      const csvRows = [headers.join(',')];

      for (const entry of data) {
        const row = headers.map(h => {
          const val = (entry as any)[h] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Exportado', description: `${data.length} linhas exportadas como CSV` });
    } catch (err) {
      toast({ title: 'Erro na exportação', description: String(err), variant: 'destructive' });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={data.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  );
}
