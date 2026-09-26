import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ensureContactAvatarFresh,
  ensureGroupAvatarFresh,
} from "@/lib/contacts-avatar.functions";

// Throttle em memória (zera ao recarregar a página, server-side ainda protege).
// chave: "contact:<id>" ou "group:<id>"
const lastTried = new Map<string, number>();
const markedEmpty = new Map<string, number>();

const THROTTLE_MS = 10 * 60 * 1000;          // 10 min entre tentativas
const EMPTY_TTL_MS = 6 * 60 * 60 * 1000;     // 6 h pra "sem foto pública"

type Args =
  | { kind: "contact"; id: string | null | undefined; hasAvatar: boolean }
  | { kind: "group"; id: string | null | undefined; hasAvatar: boolean };

/**
 * Dispara, em segundo plano, uma atualização de foto pra conversa aberta.
 * - Não trava UI, não mostra loading, não mostra erro pro atendente.
 * - Throttle de 10 min por id; "sem foto" segura por 6 h.
 * - O server pula sozinho se a foto está fresca (<24h).
 */
export function useAvatarAutoRefresh(args: Args) {
  const qc = useQueryClient();
  const ensureContact = useServerFn(ensureContactAvatarFresh);
  const ensureGroup = useServerFn(ensureGroupAvatarFresh);

  const { kind, id, hasAvatar } = args;

  useEffect(() => {
    if (!id) return;
    // Se já tem foto, nada de chamar agora — server-side decide staleness
    // só quando a gente realmente quiser puxar. Aqui priorizamos quem está
    // sem foto pra reduzir tráfego inútil.
    if (hasAvatar) return;

    const key = `${kind}:${id}`;
    const now = Date.now();

    const lastEmpty = markedEmpty.get(key);
    if (lastEmpty && now - lastEmpty < EMPTY_TTL_MS) return;

    const last = lastTried.get(key);
    if (last && now - last < THROTTLE_MS) return;

    lastTried.set(key, now);

    // Fire-and-forget — não bloqueia render.
    (async () => {
      try {
        const r =
          kind === "contact"
            ? await ensureContact({ data: { contactId: id } })
            : await ensureGroup({ data: { groupId: id } });

        if (r && typeof r === "object") {
          if ("updated" in r && r.updated) {
            // Foto nova chegou — invalida pra UI repintar.
            qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
          } else if ("skipped" in r && r.skipped === "no_picture") {
            markedEmpty.set(key, Date.now());
          }
        }
      } catch (e) {
        // Log discreto, não mostra erro ao atendente.
        console.warn("[avatar-auto] falhou", {
          key,
          message: String((e as { message?: string })?.message ?? e),
        });
      }
    })();
  }, [kind, id, hasAvatar, ensureContact, ensureGroup, qc]);
}
