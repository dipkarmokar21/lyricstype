// ═══════════════════════════════════════════════════════════════
// Helper utilities
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate WPM from chars typed and start time
 */
export function calcWpm(charsTyped, startTime) {
  if (!startTime) return 0;
  const mins = Math.max((Date.now() - startTime) / 60000, 1 / 60);
  return Math.round((charsTyped / 5) / mins);
}

/**
 * Format seconds to mm:ss
 */
export function formatTime(totalSeconds) {
  const mm = Math.floor(totalSeconds / 60);
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Extract YouTube video ID from URL or raw ID
 */
export function extractYoutubeId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|\/v\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : '';
}

/**
 * Escape HTML entities
 */
export function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

/**
 * Generate a room code like NIT-4K8X
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NIT-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/**
 * clsx-lite: merge class names
 */
export function cn(...args) {
  return args.filter(Boolean).join(' ');
}

