import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/users": "http://localhost:4000",
      '/incomes': 'http://localhost:4000',
      '/payments': 'http://localhost:4000',
      '/debts': 'http://localhost:4000'
    },
  },
});