import { Router } from 'express';
import { success, fail } from '../utils/response.js';

const router = Router();

/**
 * Parse LRC format "[mm:ss.xx] line text" into [{ time, text }]
 */
function parseLrc(lrcText) {
  if (!lrcText) return [];
  const rows = [];
  const regex = /\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]\s*(.*)/;

  for (const rawLine of lrcText.split('\n')) {
    const m = rawLine.trim().match(regex);
    if (m) {
      const mins = parseInt(m[1], 10);
      const secs = parseFloat(m[2]);
      const text = m[3].trim();
      if (text) {
        rows.push({ time: Number((mins * 60 + secs).toFixed(2)), text });
      }
    }
  }
  return rows;
}

/**
 * Clean YouTube-style titles like "Song Name (Official Video) ft. Artist"
 */
function cleanQuery(raw) {
  return (raw || '')
    .replace(/\(official.*?\)|\[official.*?\]|\(lyrics.*?\)|\[lyrics.*?\]|\(audio.*?\)|\[audio.*?\]|\(hd\)|\(4k\)|official\s*(music\s*)?video|lyric\s*video|slowed|reverb|cover|unplugged|full\s*song/gi, '')
    .replace(/\|.*$/, '')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreCandidate(item, targetWords, targetDuration) {
  const hay = `${item.trackName || ''} ${item.artistName || ''}`.toLowerCase();
  let score = 0;
  for (const w of targetWords) {
    if (w.length >= 2 && hay.includes(w)) score += 10;
  }
  if (item.syncedLyrics) score += 8;
  if (targetDuration > 0 && item.duration > 0) {
    const diff = Math.abs(item.duration - targetDuration);
    if (diff <= 5) score += 15;
    else if (diff <= 15) score += 8;
    else if (diff > 45) score -= 12;
  }
  return score;
}

async function queryLrclib(q) {
  if (!q) return [];
  const res = await fetch(
    `https://lrclib.net/api/search?q=${encodeURIComponent(q)}`,
    { headers: { 'User-Agent': 'NitChat-LyricsType/1.0' } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// GET /api/lyrics?q=...&title=...&artist=...&fallbackQ=...&duration=...
router.get('/', async (req, res, next) => {
  try {
    const rawQ = (req.query.q || '').toString().trim();
    const fallbackQ = cleanQuery((req.query.fallbackQ || '').toString());
    const title = cleanQuery((req.query.title || '').toString());
    const artist = cleanQuery((req.query.artist || '').toString());
    const targetDuration = parseInt(req.query.duration || '0', 10) || 0;
    const searchQ = cleanQuery(rawQ || `${title} ${artist}`);

    if (!searchQ && !fallbackQ) return fail(res, 'Search query or title is required');

    // 1. Primary: lrclib.net (try cleaned YouTube title, then user's original search query)
    try {
      let items = await queryLrclib(searchQ);
      if (items.length === 0 && fallbackQ && fallbackQ !== searchQ) {
        items = await queryLrclib(fallbackQ);
      }
      // Also try removing first word if it was "Artist Song" or taking last 2 words
      if (items.length === 0 && searchQ.split(' ').length > 2) {
        items = await queryLrclib(searchQ.split(' ').slice(-2).join(' '));
      }

      if (items.length > 0) {
        const targetWords = `${searchQ} ${fallbackQ}`.toLowerCase().split(/\s+/).filter(Boolean);
        const sorted = [...items]
          .filter((i) => i.syncedLyrics || i.plainLyrics)
          .sort((a, b) => scoreCandidate(b, targetWords, targetDuration) - scoreCandidate(a, targetWords, targetDuration));

        const best = sorted[0];
        if (best) {
          const synced = parseLrc(best.syncedLyrics);
          const plainLines = (best.plainLyrics || '')
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);

          const lines = synced.length > 0 ? synced.map((s) => s.text) : plainLines;

          if (lines.length > 0) {
            return success(res, {
              source: 'lrclib',
              trackName: best.trackName || title,
              artistName: best.artistName || artist,
              hasSynced: synced.length > 0,
              synced,
              lines,
            });
          }
        }
      }
    } catch (e) {
      console.warn('[Lyrics] lrclib lookup failed:', e.message);
    }

    // 2. Fallback: api.lyrics.ovh
    if (artist && title) {
      try {
        const ovhRes = await fetch(
          `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
        );
        if (ovhRes.ok) {
          const ovhData = await ovhRes.json();
          const lines = (ovhData.lyrics || '')
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
          if (lines.length > 0) {
            return success(res, {
              source: 'lyrics.ovh',
              trackName: title,
              artistName: artist,
              hasSynced: false,
              synced: [],
              lines,
            });
          }
        }
      } catch (e) {
        console.warn('[Lyrics] lyrics.ovh lookup failed:', e.message);
      }
    }

    return success(res, {
      source: 'none',
      trackName: title || searchQ,
      artistName: artist,
      hasSynced: false,
      synced: [],
      lines: [],
    });
  } catch (err) {
    next(err);
  }
});

export default router;

