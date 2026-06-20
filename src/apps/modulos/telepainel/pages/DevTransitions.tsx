import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playSplash, SplashStyle } from "@/components/transitions/PageSplash";
import {
  SplashConfigMap,
  getSplashConfig,
  saveSplashConfig,
  subscribeSplashConfig,
} from "@/components/transitions/SplashController";

const STYLES: SplashStyle[] = ["flash", "fade", "pulse", "wipe"];
const PRESET_DURATIONS = [400, 600, 750, 1000, 1600];

/**
 * Tela oculta de QA das transições.
 * Acesse em /dev/transitions
 */
export default function DevTransitions() {
  const [config, setConfig] = useState<SplashConfigMap>(getSplashConfig());
  const [newKey, setNewKey] = useState("");
  const [newStyle, setNewStyle] = useState<SplashStyle>("flash");
  const [newDuration, setNewDuration] = useState(750);
  const [burstCount, setBurstCount] = useState(0);

  useEffect(() => subscribeSplashConfig(setConfig), []);

  const fire = (style: SplashStyle, duration: number) => {
    playSplash({ style, duration, key: `dev:${style}` });
  };

  const burst = () => {
    // Testa coalesce — dispara 6 splashes seguidos.
    setBurstCount((n) => n + 1);
    STYLES.forEach((s, i) => {
      setTimeout(() => playSplash({ style: s, duration: 600, key: `burst-${i}` }), i * 50);
    });
  };

  const upsert = async () => {
    if (!newKey.trim()) {
      toast.error("Informe a chave (ex.: /telepainel/bots ou menu:logout)");
      return;
    }
    const next = { ...config, [newKey.trim()]: { style: newStyle, duration: newDuration } };
    delete (next as any).default; // default fica implícito no controller
    await saveSplashConfig(next);
    toast.success("Configuração salva");
    setNewKey("");
  };

  const remove = async (k: string) => {
    const next = { ...config };
    delete next[k];
    delete (next as any).default;
    await saveSplashConfig(next);
    toast.success(`Removido: ${k}`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <Helmet>
        <title>Dev — Teste de Transições</title>
      </Helmet>
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Teste de Transições</h1>
          <p className="text-sm text-muted-foreground">
            Página oculta de QA do splash. Dispare cada estilo, teste a fila com burst de cliques e
            configure por menu/rota.
          </p>
        </header>

        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Disparar manualmente</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STYLES.map((s) => (
              <div key={s} className="space-y-1">
                <Label className="text-xs uppercase">{s}</Label>
                <div className="flex flex-col gap-1">
                  {PRESET_DURATIONS.map((d) => (
                    <Button
                      key={d}
                      size="sm"
                      variant="outline"
                      data-splash="false"
                      onClick={() => fire(s, d)}
                    >
                      {d}ms
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Teste de fila (coalesce)</h2>
          <p className="text-xs text-muted-foreground">
            Clica 6 splashes em sequência rápida. O sistema agrupa e só mostra o último — sem cortar
            anim pela metade.
          </p>
          <Button data-splash="false" onClick={burst}>
            Disparar burst ({burstCount})
          </Button>
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Configurar por menu / rota</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
            <div className="sm:col-span-2">
              <Label className="text-xs">Chave (path ou menu:id)</Label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="/telepainel/bots"
              />
            </div>
            <div>
              <Label className="text-xs">Estilo</Label>
              <select
                className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value as SplashStyle)}
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Duração (ms)</Label>
              <Input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value) || 600)}
              />
            </div>
          </div>
          <Button data-splash="false" onClick={upsert}>
            Salvar
          </Button>

          <div className="pt-3">
            <h3 className="text-sm font-medium mb-2">Configurações ativas</h3>
            {Object.keys(config).length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhuma — usando default.</p>
            )}
            <ul className="space-y-1">
              {Object.entries(config).map(([k, v]) => (
                <li
                  key={k}
                  className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                >
                  <span>
                    <code className="font-mono text-xs">{k}</code> → {v.style} / {v.duration}ms
                  </span>
                  {k !== "default" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      data-splash="false"
                      onClick={() => remove(k)}
                    >
                      Remover
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
