import express from 'express';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import registerRaceHandlers from './sockets/raceHandler.js';

// ── Express App ──────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ── Socket.IO ────────────────────────────────────────────────
const io = new SocketIO(httpServer, {
  cors: {
    origin: env.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ── Middleware ────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(morgan(env.isDev ? 'dev' : 'combined'));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── Error Handling ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── WebSocket Handlers ───────────────────────────────────────
registerRaceHandlers(io);

// ── Start Server ─────────────────────────────────────────────
httpServer.listen(env.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║  🎵 LyricsType API                           ║
  ║  → HTTP:  http://localhost:${env.port}             ║
  ║  → WS:    ws://localhost:${env.port}               ║
  ║  → Env:   ${env.nodeEnv.padEnd(33)}║
  ╚═══════════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };

