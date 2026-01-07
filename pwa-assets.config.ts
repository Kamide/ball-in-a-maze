import {
  defineConfig,
  minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  preset: {
    ...preset,
    png: {
      compressionLevel: 9,
      effort: 10,
      palette: false,
    },
    maskable: {
      ...preset.maskable,
      resizeOptions: {
        ...preset.maskable.resizeOptions,
        background: "#ede6e7",
      },
    },
    apple: {
      ...preset.apple,
      resizeOptions: {
        ...preset.apple.resizeOptions,
        background: "#ede6e7",
      },
    },
  },
  images: ["./public/logo.svg"],
});
