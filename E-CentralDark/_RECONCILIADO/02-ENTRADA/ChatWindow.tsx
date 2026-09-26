import React, { useRef, useEffect } from "react";
import {
  Send, ChevronLeft, Info, MoreVertical, Paperclip, Smile, Mic,
  CheckCheck, Check, Clock, MessageSquare, Loader2,
  Image as ImageIcon, Camera, FileText, Phone, Video,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Contact } from "@/services/contactService";
import type { Message } from "@/services/messageService";
import { formatTimeBR, formatDateBR } from "@/lib/datetime";

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  inputText: string;
  isLoadingMessages: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onBack: () => void;
  onToggleInfo: () => void;
  showInfoPanel: boolean;
  className?: string;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
}

function getStatusIcon(status?: string) {
  switch (status) {
    case "read": return <CheckCheck className="w-[14px] h-[14px] text-[#53bdeb]" />;
    case "delivered": return <CheckCheck className="w-[14px] h-[14px] text-[#8696a0]" />;
    case "sent": return <Check className="w-[14px] h-[14px] text-[#8696a0]" />;
    case "pending": return <Clock className="w-[14px] h-[14px] text-[#8696a0]" />;
    default: return <Check className="w-[14px] h-[14px] text-[#8696a0]" />;
  }
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  try { return formatTimeBR(dateStr); }
  catch { return ""; }
}

function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: Record<string, Message[]> = {};
  for (const msg of messages) {
    const d = msg.created_at ? formatDateBR(msg.created_at) : "Hoje";
    if (!groups[d]) groups[d] = [];
    groups[d].push(msg);
  }
  return Object.entries(groups).map(([date, msgs]) => ({ date, messages: msgs }));
}

export default function ChatWindow({
  contact, messages, inputText, isLoadingMessages,
  onInputChange, onSendMessage, onBack, onToggleInfo, showInfoPanel, className = "",
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSendMessage(e as unknown as React.FormEvent); }
  };

  if (!contact) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center bg-[#222e35] ${className}`}>
        <div className="max-w-md text-center px-6">
          <div className="w-[200px] h-[200px] mx-auto mb-8 rounded-full bg-[#2a3942]/50 flex items-center justify-center">
            <MessageSquare className="w-20 h-20 text-[#8696a0] opacity-40" />
          </div>
          <h2 className="text-[28px] font-light text-[#e9edef] mb-3">WABOT Console</h2>
          <p className="text-[14px] text-[#8696a0] leading-relaxed">Envie e receba mensagens do WhatsApp. Selecione uma conversa ao lado para começar.</p>
          <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-[#8696a0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />Conectado ao servidor
          </div>
        </div>
      </div>
    );
  }

  const grouped = groupMessagesByDate(messages);

  return (
    <div className={`flex-1 flex flex-col bg-[#0b141a] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="h-[60px] px-2 md:px-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="md:hidden text-[#aebac1] hover:bg-[#2a3942] shrink-0" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <button onClick={onToggleInfo} className="flex items-center gap-3 min-w-0 hover:bg-[#2a3942] rounded-lg px-2 py-1.5 -mx-2 transition-colors">
            <Avatar className="w-10 h-10 shrink-0"><AvatarFallback className="bg-emerald-600 text-white text-sm font-medium">{getInitials(contact.name)}</AvatarFallback></Avatar>
            <div className="min-w-0">
              <h3 className="text-[16px] font-normal text-[#e9edef] truncate">{contact.name || contact.phone}</h3>
              <p className="text-[12px] text-[#8696a0] truncate">{contact.phone}</p>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#2a3942] w-9 h-9 hidden md:flex"><Video className="w-[18px] h-[18px]" /></Button>
          <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#2a3942] w-9 h-9 hidden md:flex"><Phone className="w-[18px] h-[18px]" /></Button>
          <Button variant="ghost" size="icon" className={`w-9 h-9 ${showInfoPanel ? "text-[#00a884] bg-[#2a3942]" : "text-[#aebac1] hover:bg-[#2a3942]"}`} onClick={onToggleInfo}><Info className="w-[18px] h-[18px]" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#2a3942] w-9 h-9"><MoreVertical className="w-[18px] h-[18px]" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#233138] border-[#2a3942] text-[#e9edef] min-w-[200px]">
              <DropdownMenuItem className="focus:bg-[#2a3942]">Info do contato</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#2a3942]">Silenciar notificações</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2a3942]" />
              <DropdownMenuItem className="focus:bg-[#2a3942]">Limpar conversa</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#2a3942] text-red-400">Bloquear</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-[7%] lg:px-[12%] py-4" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
        {isLoadingMessages ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#00a884]" /></div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center py-16"><div className="bg-[#1d282f] rounded-lg px-4 py-2 text-[12.5px] text-[#8696a0] text-center shadow-sm">Nenhuma mensagem ainda. Diga olá! 👋</div></div>
        ) : (
          grouped.map((group) => (
            <div key={group.date}>
              <div className="flex justify-center my-4"><span className="bg-[#182229] text-[#8696a0] text-[11.5px] px-3 py-[5px] rounded-lg shadow-sm">{group.date}</span></div>
              {group.messages.map((msg) => {
                const isOut = msg.direction === "outbound";
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }}
                    className={`flex mb-[3px] ${isOut ? "justify-end" : "justify-start"}`}>
                    <div className={`relative max-w-[65%] md:max-w-[45%] px-[9px] pt-[6px] pb-[8px] rounded-lg shadow-sm ${isOut ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none" : "bg-[#202c33] text-[#e9edef] rounded-tl-none"}`}>
                      <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words">{msg.text}<span className="inline-block w-[68px]" /></p>
                      <div className={`absolute bottom-[5px] right-[7px] flex items-center gap-[3px] text-[11px] ${isOut ? "text-[#ffffff99]" : "text-[#8696a0]"}`}>
                        <span>{formatTime(msg.created_at)}</span>
                        {isOut && getStatusIcon(msg.status)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-2 md:px-4 py-[6px] bg-[#202c33] border-t border-[#2a3942] shrink-0">
        <form onSubmit={onSendMessage} className="flex items-end gap-2 max-w-5xl mx-auto">
          <Button type="button" variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#2a3942] w-10 h-10 shrink-0 hidden md:flex"><Smile className="w-6 h-6" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#2a3942] w-10 h-10 shrink-0"><Paperclip className="w-6 h-6 rotate-45" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="bg-[#233138] border-[#2a3942] text-[#e9edef] mb-2">
              <DropdownMenuItem className="focus:bg-[#2a3942] gap-3"><FileText className="w-4 h-4 text-violet-400" /> Documento</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#2a3942] gap-3"><ImageIcon className="w-4 h-4 text-blue-400" /> Fotos e vídeos</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#2a3942] gap-3"><Camera className="w-4 h-4 text-pink-400" /> Câmera</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex-1 bg-[#2a3942] rounded-lg px-3 py-[6px]">
            <textarea ref={textareaRef} placeholder="Mensagem" value={inputText} onChange={(e) => onInputChange(e.target.value)} onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#e9edef] placeholder:text-[#8696a0] outline-none resize-none leading-[20px] max-h-[120px]" rows={1} />
          </div>
          {inputText.trim() ? (
            <Button type="submit" variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#2a3942] w-10 h-10 shrink-0"><Send className="w-6 h-6 text-[#e9edef]" /></Button>
          ) : (
            <Button type="button" variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#2a3942] w-10 h-10 shrink-0"><Mic className="w-6 h-6" /></Button>
          )}
        </form>
      </div>
    </div>
  );
}
