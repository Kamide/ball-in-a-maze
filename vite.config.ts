import tailwindcss from "@tailwindcss/vite";
import ssl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
    ssl(),
  ],
  build: {
    rolldownOptions: {
      output: {
        hashCharacters: "base36",
      },
    },
  },
});
