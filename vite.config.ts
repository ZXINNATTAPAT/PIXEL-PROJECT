import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { notionAgentsPlugin } from './server/notion-agents.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Server-only env: NOT prefixed with VITE_, so it never reaches the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      notionAgentsPlugin({ token: env.NOTION_TOKEN, databaseId: env.NOTION_DATABASE_ID }),
    ],
    server: { host: 'localhost', port: 5173 },
  }
})
