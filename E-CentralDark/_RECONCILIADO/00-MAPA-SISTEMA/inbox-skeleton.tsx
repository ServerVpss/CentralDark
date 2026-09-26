import { Search, Filter, Star, Paperclip, Mic, Send, Smile, Phone, Video, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FAKE_CONVERSATIONS = [
  { id: 1, name: "João Silva", last: "Boa tarde, pode me ajudar?", time: "14:32", unread: 2, tag: "Vendas", online: true },
  { id: 2, name: "Maria Santos", last: "Obrigada pelo atendimento!", time: "13:48", unread: 0, tag: "Suporte", online: false },
  { id: 3, name: "Pedro Costa", last: "Vou verificar e te retorno", time: "12:15", unread: 5, tag: "Vendas", online: true },
  { id: 4, name: "Ana Oliveira", last: "Qual o prazo de entrega?", time: "11:02", unread: 1, tag: "Suporte", online: false },
  { id: 5, name: "Carlos Mendes", last: "Perfeito, fechado!", time: "10:30", unread: 0, tag: "Vendas", online: true },
];

export function InboxSkeleton() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left: conversation list */}
      <div className="flex w-80 flex-col border-r bg-card">
        <div className="border-b p-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar conversa..." className="pl-9" />
          </div>
          <div className="flex gap-1">
            <Button variant="secondary" size="sm" className="flex-1">Todas</Button>
            <Button variant="ghost" size="sm" className="flex-1">Não lidas</Button>
            <Button variant="ghost" size="sm" className="flex-1">Minhas</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Filter className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {FAKE_CONVERSATIONS.map((c) => (
            <div key={c.id} className={cn("flex cursor-pointer items-start gap-3 border-b px-3 py-3 transition-colors hover:bg-muted/50", c.id === 1 && "bg-muted/40")}>
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">{c.name.split(" ").map(n => n[0]).slice(0,2).join("")}</AvatarFallback>
                </Avatar>
                {c.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.last}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <Badge variant="outline" className="h-4 px-1.5 text-[9px]">{c.tag}</Badge>
                  {c.unread > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{c.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center: chat */}
      <div className="flex flex-1 flex-col bg-muted/20">
        <div className="flex items-center justify-between border-b bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">JS</AvatarFallback></Avatar>
            <div>
              <p className="text-sm font-semibold">João Silva</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">● online · digitando…</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Video className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Star className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex justify-start"><div className="max-w-[60%] rounded-2xl rounded-tl-sm bg-card px-4 py-2 shadow-sm"><p className="text-sm">Boa tarde, pode me ajudar?</p><p className="mt-1 text-[10px] text-muted-foreground">14:30</p></div></div>
          <div className="flex justify-end"><div className="max-w-[60%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2 text-primary-foreground shadow-sm"><p className="text-sm">Claro! Em que posso ajudar?</p><p className="mt-1 text-[10px] opacity-70">14:31 ✓✓</p></div></div>
          <div className="flex justify-start"><div className="max-w-[60%] rounded-2xl rounded-tl-sm bg-card px-4 py-2 shadow-sm"><p className="text-sm">Gostaria de saber sobre o plano enterprise.</p><p className="mt-1 text-[10px] text-muted-foreground">14:32</p></div></div>
        </div>

        <div className="border-t bg-card p-3">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9"><Smile className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-9 w-9"><Paperclip className="h-4 w-4" /></Button>
            <Input placeholder="Digite uma mensagem..." className="flex-1" />
            <Button variant="ghost" size="icon" className="h-9 w-9"><Mic className="h-4 w-4" /></Button>
            <Button size="icon" className="h-9 w-9"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Right: contact panel */}
      <div className="hidden w-72 flex-col border-l bg-card xl:flex">
        <div className="border-b p-4 text-center">
          <Avatar className="mx-auto h-16 w-16"><AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">JS</AvatarFallback></Avatar>
          <p className="mt-2 text-sm font-semibold">João Silva</p>
          <p className="text-xs text-muted-foreground">+55 11 99999-0001</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <section><p className="mb-1 font-semibold uppercase text-muted-foreground">Setor</p><Badge>Vendas</Badge></section>
          <section><p className="mb-1 font-semibold uppercase text-muted-foreground">Atendente</p><p>—</p></section>
          <section><p className="mb-1 font-semibold uppercase text-muted-foreground">Etiquetas</p><div className="flex flex-wrap gap-1"><Badge variant="outline">Lead quente</Badge><Badge variant="outline">Premium</Badge></div></section>
          <section><p className="mb-1 font-semibold uppercase text-muted-foreground">Notas</p><p className="text-muted-foreground">—</p></section>
        </div>
      </div>
    </div>
  );
}
