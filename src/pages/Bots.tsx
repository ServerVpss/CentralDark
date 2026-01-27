import { useState } from "react";
import { Bot, Copy, Eye, EyeOff, MoreVertical, Plus, Power, Settings, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BotData {
  id: string;
  name: string;
  username: string;
  token: string;
  status: "online" | "offline" | "error";
  createdAt: string;
}

const initialBots: BotData[] = [
  {
    id: "1",
    name: "Bot Principal",
    username: "MeuBotPrincipal",
    token: "6123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw",
    status: "online",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Bot Vendas",
    username: "VendasAutomacao",
    token: "7234567890:BBIerUdwDI2wHXKygTfpgTBt1L6QBMEtbx",
    status: "online",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Bot Suporte",
    username: "SuporteCliente",
    token: "8345678901:CCJfsVexEJ3xIYLzhUgqhUCu2M7RCNFucy",
    status: "error",
    createdAt: "2024-03-10",
  },
];

export default function Bots() {
  const [bots, setBots] = useState<BotData[]>(initialBots);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBot, setNewBot] = useState({ name: "", token: "" });

  const toggleTokenVisibility = (id: string) => {
    setShowTokens((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copiado para a área de transferência");
  };

  const handleAddBot = () => {
    if (!newBot.name || !newBot.token) {
      toast.error("Preencha todos os campos");
      return;
    }

    const usernameMatch = newBot.token.split(":")[0];
    const newBotData: BotData = {
      id: Date.now().toString(),
      name: newBot.name,
      username: `Bot${usernameMatch?.slice(-4) || "New"}`,
      token: newBot.token,
      status: "offline",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setBots((prev) => [...prev, newBotData]);
    setNewBot({ name: "", token: "" });
    setIsAddDialogOpen(false);
    toast.success("Bot adicionado com sucesso!");
  };

  const toggleBotStatus = (id: string) => {
    setBots((prev) =>
      prev.map((bot) =>
        bot.id === id
          ? { ...bot, status: bot.status === "online" ? "offline" : "online" }
          : bot
      )
    );
    toast.success("Status do bot atualizado");
  };

  const deleteBot = (id: string) => {
    setBots((prev) => prev.filter((bot) => bot.id !== id));
    toast.success("Bot removido com sucesso");
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Bots</h1>
            <p className="text-muted-foreground">
              Adicione e configure seus bots do Telegram
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="glow" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Bot
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Bot</DialogTitle>
                <DialogDescription>
                  Insira as informações do seu bot do Telegram
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Bot</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Meu Bot de Vendas"
                    value={newBot.name}
                    onChange={(e) => setNewBot((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token">Token do Bot</Label>
                  <Input
                    id="token"
                    placeholder="Cole o token do BotFather aqui"
                    value={newBot.token}
                    onChange={(e) => setNewBot((prev) => ({ ...prev, token: e.target.value }))}
                    className="bg-secondary/50 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Obtenha o token através do @BotFather no Telegram
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="glow" onClick={handleAddBot}>
                  Adicionar Bot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bots List */}
        <div className="grid gap-4">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <Bot className="h-7 w-7 text-primary" />
                    </div>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card",
                        bot.status === "online" && "bg-success",
                        bot.status === "offline" && "bg-muted-foreground",
                        bot.status === "error" && "bg-destructive"
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{bot.name}</h3>
                    <p className="text-sm text-muted-foreground">@{bot.username}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Criado em {new Date(bot.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem className="gap-2" onClick={() => toggleBotStatus(bot.id)}>
                      <Power className="h-4 w-4" />
                      {bot.status === "online" ? "Desligar" : "Ligar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Settings className="h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2 text-destructive focus:text-destructive"
                      onClick={() => deleteBot(bot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Token Section */}
              <div className="mt-4 rounded-lg bg-secondary/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Token do Bot</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 rounded bg-secondary px-3 py-2 font-mono text-sm">
                        {showTokens[bot.id]
                          ? bot.token
                          : "••••••••••••••••••••••••••••••••••••••••"}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTokenVisibility(bot.id)}
                      >
                        {showTokens[bot.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToken(bot.token)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                    bot.status === "online" && "bg-success/10 text-success",
                    bot.status === "offline" && "bg-muted text-muted-foreground",
                    bot.status === "error" && "bg-destructive/10 text-destructive"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      bot.status === "online" && "bg-success",
                      bot.status === "offline" && "bg-muted-foreground",
                      bot.status === "error" && "bg-destructive"
                    )}
                  />
                  {bot.status === "online" && "Online"}
                  {bot.status === "offline" && "Offline"}
                  {bot.status === "error" && "Erro"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
