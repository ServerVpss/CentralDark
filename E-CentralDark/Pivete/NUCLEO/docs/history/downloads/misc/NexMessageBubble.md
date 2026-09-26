# OUTRO - NexMessageBubble.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\nexchat\NexMessageBubble.tsx
**SHA:** d881732db75d7cb0
**Timestamp:** 2026-08-26T19:31:10.220346
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200, opacity: 0.7 }}>
- style={{ display: "flex", alignItems: "center", gap: 10, color: "inherit", textDecoration: "none" }}

### Ouro Bruto (primeiros 5000 chars)
```
import { useState } from "react";
import { NexMessage, NexContact } from "./types";
import { NexPaymentCard } from "./NexPaymentCard";
import { useSignedMediaUrl } from "@/lib/use-signed-media-url";
import { FileText, Play, ImageOff, Check, CheckCheck, AlertCircle } from "lucide-react";

export function NexMessageBubble({ msg, contact, showAvatar, onCopyPix, onOpenQr, onOpenImage }: {
  msg: NexMessage;
  contact?: NexContact;
  showAvatar?: boolean;
  onCopyPix?: (code: string) => void;
  onOpenQr?: (msgId: string) => void;
  onOpenImage?: (url: string) => void;
}) {

  const isMe = msg.author === "me" || msg.author === "ai" || msg.author === "bot";
  const isSystem = msg.author === "system";
  const [imgErr, setImgErr] = useState(false);
  const hasImage = msg.media?.kind === "image";
  const hasAudio = msg.media?.kind === "audio";
  const hasDocument = msg.media?.kind === "document";
  const isMediaOnly = !!msg.media && !msg.body;
  const signedImageUrl = useSignedMediaUrl(hasImage ? msg.media?.url : null);
  const signedAudioUrl = useSignedMediaUrl(hasAudio ? msg.media?.url : null);
  const signedDocUrl = useSignedMediaUrl(hasDocument ? msg.media?.url : null);

  if (msg.payment) {
    return (
      <div className="nx-row" data-me={isMe} data-system={isSystem} data-author={msg.author}>
        <NexPaymentCard
          payment={msg.payment}
          onCopyPix={onCopyPix}
          onOpenQr={() => onOpenQr?.(msg.id)}
        />
      </div>
    );
  }

  const initials = (contact?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="nx-row" data-me={isMe} data-system={isSystem} data-author={msg.author}>
      {!isMe && !isSystem && (
        <div className="nx-row-avatar" data-hidden={!showAvatar || undefined} aria-hidden={!showAvatar}>
          {contact?.avatarUrl ? (
            <img src={contact.avatarUrl} alt={contact?.name ?? ""} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      )}
      <div className={`nx-bubble${hasImage && isMediaOnly ? " nx-bubble-media" : ""}`}>
        {msg.channelType === "group" && !isMe && !isSystem && msg.senderName && (
          <div className="nx-bubble-sender">{msg.senderName}</div>
        )}

        {hasImage && signedImageUrl && !imgErr && (
          <button
            type="button"
            onClick={() => onOpenImage?.(signedImageUrl)}
            className="nx-bubble-img-btn"
            aria-label="Abrir imagem"
          >
            <img
              src={signedImageUrl}
              alt={msg.media?.fileName ?? "imagem"}
              onError={() => setImgErr(true)}
              className="nx-bubble-img"
            />
          </button>
        )}
        {hasImage && (!msg.media?.url || imgErr) && (
          <div className="nx-bubble-img-fallback" aria-label="Imagem indisponível">
            <ImageOff size={28} />
            <span>Imagem indisponível</span>
          </div>
        )}
        {hasAudio && (
          signedAudioUrl ? (
            <audio
              controls
              preload="metadata"
              src={signedAudioUrl}
              style={{ minWidth: 240, maxWidth: 320, height: 36 }}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200, opacity: 0.7 }}>
              <Play size={18} />
              <span style={{ fontSize: 12 }}>Carregando áudio…</span>
            </div>
          )
        )}
        {hasDocument && (
          <a
            href={signedDocUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 10, color: "inherit", textDecoration: "none" }}
          >
            <FileText size={28} />
            <div>
              <div style={{ fontWeight: 600, textDecoration: "underline" }}>{msg.media?.fileName ?? "documento"}</div>
              <div style={{ fontSize: 11, color: "var(--nx-text-muted)" }}>{msg.media?.sizeLabel ?? "Baixar"}</div>
            </div>
          </a>
        )}
        {msg.body && <div style={{ marginTop: msg.media ? 6 : 0 }}>{msg.body}</div>}
        {!msg.body && !msg.media && !msg.payment && !isSystem && (
          <div style={{ fontStyle: "italic", opacity: 0.7, fontSize: 13 }}>
            Mensagem sem conteúdo
          </div>
        )}
        {(msg.time || msg.channel) && (
          <span className="nx-bubble-time">
            {msg.channel && (
              <span
                className="nx-bubble-channel"
                data-channel={
                  msg.channel === "meta"
                    ? "meta"
                    : msg.channel === "webchat"
                    ? "web"
                    : "qr"
                }
                title={`Canal: ${msg.channel.toUpperCase()}`}
              >
                {msg.channel === "meta" ? "META" : msg.channel === "webcha
```