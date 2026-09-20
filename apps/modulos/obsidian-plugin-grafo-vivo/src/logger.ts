// Logger persistente do auto-update. Guarda últimas N entradas no disco do plugin
// e expõe helpers pra UI ler/limpar. Também dispara callbacks pra atualizar a tela.

import type { Plugin } from "obsidian";

export type NivelLog = "info" | "sucesso" | "aviso" | "erro";

export interface EntradaLog {
  ts: number;             // timestamp epoch ms
  nivel: NivelLog;
  etapa: string;          // "checagem" | "download" | "hash" | "backup" | "aplicar" | "rollback" | "boot"
  mensagem: string;
  detalhes?: string;      // stack, url, hash esperado vs recebido, etc
}

const ARQUIVO_LOG = "auto-update.log.json";
const MAX_ENTRADAS = 200;

export class LoggerAutoUpdate {
  private entradas: EntradaLog[] = [];
  private listeners: Set<() => void> = new Set();
  private caminho: string;

  constructor(private plugin: Plugin) {
    // @ts-ignore manifest.dir existe em runtime
    const dir = plugin.manifest.dir ?? `.obsidian/plugins/${plugin.manifest.id}`;
    this.caminho = `${dir}/${ARQUIVO_LOG}`;
  }

  async carregar(): Promise<void> {
    try {
      const adapter = this.plugin.app.vault.adapter;
      if (await adapter.exists(this.caminho)) {
        const raw = await adapter.read(this.caminho);
        this.entradas = JSON.parse(raw);
      }
    } catch {
      this.entradas = [];
    }
  }

  private async persistir() {
    try {
      await this.plugin.app.vault.adapter.write(
        this.caminho,
        JSON.stringify(this.entradas, null, 2),
      );
    } catch (e) {
      console.error("[GrafoVivo] falha ao persistir log", e);
    }
  }

  async registrar(entrada: Omit<EntradaLog, "ts">) {
    const nova: EntradaLog = { ts: Date.now(), ...entrada };
    this.entradas.push(nova);
    if (this.entradas.length > MAX_ENTRADAS) {
      this.entradas = this.entradas.slice(-MAX_ENTRADAS);
    }
    await this.persistir();
    this.listeners.forEach((l) => l());
    // Espelho no console pra debug rápido.
    const prefixo = `[GrafoVivo/${entrada.etapa}]`;
    if (entrada.nivel === "erro") console.error(prefixo, entrada.mensagem, entrada.detalhes ?? "");
    else if (entrada.nivel === "aviso") console.warn(prefixo, entrada.mensagem);
    else console.log(prefixo, entrada.mensagem);
  }

  listar(): EntradaLog[] {
    return [...this.entradas].reverse(); // mais recentes primeiro
  }

  ultimoErro(): EntradaLog | null {
    for (let i = this.entradas.length - 1; i >= 0; i--) {
      if (this.entradas[i].nivel === "erro") return this.entradas[i];
    }
    return null;
  }

  async limpar() {
    this.entradas = [];
    await this.persistir();
    this.listeners.forEach((l) => l());
  }

  onChange(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

export function formatarData(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR");
}
