import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api-proxy': {
        target: 'https://scs.advertsedge.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
      },
    },
  },
  resolve: {
    dedupe: ["react", "react-dom", "react-redux"], // 👈 add react-redux too
  },
});