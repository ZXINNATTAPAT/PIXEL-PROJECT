# Pixel Office (MVP)

A cute top-down pixel-art office that shows each AI agent at a desk, grouped by team room, with a status bubble.

- Stack: Vite + React + TypeScript + PixiJS v8
- All art is drawn procedurally with Pixi `Graphics` (no external/copyrighted assets)
- Data: `src/data/agents.json` — **sample data only**, edit it to change statuses/tasks
- Statuses: `idle` (grey, wanders), `working` (green, typing), `waiting` (amber, needs decision), `done` (blue), `blocked` (red)
- Tap a character (or a row in the side panel) to highlight it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

No backend, no secrets, read-only view (no agent commands).
