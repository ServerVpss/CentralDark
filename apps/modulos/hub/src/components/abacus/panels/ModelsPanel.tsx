import React, { useEffect, useState } from 'react';
import { Bot, CheckCircle2 } from 'lucide-react';
import { abacusApi, AbacusModel } from '@/services/abacus-client';
import { logButton } from '@/lib/buttonLog';

// Fallback estático caso a edge ainda esteja sem chave (não bloqueia o painel)
const FALLBACK: AbacusModel[] = [
  { id: 'route-llm',            name: 'RouteLLM (auto)',           active: true  },
  { id: 'gpt-4o',               name: 'GPT-4o',                    active: false },
  { id: 'gpt-4o-mini',          name: 'GPT-4o mini',               active: false },
  { id: 'claude-3-5-sonnet',    name: 'Claude 3.5 Sonnet',         active: false },
  { id: 'claude-3-5-haiku',     name: 'Claude 3.5 Haiku',          active: false },
  { id: 'gemini-1.5-pro',       name: 'Gemini 1.5 Pro',            active: false },
  { id: 'gemini-2.0-flash',     name: 'Gemini 2.0 Flash',          active: false },
  { id: 'llama-3.3-70b',        name: 'Llama 3.3 70B',             active: false },
  { id: 'deepseek-r1',          name: 'DeepSeek R1',               active: false },
  { id: 'deepseek-v3',          name: 'DeepSeek V3',               active: false },
];

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function ModelsPanel({ selected, onSelect }: Props) {
  const [models, setModels] = useState<AbacusModel[]>(FALLBACK);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    abacusApi.models()
      .then((m) => { if (m.length) { setModels(m); setFromApi(true); } })
      .catch(() => { /* mantém fallback */ });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Modelos {fromApi ? '(ao vivo)' : '(lista base)'}
        </h3>
        <span className="text-xs text-muted-foreground">{models.length} disponíveis</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {models.map((m) => {
          const active = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => { logButton('abacus.select-model', { model: m.id }); onSelect(m.id); }}
              className={`text-left p-3 rounded-lg border flex items-center gap-3 transition ${
                active
                  ? 'border-primary bg-primary/10 shadow-3d-primary'
                  : 'border-border/60 bg-background/40 hover:border-primary/40'
              }`}
            >
              <Bot className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.id}</p>
              </div>
              {active && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        O modelo selecionado é o que a aba <span className="text-foreground">Console</span> usa nos testes.
      </p>
    </div>
  );
}
