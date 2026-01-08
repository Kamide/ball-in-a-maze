import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Game } from "./game/main";
import { ScreenWakeLock } from "./game/screen-wake-lock";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Game random={Math.random} />
    <ScreenWakeLock onError={console.error} />
  </StrictMode>,
);
