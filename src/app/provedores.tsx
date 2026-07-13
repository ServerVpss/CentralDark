// Ponto único dos provedores globais do app.
// Hoje App.tsx ainda concentra a árvore JSX de provedores por
// simplicidade histórica. Este arquivo existe como âncora oficial
// para o próximo passo da migração, quando os provedores forem
// desmembrados de App.tsx sem risco de quebra visual.
export { default as App } from "./App";
