import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card } from "@/shared/ui/card";
import { Lock, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

// Login do painel admin — chama POST /admin/login (senha única, já existente
// no backend real via MCP_ADMIN_PASSWORD). O backend seta um cookie HttpOnly
// (cd_admin); esta tela não guarda nenhum token.
export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErro(null);
    try {
      const ok = await api.login(password);
      if (!ok) throw new Error("Senha incorreta.");
      onLogin();
    } catch (err: any) {
      setErro(err?.message ?? "Falha ao entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid place-items-center bg-background p-6">
      <Card className="w-full max-w-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none">MCP CentralDark</h1>
            <p className="text-xs text-muted-foreground mt-1">Painel Admin</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-wide text-muted-foreground">
              Senha admin
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 pl-9 font-mono"
              />
            </div>
          </div>

          {erro && <p className="text-xs text-destructive">{erro}</p>}

          <Button type="submit" disabled={busy} className="w-full h-11">
            {busy ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="text-[11px] text-center text-muted-foreground">
          Acesso restrito ao admin CentralDark · mcp.centralldark.com
        </p>
      </Card>
    </div>
  );
}
