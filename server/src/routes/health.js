import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'lyricstype-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;

