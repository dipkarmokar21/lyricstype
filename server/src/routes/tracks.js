import { Router } from 'express';
import { getAllTracks, getTrackById, createTrack } from '../services/trackService.js';
import { success, created, fail } from '../utils/response.js';

const router = Router();

// GET /api/tracks
router.get('/', async (req, res, next) => {
  try {
    const tracks = await getAllTracks(req.query.tag);
    success(res, tracks);
  } catch (err) {
    next(err);
  }
});

// GET /api/tracks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const track = await getTrackById(req.params.id);
    if (!track) return fail(res, 'Track not found', 404);
    success(res, track);
  } catch (err) {
    next(err);
  }
});

// POST /api/tracks
router.post('/', async (req, res, next) => {
  try {
    const { title, artist, tag, youtube_id, lines } = req.body;
    if (!title || !lines || !lines.length) {
      return fail(res, 'Title and lines are required');
    }
    const track = await createTrack({ title, artist, tag, youtube_id, lines });
    created(res, track);
  } catch (err) {
    next(err);
  }
});

export default router;

