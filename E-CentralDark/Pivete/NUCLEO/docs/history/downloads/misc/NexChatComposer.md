# OUTRO - NexChatComposer.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\nexchat\NexChatComposer.tsx
**SHA:** 8d6a4bddb8e31ac6
**Timestamp:** 2026-08-26T19:31:47.442668
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <div style={{ display: "flex", gap: 6, padding: "6px 12px 0" }}>

### Ouro Bruto (primeiros 5000 chars)
```
import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, DragEvent } from "react";
import { Paperclip, Send, Smile, Mic, StickyNote, MessageSquare, Plus, QrCode, FileText, Image as ImageIcon, Camera, Zap, FileCode } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

const MAX_FILE_BYTES = 16 * 1024 * 1024; // 16MB (limite WhatsApp Cloud API)
const BLOCKED_EXT = [".exe", ".bat", ".sh", ".cmd", ".msi", ".com"];

function isBlocked(name: string) {
  const lower = name.toLowerCase();
  return BLOCKED_EXT.some((e) => lower.endsWith(e));
}

export function NexChatComposer({
  placeholder = "Digite uma mensagem…",
  disabled,
  onSend,
  onAttach,
  onPasteFile,
  noteMode = false,
  onToggleNote,
  onSendPix,
  onQuickReply,
  onTemplate,
  channelKind,
  outOfWindow = false,
}: {
  placeholder?: string;
  disabled?: boolean;
  onSend?: (text: string) => void;
  onAttach?: () => void;
  onPasteFile?: (file: File) => void;
  noteMode?: boolean;
  onToggleNote?: (v: boolean) => void;
  onSendPix?: () => void;
  onQuickReply?: () => void;
  onTemplate?: () => void;
  /** "meta" mostra opção Template; QR/web não. */
  channelKind?: "meta" | "qr" | "web" | string;
  /** Quando true, bloqueia botão PIX (fora da janela 24h). */
  outOfWindow?: boolean;
}) {
  const [text, setText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dragCounter = useRef(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const hasText = text.trim().length > 0;

  // Mantém o foco no campo de digitação SEMPRE — igual WhatsApp Web.
  // Quando o envio termina (disabled volta a false), refoca automaticamente.
  useEffect(() => {
    if (!disabled) {
      requestAnimationFrame(() => taRef.current?.focus());
    }
  }, [disabled]);

  function submit() {
    const t = text.trim();
    if (!t || disabled) return;
    setText("");
    // Limpa antes do processamento do envio: evita mensagem "presa" quando o canal demora.
    onSend?.(t);
    // Mantém o cursor dentro da caixa — não "sai da conversa" ao enviar com Enter.
    requestAnimationFrame(() => taRef.current?.focus());
  }
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      submit();
    }
  }

  function handleFiles(files: File[]) {
    if (!onPasteFile || disabled || noteMode) {
      if (noteMode) toast.error("Anexos não disponíveis em notas internas");
      return;
    }
    for (const f of files) {
      if (isBlocked(f.name)) {
        toast.error(`Tipo de arquivo bloqueado: ${f.name}`);
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        toast.error(`Arquivo muito grande: ${f.name} (máx. 16 MB)`);
        continue;
      }
      onPasteFile(f);
    }
  }

  function onPaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === "file") {
        const f = it.getAsFile();
        if (f) {
          // imagem colada do clipboard normalmente vem sem nome
          const named =
            f.name && f.name !== "image.png"
              ? f
              : new File([f], `colado-${Date.now()}.${(f.type.split("/")[1] || "png")}`, { type: f.type });
          files.push(named);
        }
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      handleFiles(files);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    dragCounter.current = 0;
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (files.length > 0) handleFiles(files);
  }
  function onDragOver(e: DragEvent<HTMLDivElement>) {
    if (e.dataTransfer?.types?.includes("Files")) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  function onDragEnter(e: DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    dragCounter.current += 1;
    setDragOver(true);
  }
  function onDragLeave() {
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setDragOver(false);
  }

  const effectivePlaceholder = noteMode ? "Nota visível só pra equipe…" : placeholder;

  return (
    <div
      className="nx-composer"
      data-note={noteMode || undefined}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      style={{ position: "relative" }}
    >
      {dragOver && !noteMode && (
        <div
          style={{
  
```