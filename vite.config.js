import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],   // 👈 IMPORTANT FIX
  },
  server: {
    allowedHosts: ["internecine-unvigorous-cortez.ngrok-free.dev"],
  },
});