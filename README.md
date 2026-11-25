# 🎵 NitChat Type (`nitchat.com/type`)

A full-stack **real-time lyrics typing race** web app built with **Vite + React**, **Node.js + Express + Socket.IO**, and **Supabase**. Designed to bring music lovers together and funnel them into anonymous or friend chats on **NitChat**.

---

## ✨ Features

- **YouTube Song Search & Auto Lyrics** — Search any song directly from YouTube (`yt-search`, no API key required) and automatically fetch synced/plain lyrics via `lrclib.net` and `lyrics.ovh`.
- **Smart Phonetic Romanizer (Banglish / Hinglish / Romaji / Hangul)** — Automatically detects non-English scripts (Bengali, Hindi, Korean, Japanese, Arabic, Cyrillic) and converts them into natural English-keyboard phonetics, while keeping English songs untouched.
- **3 Game Modes**
  - **Solo Chill:** Practice at your own pace with Synced or Unsynced lyrics.
  - **Chill with Friend (1v1 Private Room):** Auto-generated Room ID, 4-digit Password, and direct invite link. Host controls **Song Lock**, **Synced/Unsynced**, and **Romanize** settings for both players, with continuous host-to-guest playback sync.
  - **Match a Stranger (1v1 Anonymous):** Radar matchmaking + VS screen + post-match **NitChat** anonymous chat funnel.
- **Real-Time Typing Engine** — Character-anchored floating `+10` / golden combo points, red `MISS` feedback, mechanical Web Audio API SFX, and auto-finish when the YouTube track ends.

---

## 🗂 Project Structure

```text
lyricstype/
├── client/                 # Vite + React frontend (base: /type/)
│   ├── src/
│   │   ├── components/
│   │   │   ├── arena/      # ArenaPage, YouTubePlayer
│   │   │   ├── layout/     # Layout, Topbar
│   │   │   ├── lobby/      # HomePage, SongSearchBar, TrackPicker, FriendPanel, MatchmakingModal
│   │   │   ├── result/     # ResultPage + NitChat funnel
│   │   │   └── ui/         # CustomTrackModal, Toast
│   │   ├── services/       # REST API & Socket.IO clients
│   │   ├── stores/         # Zustand gameStore
│   │   ├── styles/         # Global CSS tokens
│   │   └── utils/          # Banglish/Hinglish romanizer, sound SFX, helpers
│   └── vite.config.js
├── server/                 # Node.js + Express + Socket.IO backend
│   ├── src/
│   │   ├── config/         # env & Supabase client
│   │   ├── middleware/     # Error & 404 handlers
│   │   ├── routes/         # /api/youtube, /api/lyrics, /api/tracks, /api/scores, /api/health
│   │   ├── services/       # roomService, trackService, scoreService
│   │   └── sockets/        # Socket.IO race & media sync handler
├── supabase/
│   └── schema.sql          # PostgreSQL tables, indexes & RLS policies
├── netlify.toml            # Netlify SPA config for nitchat.com/type/*
└── render.yaml             # Render backend deployment blueprint
```

---

## 🚀 Local Development

### 1. Install Dependencies
```bash
# Root (optional, for running both together)
npm install

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Environment Variables
Copy the example files and fill in your credentials:
- `server/.env.example` → `server/.env` (`PORT`, `CLIENT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`)
- `client/.env.example` → `client/.env` (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

### 3. Run Locally
```bash
# Terminal 1 (Backend on :4000)
cd server && npm run dev

# Terminal 2 (Frontend on :5173)
cd client && npm run dev
```
Open **`http://localhost:5173/type/`** in your browser.

---

## 🌐 Deployment

- **Database (Supabase):** Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
- **Backend (Render):** Uses [`render.yaml`](render.yaml) (`rootDir: server`, `npm install`, `npm start`, health check `/api/health`).
- **Frontend (Netlify):** Uses [`netlify.toml`](netlify.toml) (`base: client`, `npm run build`, publish `dist`, SPA rewrites for `/type/*`).
