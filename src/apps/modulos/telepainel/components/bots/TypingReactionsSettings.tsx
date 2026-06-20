import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Keyboard, Trash2, Heart, Plus, Shuffle, Target, X } from "lucide-react";

const DEFAULT_EMOJIS = ["👍", "❤️", "🔥", "🎉", "🤩", "😁", "🤖", "🔔", "👏", "🧠"];

interface TypingReactionsSettingsProps {
  autoDeleteMessages: boolean;
  setAutoDeleteMessages: (value: boolean) => void;
  showTyping: boolean;
  setShowTyping: (value: boolean) => void;
  reactToMessages: boolean;
  setReactToMessages: (value: boolean) => void;
  reactionMode: "fixed" | "random";
  setReactionMode: (value: "fixed" | "random") => void;
  fixedEmoji: string;
  setFixedEmoji: (value: string) => void;
  customEmojis: string[];
  setCustomEmojis: (value: string[]) => void;
  onAutoSave?: (key: string, value: boolean | string) => void;
}

export function TypingReactionsSettings({
  autoDeleteMessages,
  setAutoDeleteMessages,
  showTyping,
  setShowTyping,
  reactToMessages,
  setReactToMessages,
  reactionMode,
  setReactionMode,
  fixedEmoji,
  setFixedEmoji,
  customEmojis,
  setCustomEmojis,
  onAutoSave,
}: TypingReactionsSettingsProps) {
  const [newEmoji, setNewEmoji] = useState("");

  const handleAddEmoji = () => {
    if (newEmoji.trim() && !customEmojis.includes(newEmoji.trim())) {
      setCustomEmojis([...customEmojis, newEmoji.trim()]);
      setNewEmoji("");
    }
  };

  const handleRemoveEmoji = (emoji: string) => {
    setCustomEmojis(customEmojis.filter((e) => e !== emoji));
  };

  const allEmojis = [...DEFAULT_EMOJIS, ...customEmojis];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-primary" />
          Digitando & Reações
        </CardTitle>
        <CardDescription>
          Configure o indicador de digitação e reações automáticas para o módulo Puxadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Delete Messages */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Exclusão Automática de Mensagens
            </Label>
            <p className="text-xs text-muted-foreground">
              Apaga mensagens anteriores do bot ao navegar pelos menus (mantém chat limpo)
            </p>
          </div>
          <Switch
            checked={autoDeleteMessages}
            onCheckedChange={(checked) => {
              setAutoDeleteMessages(checked);
              onAutoSave?.("auto_delete_messages", checked);
            }}
          />
        </div>

        {/* Show Typing */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Mostrar "Digitando..."
            </Label>
            <p className="text-xs text-muted-foreground">
              Exibe indicador de digitação antes de enviar mensagens
            </p>
          </div>
          <Switch
            checked={showTyping}
            onCheckedChange={(checked) => {
              setShowTyping(checked);
              onAutoSave?.("show_typing", checked);
            }}
          />
        </div>

        {/* React to Messages */}
        <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-destructive" />
                Reagir às Mensagens
              </Label>
              <p className="text-xs text-muted-foreground">
                Bot "curte" mensagens de consulta dos usuários
              </p>
            </div>
            <Switch
              checked={reactToMessages}
              onCheckedChange={(checked) => {
                setReactToMessages(checked);
                onAutoSave?.("react_to_messages", checked);
              }}
            />
          </div>

          {reactToMessages && (
            <>
              <Separator />
              
              {/* Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={reactionMode === "fixed" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setReactionMode("fixed")}
                  className="gap-2"
                >
                  <Target className="h-4 w-4" />
                  Fixo
                </Button>
                <Button
                  variant={reactionMode === "random" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setReactionMode("random")}
                  className={cn(
                    "gap-2",
                    reactionMode === "random" && "bg-orange-500 hover:bg-orange-600"
                  )}
                >
                  <Shuffle className="h-4 w-4" />
                  Aleatório
                </Button>
              </div>

              {/* Fixed Mode - Select Emoji */}
              {reactionMode === "fixed" && (
                <div className="space-y-3">
                  <Label className="text-sm">Selecione o emoji fixo:</Label>
                  <div className="flex flex-wrap gap-2">
                    {allEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setFixedEmoji(emoji)}
                        className={cn(
                          "text-2xl p-2 rounded-lg transition-all",
                          fixedEmoji === emoji
                            ? "bg-primary/20 ring-2 ring-primary"
                            : "bg-secondary/50 hover:bg-secondary"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Emoji */}
              <div className="space-y-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Label className="text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  Adicionar Emoji Personalizado
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Cole um emoji aqui..."
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="bg-background"
                  />
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleAddEmoji}
                    className="bg-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adicione qualquer emoji do seu teclado para usar nas reações
                </p>

                {customEmojis.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Seus emojis personalizados:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {customEmojis.map((emoji) => (
                        <div
                          key={emoji}
                          className="relative group"
                        >
                          <span className="text-2xl p-2 rounded-lg bg-secondary/50 inline-block">
                            {emoji}
                          </span>
                          <button
                            onClick={() => handleRemoveEmoji(emoji)}
                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Random Mode Info */}
              {reactionMode === "random" && (
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <Label className="text-sm flex items-center gap-2 text-orange-400">
                    <Shuffle className="h-4 w-4" />
                    Modo Aleatório Ativo
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    O bot escolherá aleatoriamente entre ({allEmojis.length} emojis):
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {allEmojis.map((emoji) => (
                      <span key={emoji} className="text-xl p-1 rounded bg-secondary/30">
                        {emoji}
                      </span>
                    ))}
                  </div>
                  {customEmojis.length > 0 && (
                    <p className="text-xs text-primary mt-2">
                      ✨ Inclui {customEmojis.length} emoji(s) personalizado(s)
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
