import React, { useState } from "react";
import {
  X, Phone, Tag as TagIcon, Star, Ban, BellOff, Trash2, FileText,
  ArrowRightLeft, CheckCircle2, Edit3, Save, User, Clock, MessageSquare,
  Building2, Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Contact } from "@/services/contactService";

interface ContactInfoPanelProps {
  contact: Contact;
  onClose: () => void;
  className?: string;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
}

// Mock data for enrichment
function getMockMeta(contact: Contact) {
  const hash = (contact.phone || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    agent: hash % 3 === 0 ? "Carlos — Vendas" : hash % 3 === 1 ? "Ana — Suporte" : "Sem atendente",
    sector: hash % 3 === 0 ? "Vendas" : hash % 3 === 1 ? "Suporte" : "Geral",
    totalMessages: 42 + (hash % 200),
    firstContact: "15/03/2026",
    lastSeen: "Hoje, 14:35",
    status: hash % 4 === 0 ? "waiting" : "active",
  };
}

export default function ContactInfoPanel({ contact, onClose, className = "" }: ContactInfoPanelProps) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(contact.notes || "");
  const meta = getMockMeta(contact);

  const handleSaveNotes = () => {
    setEditingNotes(false);
    toast.success("Notas salvas!");
  };

  const handleAction = (action: string) => {
    toast.message(action, { description: `Ação aplicada em ${contact.name || contact.phone}` });
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`flex flex-col bg-[#111b21] border-l border-[#2a3942] overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="h-[60px] px-4 flex items-center gap-4 bg-[#202c33] border-b border-[#2a3942] shrink-0">
        <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#2a3942] w-9 h-9" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
        <h3 className="text-[16px] text-[#e9edef] font-normal">Dados do contato</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 bg-[#111b21]">
          <Avatar className="w-[200px] h-[200px] mb-5">
            <AvatarFallback className="bg-emerald-600 text-white text-5xl font-light">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-[22px] text-[#e9edef] font-normal text-center">{contact.name || "Sem nome"}</h2>
          <p className="text-[14px] text-[#8696a0] mt-1 font-mono">{contact.phone}</p>
          {/* Status badge */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${meta.status === "waiting" ? "bg-amber-500 animate-pulse" : "bg-[#00a884]"}`} />
            <span className={`text-[12px] font-medium ${meta.status === "waiting" ? "text-amber-400" : "text-[#00a884]"}`}>
              {meta.status === "waiting" ? "Aguardando atendimento" : "Em atendimento"}
            </span>
          </div>
        </div>

        <div className="h-2 bg-[#0b141a]" />

        {/* Atendente + Setor */}
        <div className="p-6 bg-[#111b21]">
          <h4 className="text-[12px] font-bold text-[#8696a0] uppercase tracking-wider mb-4">Atendimento</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <User className="w-[18px] h-[18px] text-[#8696a0] mt-0.5 shrink-0" />
              <div>
                <p className="text-[14px] text-[#e9edef]">{meta.agent}</p>
                <p className="text-[13px] text-[#8696a0]">Atendente responsável</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Building2 className="w-[18px] h-[18px] text-[#8696a0] mt-0.5 shrink-0" />
              <div>
                <p className="text-[14px] text-[#e9edef]">{meta.sector}</p>
                <p className="text-[13px] text-[#8696a0]">Setor</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageSquare className="w-[18px] h-[18px] text-[#8696a0] mt-0.5 shrink-0" />
              <div>
                <p className="text-[14px] text-[#e9edef]">{meta.totalMessages} mensagens</p>
                <p className="text-[13px] text-[#8696a0]">Total de mensagens</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="w-[18px] h-[18px] text-[#8696a0] mt-0.5 shrink-0" />
              <div>
                <p className="text-[14px] text-[#e9edef]">{meta.lastSeen}</p>
                <p className="text-[13px] text-[#8696a0]">Última atividade</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-2 bg-[#0b141a]" />

        {/* Contact info */}
        <div className="p-6 bg-[#111b21]">
          <h4 className="text-[12px] font-bold text-[#8696a0] uppercase tracking-wider mb-4">Informações</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Phone className="w-[18px] h-[18px] text-[#8696a0] mt-0.5 shrink-0" />
              <div>
                <p className="text-[14px] text-[#e9edef]">{contact.phone}</p>
                <p className="text-[13px] text-[#8696a0]">Telefone</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="w-[18px] h-[18px] text-[#8696a0] mt-0.5 shrink-0" />
              <div>
                <p className="text-[14px] text-[#e9edef]">{meta.firstContact}</p>
                <p className="text-[13px] text-[#8696a0]">Primeiro contato</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-2 bg-[#0b141a]" />

        {/* Notas internas */}
        <div className="p-6 bg-[#111b21]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[12px] font-bold text-[#8696a0] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notas Internas
            </h4>
            <Button
              variant="ghost" size="sm"
              onClick={() => editingNotes ? handleSaveNotes() : setEditingNotes(true)}
              className="text-[#00a884] hover:bg-[#00a884]/10 h-7 text-[11px] gap-1"
            >
              {editingNotes ? <><Save className="w-3 h-3" /> Salvar</> : <><Edit3 className="w-3 h-3" /> Editar</>}
            </Button>
          </div>
          {editingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione notas sobre este contato..."
              className="w-full bg-[#202c33] border border-[#2a3942] rounded-lg px-3 py-2 text-[14px] text-[#e9edef] placeholder:text-[#8696a0] outline-none focus:ring-1 focus:ring-[#00a884] resize-none min-h-[80px]"
            />
          ) : (
            <p className="text-[14px] text-[#e9edef] whitespace-pre-wrap">
              {notes || <span className="text-[#8696a0] italic">Nenhuma nota adicionada</span>}
            </p>
          )}
        </div>

        <div className="h-2 bg-[#0b141a]" />

        {/* Tags */}
        <div className="p-6 bg-[#111b21]">
          <div className="flex items-center gap-3 mb-4">
            <TagIcon className="w-[18px] h-[18px] text-[#8696a0]" />
            <h4 className="text-[12px] font-bold text-[#8696a0] uppercase tracking-wider">Tags</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {contact.tags && contact.tags.length > 0 ? contact.tags.map((tag) => (
              <Badge key={tag} className="bg-[#00a884]/15 text-[#00a884] border border-[#00a884]/30 hover:bg-[#00a884]/25 px-3 py-1 text-[12px] font-normal rounded-full">
                {tag}
              </Badge>
            )) : <p className="text-[13px] text-[#8696a0]">Nenhuma tag</p>}
          </div>
        </div>

        <div className="h-2 bg-[#0b141a]" />

        {/* Ações de atendimento */}
        <div className="bg-[#111b21]">
          <button onClick={() => handleAction("Transferir conversa")}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#202c33] transition-colors text-left">
            <ArrowRightLeft className="w-[18px] h-[18px] text-[#00a884]" />
            <span className="text-[14px] text-[#e9edef]">Transferir conversa</span>
          </button>
          <button onClick={() => handleAction("Encerrar atendimento")}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#202c33] transition-colors text-left">
            <CheckCircle2 className="w-[18px] h-[18px] text-[#00a884]" />
            <span className="text-[14px] text-[#e9edef]">Encerrar atendimento</span>
          </button>
          <button onClick={() => handleAction("Mensagens favoritas")}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#202c33] transition-colors text-left">
            <Star className="w-[18px] h-[18px] text-[#8696a0]" />
            <span className="text-[14px] text-[#e9edef]">Mensagens favoritas</span>
          </button>
          <button onClick={() => handleAction("Silenciar notificações")}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#202c33] transition-colors text-left">
            <BellOff className="w-[18px] h-[18px] text-[#8696a0]" />
            <span className="text-[14px] text-[#e9edef]">Silenciar notificações</span>
          </button>
        </div>

        <div className="h-2 bg-[#0b141a]" />

        {/* Ações perigosas */}
        <div className="bg-[#111b21] pb-8">
          <button onClick={() => handleAction("Bloquear contato")}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#202c33] transition-colors text-left">
            <Ban className="w-[18px] h-[18px] text-red-400" />
            <span className="text-[14px] text-red-400">Bloquear {contact.name || "contato"}</span>
          </button>
          <button onClick={() => handleAction("Apagar conversa")}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#202c33] transition-colors text-left">
            <Trash2 className="w-[18px] h-[18px] text-red-400" />
            <span className="text-[14px] text-red-400">Apagar conversa</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
