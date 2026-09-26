import React, { useState } from "react";
import { Search, Loader2, Plus, Filter, MessageSquare, Clock, User, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Contact } from "@/services/contactService";

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  searchTerm: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSelectContact: (contact: Contact) => void;
  className?: string;
}

type ChatFilter = "all" | "mine" | "waiting" | "closed";

const FILTER_CONFIG: Record<ChatFilter, { label: string; icon: React.ElementType }> = {
  all: { label: "Todas", icon: MessageSquare },
  mine: { label: "Minhas", icon: User },
  waiting: { label: "Aguardando", icon: Clock },
  closed: { label: "Encerradas", icon: CheckCircle2 },
};

// Mock: simulate unread counts and last message per contact
function getMockMeta(contact: Contact) {
  const hash = (contact.phone || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const unread = hash % 5;
  const times = ["14:35", "13:22", "12:10", "Ontem", "28/05", "27/05"];
  const lastMsgs = [
    "Olá, preciso de ajuda",
    "Ok, obrigado!",
    "Quando chega o pedido?",
    "Quero mais informações",
    "Pode me enviar o boleto?",
    "Boa tarde!",
  ];
  return {
    unread: unread > 0 ? unread : 0,
    lastTime: times[hash % times.length],
    lastMsg: lastMsgs[hash % lastMsgs.length],
    status: hash % 4 === 0 ? "waiting" : hash % 7 === 0 ? "closed" : "active" as string,
    agent: hash % 3 === 0 ? "Carlos" : hash % 3 === 1 ? "Ana" : null as string | null,
    typing: hash % 11 === 0,
  };
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
}

function getAvatarColor(name?: string): string {
  if (!name) return "bg-muted";
  const colors = [
    "bg-emerald-600", "bg-blue-600", "bg-violet-600", "bg-amber-600",
    "bg-rose-600", "bg-cyan-600", "bg-pink-600", "bg-teal-600",
  ];
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function ChatSidebar({
  contacts, selectedContact, searchTerm, isLoading,
  onSearchChange, onSelectContact, className = "",
}: ChatSidebarProps) {
  const [activeFilter, setActiveFilter] = useState<ChatFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredContacts = contacts.filter((c) => {
    if (activeFilter === "all") return true;
    const meta = getMockMeta(c);
    if (activeFilter === "mine") return meta.agent !== null;
    if (activeFilter === "waiting") return meta.status === "waiting";
    if (activeFilter === "closed") return meta.status === "closed";
    return true;
  });

  const waitingCount = contacts.filter(c => getMockMeta(c).status === "waiting").length;
  const totalUnread = contacts.reduce((sum, c) => sum + getMockMeta(c).unread, 0);

  return (
    <div className={`flex flex-col bg-[#111b21] border-r border-[#2a3942] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="h-[60px] px-4 flex items-center justify-between bg-[#202c33] border-b border-[#2a3942]">
        <h2 className="text-[15px] font-bold text-[#e9edef] tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#00a884]" />
          Conversas
          {totalUnread > 0 && (
            <span className="bg-[#00a884] text-white text-[10px] px-[6px] py-0 h-[18px] rounded-full font-bold flex items-center justify-center min-w-[18px]">
              {totalUnread}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 ${showFilters ? "text-[#00a884] bg-[#00a884]/10" : "text-[#aebac1] hover:bg-[#2a3942]"}`}
          >
            <Filter className="w-[18px] h-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#2a3942] w-9 h-9">
            <Plus className="w-[18px] h-[18px]" />
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-[#111b21] border-b border-[#2a3942]/50"
          >
            <div className="flex gap-1 px-3 py-2">
              {(Object.keys(FILTER_CONFIG) as ChatFilter[]).map((key) => {
                const cfg = FILTER_CONFIG[key];
                const isActive = activeFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      isActive
                        ? "bg-[#00a884] text-white"
                        : "bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]"
                    }`}
                  >
                    <cfg.icon className="w-3 h-3" />
                    {cfg.label}
                    {key === "waiting" && waitingCount > 0 && (
                      <span className={`text-[9px] px-1 rounded-full ${isActive ? "bg-white/20" : "bg-amber-500/20 text-amber-400"}`}>
                        {waitingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="px-3 py-2 bg-[#111b21]">
        <div className="relative">
          <Search className="absolute left-3 top-[9px] h-4 w-4 text-[#8696a0]" />
          <Input
            placeholder="Pesquisar ou começar uma nova conversa"
            className="pl-10 h-[35px] bg-[#202c33] border-none text-[13px] text-[#e9edef] placeholder:text-[#8696a0] rounded-lg focus-visible:ring-1 focus-visible:ring-[#00a884]"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#00a884]" /></div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-[#8696a0]" />
            </div>
            <p className="text-sm text-[#8696a0]">{searchTerm ? "Nenhum contato encontrado" : "Nenhuma conversa neste filtro"}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              const meta = getMockMeta(contact);
              return (
                <motion.button
                  key={contact.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  onClick={() => onSelectContact(contact)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-[10px] transition-colors border-b border-[#2a3942]/50 ${
                    isSelected ? "bg-[#2a3942]" : "hover:bg-[#202c33]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="w-[49px] h-[49px]">
                      <AvatarFallback className={`${getAvatarColor(contact.name)} text-white text-sm font-medium`}>
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online dot */}
                    {meta.status === "active" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] border-2 border-[#111b21]" />
                    )}
                    {meta.status === "waiting" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#111b21] animate-pulse" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-[2px]">
                    <div className="flex items-center justify-between">
                      <p className="text-[16px] font-normal text-[#e9edef] truncate">{contact.name || contact.phone}</p>
                      <span className={`text-[11px] shrink-0 ml-2 ${meta.unread > 0 ? "text-[#00a884] font-medium" : "text-[#8696a0]"}`}>
                        {meta.lastTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-[2px]">
                      <div className="flex-1 min-w-0">
                        {meta.typing ? (
                          <p className="text-[13px] text-[#00a884] italic truncate">digitando...</p>
                        ) : (
                          <p className="text-[13px] text-[#8696a0] truncate">{meta.lastMsg}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {/* Agent badge */}
                        {meta.agent && (
                          <span className="text-[9px] text-[#8696a0] bg-[#202c33] px-1.5 py-0.5 rounded">
                            {meta.agent}
                          </span>
                        )}
                        {/* Status badge */}
                        {meta.status === "waiting" && (
                          <Badge className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0 h-[16px] rounded font-normal border-none">
                            Aguard.
                          </Badge>
                        )}
                        {meta.status === "closed" && (
                          <Badge className="bg-[#8696a0]/20 text-[#8696a0] text-[9px] px-1.5 py-0 h-[16px] rounded font-normal border-none">
                            Encerr.
                          </Badge>
                        )}
                        {/* Unread */}
                        {meta.unread > 0 && (
                          <span className="bg-[#00a884] text-white text-[11px] font-bold w-[20px] h-[20px] rounded-full flex items-center justify-center">
                            {meta.unread}
                          </span>
                        )}
                        {/* Tag */}
                        {!meta.agent && contact.tags && contact.tags.length > 0 && (
                          <Badge className="bg-[#00a884] text-white text-[10px] px-[6px] py-0 h-[18px] rounded-full font-normal">
                            {contact.tags[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
