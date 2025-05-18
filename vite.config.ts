import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(async () => ({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [(await import("@replit/vite-plugin-cartographer")).cartographer()]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: './client',
  build: {
  outDir: '../dist/client',
  emptyOutDir: true,
  rollupOptions: {
    output: {
      manualChunks: {
        react: ['react', 'react-dom'],
        vendor: [
          '@radix-ui/react-accordion',
          '@radix-ui/react-alert-dialog',
          '@radix-ui/react-aspect-ratio',
          '@radix-ui/react-avatar',
          '@radix-ui/react-checkbox',
          '@radix-ui/react-collapsible',
          '@radix-ui/react-context-menu',
          '@radix-ui/react-dialog',
          '@radix-ui/react-dropdown-menu',
          '@radix-ui/react-hover-card',
          '@radix-ui/react-label',
          '@radix-ui/react-menubar',
          '@radix-ui/react-navigation-menu',
          '@radix-ui/react-popover',
          '@radix-ui/react-progress',
          '@radix-ui/react-radio-group',
          '@radix-ui/react-scroll-area',
          '@radix-ui/react-select',
          '@radix-ui/react-separator',
          '@radix-ui/react-slider',
          '@radix-ui/react-slot',
          '@radix-ui/react-switch',
          '@radix-ui/react-tabs',
          '@radix-ui/react-toast',
          '@radix-ui/react-toggle',
          '@radix-ui/react-toggle-group',
          '@radix-ui/react-tooltip',
          'lucide-react'
        ],
        state: ['@tanstack/react-query', 'zod']
      }
    }
  },
  chunkSizeWarningLimit: 1000
},
  base: '/',
}));
