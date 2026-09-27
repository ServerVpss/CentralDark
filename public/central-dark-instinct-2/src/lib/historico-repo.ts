// Histórico local das consultas ao repositório. Fica só no navegador do usuário:
// nada é enviado ao GitHub nem gravado no projeto.

const CHAVE = "centraldark:historico-repositorio";
const LIMITE = 20;

export type ItemHistorico = {
  repo: string;
  quando: string; // ISO
  arquivos: string[];
  acao: "consulta" | "leitura" | "previa" | "zip" | "comparacao";
};

export function lerHistorico(): ItemHistorico[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const dados = bruto ? (JSON.parse(bruto) as ItemHistorico[]) : [];
    return Array.isArray(dados) ? dados.slice(0, LIMITE) : [];
  } catch {
    return [];
  }
}

export function registrarHistorico(item: Omit<ItemHistorico, "quando">): ItemHistorico[] {
  if (typeof window === "undefined") return [];
  const novo: ItemHistorico = { ...item, quando: new Date().toISOString() };
  const lista = [novo, ...lerHistorico()].slice(0, LIMITE);
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    // armazenamento indisponível: segue sem histórico
  }
  return lista;
}

export function limparHistorico(): ItemHistorico[] {
  if (typeof window === "undefined") return [];
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    // ignora
  }
  return [];
}

export function formatarQuando(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}
