// Composição raiz do app: provedores globais + rotas.
// Cada peça vive num arquivo separado (provedores.tsx, rotas.tsx, configuracao.ts).
import { ProvedoresApp } from "./provedores";
import { RotasApp } from "./rotas";

const App = () => (
  <ProvedoresApp>
    <RotasApp />
  </ProvedoresApp>
);

export default App;
