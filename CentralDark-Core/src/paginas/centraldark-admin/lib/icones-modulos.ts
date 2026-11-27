// Mapa slug -> asset local. O banco guarda só a chave; o front resolve o arquivo.
import iconWhatsapp from "@/compartilhado/assets/icon-whatsapp.png";
import iconCrm from "@/compartilhado/assets/icon-crm.png";
import iconTelegram from "@/compartilhado/assets/icon-telegram.png";
import iconFinanceiro from "@/compartilhado/assets/icon-financeiro.png";

export const ICONES_MODULOS: Record<string, string> = {
  whatsapp: iconWhatsapp,
  crm: iconCrm,
  telegram: iconTelegram,
  financeiro: iconFinanceiro,
};

export function resolverIcone(chave: string): string {
  return ICONES_MODULOS[chave] ?? iconTelegram;
}

export const OPCOES_ICONE = Object.keys(ICONES_MODULOS);
