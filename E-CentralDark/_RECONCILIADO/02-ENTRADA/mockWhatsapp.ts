// Dados de demonstração usados SOMENTE quando a WuzAPI recusa contatos/grupos
// (warning + upstreamStatus 401/403) e a API devolve listas vazias.
// Nada disso vai pra rede — é puro frontend pra manter o painel utilizável
// enquanto o upstream não libera. Tudo marcado com `demo: true` e prefixo
// "[DEMO]" pra ninguém confundir com dado real.

export type MockChatDemo = {
  key: string;
  jid: string;
  name: string;
  type: "contact" | "group";
  demo: true;
};

export const MOCK_CONTACTS: MockChatDemo[] = [
  { key: "demo-c1", jid: "5511*****01@s.whatsapp.net", name: "[DEMO] Ana Lima",       type: "contact", demo: true },
  { key: "demo-c2", jid: "5511*****02@s.whatsapp.net", name: "[DEMO] Bruno Costa",    type: "contact", demo: true },
  { key: "demo-c3", jid: "5511*****03@s.whatsapp.net", name: "[DEMO] Carla Souza",    type: "contact", demo: true },
  { key: "demo-c4", jid: "5511*****04@s.whatsapp.net", name: "[DEMO] Diego Martins",  type: "contact", demo: true },
  { key: "demo-c5", jid: "5511*****05@s.whatsapp.net", name: "[DEMO] Eduarda Pires",  type: "contact", demo: true },
  { key: "demo-c6", jid: "5511*****06@s.whatsapp.net", name: "[DEMO] Felipe Rocha",   type: "contact", demo: true },
];

export const MOCK_GROUPS: MockChatDemo[] = [
  { key: "demo-g1", jid: "1203630000000001@g.us", name: "[DEMO] Equipe Suporte",   type: "group", demo: true },
  { key: "demo-g2", jid: "1203630000000002@g.us", name: "[DEMO] Vendas BR",        type: "group", demo: true },
  { key: "demo-g3", jid: "1203630000000003@g.us", name: "[DEMO] Família",          type: "group", demo: true },
];

export const MOCK_TOTAL_CONTACTS = 42;  // número simbólico só pra preencher contador
export const MOCK_TOTAL_GROUPS   = 7;
