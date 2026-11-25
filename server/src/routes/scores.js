import { Router } from 'express';
import { saveScore, getLeaderboard, getPersonalBest } from '../services/scoreService.js';
import { success, created, fail } from '../utils/response.js';

const router = Router();

// POST /api/scores
router.post('/', async (req, res, next) => {
  try {
    const { player_name, track_id, wpm, accuracy, score, combo, mode } = req.body;
    if (!player_name || !track_id) {
      return fail(res, 'player_name and track_id are required');
    }
    const result = await saveScore({ player_name, track_id, wpm, accuracy, score, combo, mode });
    created(res, result);
  } catch (err) {
    next(err);
  }
});

// GET /api/scores/leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { track_id, limit } = req.query;
    const data = await getLeaderboard({ track_id, limit: parseInt(limit) || 20 });
    success(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /api/scores/personal-best/:playerName
router.get('/personal-best/:playerName', async (req, res, next) => {
  try {
    const data = await getPersonalBest(req.params.playerName);
    success(res, data);
  } catch (err) {
    next(err);
  }
});

export default router;

