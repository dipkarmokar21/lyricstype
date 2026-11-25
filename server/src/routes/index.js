import { Router } from 'express';
import healthRouter from './health.js';
import tracksRouter from './tracks.js';
import scoresRouter from './scores.js';
import youtubeRouter from './youtube.js';
import lyricsRouter from './lyrics.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/tracks', tracksRouter);
router.use('/scores', scoresRouter);
router.use('/youtube', youtubeRouter);
router.use('/lyrics', lyricsRouter);

export default router;
