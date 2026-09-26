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
            position: "absolute",
            inset: 0,
            zIndex: 10,
            background: "rgba(34, 197, 94, 0.12)",
            border: "2px dashed rgba(34, 197, 94, 0.6)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--nx-text)",
            fontSize: 14,
            fontWeight: 500,
            pointerEvents: "none",
          }}
        >
          Solte o arquivo aqui pra anexar
        </div>
      )}

      {onToggleNote && (
        <div style={{ display: "flex", gap: 6, padding: "6px 12px 0" }}>
          <button
            type="button"
            className="nx-btn"
            data-variant={!noteMode ? "primary" : undefined}
            onClick={() => onToggleNote(false)}
          >
            <MessageSquare size={12} /> Resposta
          </button>
          <button
            type="button"
            className="nx-btn"
            data-variant={noteMode ? "warn" : undefined}
            onClick={() => onToggleNote(true)}
          >
            <StickyNote size={12} /> Nota interna
          </button>
        </div>
      )}
      <div className="nx-composer-inner">
        {/* Botão + fora do input (igual ao print NexChat) */}
        {/* Botão + agora abre menu de ações (Documento, Foto, Câmera, Resposta rápida, Template, PIX) */}
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="nx-composer-plus"
              disabled={disabled || noteMode}
              aria-label="Adicionar"
              title={noteMode ? "Anexos não disponíveis em notas internas" : "Mais ações"}
            >
              <Plus size={20} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-60 p-1.5 nx-plus-menu"
          >
            <MenuItem
              icon={FileText}
              label="Documento"
              onClick={() => { setMenuOpen(false); docInputRef.current?.click(); }}
            />
            <MenuItem
              icon={ImageIcon}
              label="Foto e vídeo"
              onClick={() => { setMenuOpen(false); mediaInputRef.current?.click(); }}
            />
            <MenuItem
              icon={Camera}
              label="Câmera"
              onClick={() => { setMenuOpen(false); cameraInputRef.current?.click(); }}
            />
            {onQuickReply && (
              <MenuItem
                icon={Zap}
                label="Resposta rápida"
                onClick={() => { setMenuOpen(false); onQuickReply(); }}
              />
            )}
            {channelKind === "meta" && onTemplate && (
              <MenuItem
                icon={FileCode}
                label="Template aprovado"
                onClick={() => { setMenuOpen(false); onTemplate(); }}
              />
            )}
            {onSendPix && (
              <MenuItem
                icon={QrCode}
                label="Enviar PIX"
                accent
                disabled={outOfWindow}
                title={outOfWindow ? "Fora da janela 24h — cliente precisa responder antes" : undefined}
                onClick={() => { setMenuOpen(false); onSendPix(); }}
              />
            )}
          </PopoverContent>
        </Popover>

        {/* Inputs de arquivo escondidos (cada um com filtro próprio) */}
        <input
          ref={docInputRef}
          type="file"
          hidden
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) handleFiles(files);
            e.target.value = "";
          }}
        />
        <input
          ref={mediaInputRef}
          type="file"
          hidden
          accept="image/*,video/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) handleFiles(files);
            e.target.value = "";
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          hidden
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) handleFiles(files);
            e.target.value = "";
          }}
        />

        <div
          className="nx-input-wrap"
          style={noteMode ? { background: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.35)" } : undefined}
        >
          <button type="button" className="nx-icon-btn" disabled={disabled} aria-label="Emoji">
            <Smile size={18} />
          </button>
          <textarea
            ref={taRef}
            rows={1}
            placeholder={effectivePlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            onPaste={onPaste}
            autoFocus
          />
          <button
            type="button"
            className="nx-icon-btn"
            onClick={onAttach}
            disabled={disabled || noteMode}
            aria-label="Anexar"
            title={noteMode ? "Anexos não disponíveis em notas internas" : "Anexar"}
          >
            <Paperclip size={18} />
          </button>
        </div>

        {/* Botão verde circular: mic quando vazio, send quando tem texto */}
        <button
          type="button"
          className="nx-send"
          onClick={hasText ? submit : undefined}
          disabled={disabled}
          aria-label={hasText ? "Enviar" : "Gravar áudio"}
          title={hasText ? "Enviar" : "Gravar áudio"}
        >
          {hasText ? <Send size={20} /> : <Mic size={22} strokeWidth={2.2} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  accent,
  disabled,
  title,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  accent?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-left transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-[var(--nx-surface-hover)]"
      }`}
    >
      <Icon size={18} className={accent ? "text-emerald-500" : "text-[var(--nx-text-muted)]"} />
      <span className="text-[var(--nx-text)]">{label}</span>
    </button>
  );
}
