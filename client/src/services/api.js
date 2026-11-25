// ═══════════════════════════════════════════════════════════════
// API Service — talks to the Express backend
// ═══════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    throw new Error('Backend server unreachable on port 4000. Run "npm run dev" inside server/.');
  }
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data.data;
}

export const api = {
  // ── YouTube & Free Lyrics ───────────────────────────
  searchYoutube: (q) => request(`/youtube/search?q=${encodeURIComponent(q)}`),
  fetchLyrics: ({ q = '', title = '', artist = '', fallbackQ = '', duration = 0 }) =>
    request(
      `/lyrics?q=${encodeURIComponent(q)}&title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&fallbackQ=${encodeURIComponent(fallbackQ)}&duration=${duration}`
    ),

  // ── Tracks ──────────────────────────────────────────
  getTracks: (tag) => request(`/tracks${tag ? `?tag=${tag}` : ''}`),
  getTrack: (id) => request(`/tracks/${id}`),
  createTrack: (body) => request('/tracks', { method: 'POST', body: JSON.stringify(body) }),

  // ── Scores ──────────────────────────────────────────
  saveScore: (body) => request('/scores', { method: 'POST', body: JSON.stringify(body) }),
  getLeaderboard: (trackId, limit = 20) =>
    request(`/scores/leaderboard?${trackId ? `track_id=${trackId}&` : ''}limit=${limit}`),
  getPersonalBest: (name) => request(`/scores/personal-best/${name}`),

  // ── Health ──────────────────────────────────────────
  health: () => request('/health'),
};

export default api;
