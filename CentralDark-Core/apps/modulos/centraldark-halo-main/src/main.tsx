import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { recordDiagnostic } from "./agentDiagnostics";

// Classify unexpected errors without logging message, stack, URL or event detail.
window.addEventListener("error", () => { void recordDiagnostic("frontend", "error", "JS_UNCAUGHT_ERROR"); });
window.addEventListener("unhandledrejection", () => { void recordDiagnostic("frontend", "error", "JS_UNHANDLED_REJECTION"); });
ReactDOM.createRoot(document.getElementById("root") as HTMLElement, {
  onUncaughtError: () => { void recordDiagnostic("frontend", "error", "REACT_RENDER_ERROR"); },
  onCaughtError: () => { void recordDiagnostic("frontend", "error", "REACT_RENDER_ERROR"); },
  onRecoverableError: () => { void recordDiagnostic("frontend", "error", "REACT_RECOVERABLE_ERROR"); },
}).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
