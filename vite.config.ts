/// <reference types="vitest/config" />

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.svg"],
      manifest: {
        name: "Ball in a Maze",
        short_name: "Ball in a Maze",
        description:
          "A digital version of the classic ball-in-a-maze puzzle. Tilt your device to move the ball using motion controls and navigate the maze to the goal. Easy to pick up, challenging to finish, and available offline as an installable PWA.",
        theme_color: "#ede6e7",
        background_color: "#ede6e7",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        globPatterns: ["**/*.{js,wasm,css,html,png,svg,ico,hdr}"],
      },
    }),
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
        advancedChunks: {
          maxSize: 500000,
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/]react/,
            },
            {
              name: "three-vendor",
              test: /node_modules[\\/]three/,
            },
            {
              name: "react-three-vendor",
              test: /node_modules[\\/]@react-three/,
            },
            {
              name: "vendor",
              test: /node_modules/,
            },
          ],
        },
      },
    },
  },
});
