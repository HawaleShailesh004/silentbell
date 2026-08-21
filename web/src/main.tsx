import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./nimbus.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
