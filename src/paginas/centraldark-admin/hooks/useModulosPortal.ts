// Hook simples pra ler/mutar modulos_portal. Fallback pro array hardcoded
// se a query der pau ou vier vazia (nunca deixar o Portal quebrar).
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ModuloPortal = {
  id: string;
  slug: string;
  nome: string;
  icone: string;
  href: string;
  status: "ativo" | "em processo";
  ordem: number;
};

export const MODULOS_FALLBACK: ModuloPortal[] = [
  { id: "fb-1", slug: "whatsapp",   nome: "Bot WhatsApp", icone: "whatsapp",   href: "/whatsapp",             status: "em processo", ordem: 1 },
  { id: "fb-2", slug: "crm",        nome: "CRM",          icone: "crm",        href: "/crm",                  status: "em processo", ordem: 2 },
  { id: "fb-3", slug: "telegram",   nome: "TelePainel",   icone: "telegram",   href: "/telepainel/dashboard", status: "ativo",       ordem: 3 },
  { id: "fb-4", slug: "financeiro", nome: "Financeiro",   icone: "financeiro", href: "/financeiro",           status: "em processo", ordem: 4 },
];

export function useModulosPortal() {
  const [modulos, setModulos] = useState<ModuloPortal[]>(MODULOS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("modulos_portal")
      .select("*")
      .order("ordem", { ascending: true });

    if (error) {
      setErro(error.message);
      setModulos(MODULOS_FALLBACK);
    } else if (!data || data.length === 0) {
      setModulos(MODULOS_FALLBACK);
    } else {
      setModulos(data as ModuloPortal[]);
      setErro(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { modulos, loading, erro, recarregar };
}
