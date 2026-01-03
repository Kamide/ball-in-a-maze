import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Game } from "./game/main";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Game />
  </StrictMode>,
);
