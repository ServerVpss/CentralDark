// @owner: source_remote_bridge/ui/src/main.jsx; @responsabilidade: ponto de entrada React; renderizar somente a UI do mesmo Bridge; @pode: preservar UI atual; @nao_pode: criar executor, expor credenciais, ampliar acesso; @criterio: build e readback.
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
