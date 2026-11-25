import { Router } from 'express';
import yts from 'yt-search';
import { success, fail } from '../utils/response.js';

const router = Router();

// GET /api/youtube/search?q=...
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) return fail(res, 'Query "q" is required');

    const result = await yts(q);
    const videos = (result.videos || []).slice(0, 8).map((v) => ({
      videoId: v.videoId,
      title: v.title,
      artist: v.author?.name || 'YouTube',
      duration: v.timestamp || '',
      seconds: v.seconds || 0,
      thumbnail: v.thumbnail || v.image || '',
      url: v.url,
    }));

    success(res, videos);
  } catch (err) {
    next(err);
  }
});

export default router;

