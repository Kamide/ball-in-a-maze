/// <reference types="vitest/config" />

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
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  build: {
    rolldownOptions: {
      output: {
        hashCharacters: "base36",
      },
    },
  },
});
