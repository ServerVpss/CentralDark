import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Sparkles, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ButtonEmojiConfigProps {
  botId: string;
  settingsId: string | null;
}

const BUTTON_EMOJI_MAP = [
  { key: "SEARCH", label: "🔍 Consulta", description: "Botão Fazer Consulta / Nova Consulta" },
  { key: "DIAMOND", label: "💎 Planos", description: "Botões de Planos e Assinatura" },
  { key: "CHART", label: "📊 Estatísticas", description: "Minha Assinatura / Estatísticas" },
  { key: "LIGHTNING", label: "⚡ Admin", description: "Painel Admin" },
  { key: "CHECK", label: "✅ Aceitar", description: "Aceitar Termos / Ativos" },
  { key: "HOME", label: "🏠 Menu", description: "Menu Principal / Voltar" },
  { key: "MEGAPHONE", label: "📢 Broadcast", description: "Broadcast" },
  { key: "LIST", label: "📋 Comandos", description: "Lista de Comandos" },
  { key: "MONEY", label: "💰 Pagamentos", description: "Pagamentos Pendentes" },
  { key: "DOOR", label: "🚪 Grupo", description: "Entrar no Grupo" },
  { key: "TRASH", label: "🗑️ Apagar", description: "Botão Apagar Mensagem" },
  { key: "BACK", label: "🔙 Voltar", description: "Botões de Voltar" },
  { key: "USERS", label: "👥 Usuários", description: "Gerenciamento de Usuários" },
  { key: "PLUS", label: "➕ Novo", description: "Criar Novo Plano" },
  { key: "REFRESH", label: "🔄 Atualizar", description: "Atualizar / Renovar" },
  { key: "CART", label: "🛒 Assinar", description: "Botão Assinar" },
  { key: "PDF", label: "📄 PDF", description: "Baixar PDF" },
  { key: "PHOTO", label: "📸 Foto", description: "Consultar Foto" },
  { key: "STAR", label: "⭐ Estrela", description: "Destaque geral" },
];

const DEFAULT_EMOJIS: Record<string, string> = {
  SEARCH: "5368324170671202286",
  DIAMOND: "5471952986970267163",
  CHART: "5357506110857498821",
  LIGHTNING: "5253959696498104346",
  CHECK: "5370547013043468854",
  HOME: "5237699328843200968",
  MEGAPHONE: "5424972541023694017",
  LIST: "5384162698092301384",
  MONEY: "5271604874513397103",
  DOOR: "5386654873785498449",
  CART: "5368324170671202286",
  STAR: "5368324170671202286",
  TRASH: "5386399931108030284",
  PDF: "5386399931108030284",
  PHOTO: "5386654873785498449",
  BACK: "5237699328843200968",
  USERS: "5384162698092301384",
  PENCIL: "5368324170671202286",
  PLUS: "5370547013043468854",
  REFRESH: "5253959696498104346",
};

export function ButtonEmojiConfig({ botId, settingsId }: ButtonEmojiConfigProps) {
  const [emojiIds, setEmojiIds] = useState<Record<string, string>>({ ...DEFAULT_EMOJIS });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!settingsId) return;
    
    const fetchEmojis = async () => {
      const { data } = await supabase
        .from("bot_settings")
        .select("button_emoji_ids")
        .eq("id", settingsId)
        .single();
      
      if (data?.button_emoji_ids && typeof data.button_emoji_ids === 'object') {
        const stored = data.button_emoji_ids as Record<string, string>;
        setEmojiIds(prev => ({ ...prev, ...stored }));
      }
      setLoaded(true);
    };
    
    fetchEmojis();
  }, [settingsId]);

  const handleChange = (key: string, value: string) => {
    setEmojiIds(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!settingsId) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("bot_settings")
      .update({ button_emoji_ids: emojiIds as any })
      .eq("id", settingsId);
    
    if (error) {
      toast.error("Erro ao salvar emojis");
    } else {
      toast.success("Emojis dos botões salvos com sucesso!");
    }
    setSaving(false);
  };

  const handleReset = () => {
    setEmojiIds({ ...DEFAULT_EMOJIS });
    toast.info("IDs resetados para o padrão. Clique em Salvar para aplicar.");
  };

  if (!loaded && settingsId) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Custom Emojis dos Botões
            </CardTitle>
            <CardDescription className="mt-1">
              Configure os IDs dos emojis premium que aparecem nos botões do menu do bot (API 9.4). 
              Use o @RawDataBot no Telegram para descobrir IDs.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">Premium</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUTTON_EMOJI_MAP.map(({ key, label, description }) => (
            <div key={key} className="space-y-1">
              <Label className="text-sm font-medium">{label}</Label>
              <Input
                value={emojiIds[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="ID do custom emoji"
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Emojis"}
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Resetar Padrão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
