import { requestUrl, TFile } from "obsidian";
import type GrafoVivoPlugin from "./main";

export interface KnowledgeHubReceipt {
  accepted?: boolean;
  event_id?: string;
  status?: string;
  canonical?: boolean;
  raw_checksum?: string;
  content_checksum?: string;
  encoding_suspect?: boolean;
  receipt_path?: string;
  next_route?: string;
  error?: string;
}

export class KnowledgeHubClient {
  constructor(private readonly plugin: GrafoVivoPlugin) {}

  async publishActiveNote(): Promise<KnowledgeHubReceipt> {
    const file = this.plugin.app.workspace.getActiveFile();
    if (!file) throw new Error("Nenhuma nota ativa para enviar ao Hub.");
    return this.publishFile(file);
  }

  async publishFile(file: TFile): Promise<KnowledgeHubReceipt> {
    if (!this.plugin.settings.knowledgeHubPublishEnabled) {
      throw new Error("Publicação no Hub está desativada nas configurações do plugin.");
    }

    const url = this.plugin.settings.knowledgeHubUrl.trim();
    if (!url) throw new Error("URL do Hub de conhecimento não configurada.");

    const token = this.plugin.settings.knowledgeHubToken.trim();
    if (!token) throw new Error("Token local do Hub não configurado.");

    const text = await this.plugin.app.vault.cachedRead(file);
    const body = {
      source: "obsidian-plugin-grafo-vivo",
      kind: "obsidian.note.snapshot",
      title: file.basename,
      text: text.slice(0, 64 * 1024),
      path: file.path,
      provenance: "Obsidian Grafo Vivo — envio explícito pelo usuário",
      metadata: {
        plugin_version: this.plugin.manifest.version,
        file_mtime: file.stat.mtime,
        file_size: file.stat.size,
      },
    };

    const response = await requestUrl({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      throw: false,
    });

    let receipt: KnowledgeHubReceipt = {};
    try {
      receipt = response.json as KnowledgeHubReceipt;
    } catch {
      receipt = { error: response.text || `HTTP ${response.status}` };
    }

    if (response.status < 200 || response.status >= 300) {
      throw new Error(receipt.error || `Hub respondeu HTTP ${response.status}.`);
    }

    return receipt;
  }
}
