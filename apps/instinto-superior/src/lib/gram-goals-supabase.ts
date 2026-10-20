/**
 * GRAM GOALS × SUPABASE — Persistência de delegações
 * Armazena GOALs e recibos para histórico e auditoria
 */

import { supabase } from "@/integrations/supabase/client";
import type { GOALObject, GramRecibo } from "./gram-goals-system";

export async function salvarGOALNoSupabase(goal: GOALObject): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("gram_goals")
      .insert({
        id: goal.id,
        executor: goal.executor,
        ambiente: goal.ambiente,
        capacidade: goal.capacidade,
        prazo: goal.prazo,
        status: goal.status,
        criada_em: goal.criada_em,
        enviada_em: goal.enviada_em,
        herme_session_id: goal.hermeSessionId,
        tipo: goal.tipo,
      });

    return !error;
  } catch (e) {
    console.error("Erro ao salvar GOAL:", e);
    return false;
  }
}

export async function atualizarGOALNoSupabase(goal: GOALObject): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("gram_goals")
      .update({
        status: goal.status,
        completada_em: goal.completada_em,
        herme_session_id: goal.hermeSessionId,
        resultado_status: goal.resultado?.status,
        resultado_msg: goal.resultado?.mensagem,
        recibo_id: goal.reciboId,
      })
      .eq("id", goal.id);

    return !error;
  } catch (e) {
    console.error("Erro ao atualizar GOAL:", e);
    return false;
  }
}

export async function salvarReciboNoSupabase(recibo: GramRecibo): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("gram_recibos")
      .insert({
        id: recibo.id,
        goal_id: recibo.goalId,
        herme_session_id: recibo.hermeSessionId,
        status: recibo.status,
        resultado: recibo.resultado,
        timestamp: recibo.timestamp,
        assinado: recibo.assinado,
      });

    return !error;
  } catch (e) {
    console.error("Erro ao salvar recibo:", e);
    return false;
  }
}

export async function listarGOALsRecentes(): Promise<GOALObject[]> {
  try {
    const { data, error } = await supabase
      .from("gram_goals")
      .select("*")
      .order("criada_em", { ascending: false })
      .limit(20);

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      timestamp: row.criada_em,
      tipo: row.tipo,
      executor: row.executor,
      ambiente: row.ambiente,
      capacidade: row.capacidade,
      prazo: row.prazo,
      status: row.status,
      criada_em: row.criada_em,
      enviada_em: row.enviada_em,
      hermeSessionId: row.herme_session_id,
      reciboId: row.recibo_id,
      resultado: row.resultado_status ? {
        status: row.resultado_status,
        mensagem: row.resultado_msg,
        timestamp: row.completada_em,
      } : undefined,
    }));
  } catch (e) {
    console.error("Erro ao listar GOALs:", e);
    return [];
  }
}
