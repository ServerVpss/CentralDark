import React, { useState, useEffect } from 'react';
import { X, Activity, Bot, ScrollText, TerminalSquare } from 'lucide-react';
import { StatusPanel } from './panels/StatusPanel';
import { ModelsPanel } from './panels/ModelsPanel';
import { LogsPanel } from './panels/LogsPanel';
import { ConsolePanel } from './panels/ConsolePanel';
import { logButton } from '@/lib/buttonLog';

type SubTab = 'status' | 'models' | 'logs' | 'console';

interface Props {
  open: boolean;
  onClose: () => void;
}

const TABS: { id: SubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'status',  label: 'Status',  icon: Activity },
  { id: 'models',  label: 'Modelos', icon: Bot },
  { id: 'logs',    label: 'Logs',    icon: ScrollText },
  { id: 'console', label: 'Console', icon: TerminalSquare },
];

export function AbacusModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<SubTab>('status');
  const [selectedModel, setSelectedModel] = useState<string>('route-llm');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl border border-primary/30 bg-card shadow-3d-primary overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/60 gradient-emerald">
          <div className="flex items-center gap-3 text-primary-foreground">
            <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold leading-tight">Investigação Abacus</h2>
              <p className="text-xs opacity-80">routellm.abacus.ai · proxy pelo HUB</p>
            </div>
          </div>
          <button
            onClick={() => { logButton('abacus-modal.close'); onClose(); }}
            aria-label="Fechar"
            className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-primary-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 px-2 sm:px-4 pt-3 border-b border-border/40 bg-background/40 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { logButton('abacus-modal.tab', { tab: t.id }); setTab(t.id); }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-t-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? 'gradient-emerald text-primary-foreground shadow-3d-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === 'status'  && <StatusPanel />}
          {tab === 'models'  && <ModelsPanel selected={selectedModel} onSelect={setSelectedModel} />}
          {tab === 'logs'    && <LogsPanel />}
          {tab === 'console' && <ConsolePanel model={selectedModel} />}
        </div>
      </div>
    </div>
  );
}
