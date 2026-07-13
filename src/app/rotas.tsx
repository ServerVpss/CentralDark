// Ponto único das rotas do app.
// Hoje App.tsx ainda declara <Routes> inline por conta do modo
// (full/web/portal) e das guardas de admin. Este arquivo existe
// como âncora oficial para extrair as rotas em uma próxima etapa
// sem impacto visual imediato.
export { default as App } from "./App";
