// ═══════════════════════════════════════════════════════════════
// Zustand Game Store — Single source of truth for the app
// ═══════════════════════════════════════════════════════════════
import { create } from 'zustand';
import { TRACKS } from '@/utils/constants';
import { romanizeLine, hasNonAscii } from '@/utils/romanize';

const generateClientId = () => 'u_' + Math.random().toString(36).slice(2, 9);

const useGameStore = create((set, get) => ({
  // ── Identity ──────────────────────────────────────────────
  clientId: generateClientId(),
  handle: localStorage.getItem('nitchat_handle') || 'anon_' + Math.floor(100 + Math.random() * 899),
  avatarIdx: 0,
  personalBest: Number(localStorage.getItem('nitchat_pb') || 0),

  // ── Mode & Config ─────────────────────────────────────────
  mode: 'solo',           // 'solo' | 'friend' | 'stranger'
  tier: 'balanced',       // 'chill' | 'balanced' | 'pro'
  soundOn: true,
  romanizeEnabled: true,  // Banglish / Hinglish / Romaji phonetic typing
  syncMode: 'unsynced',   // 'unsynced' | 'synced'
  selectedTrackId: TRACKS[0]?.id || null,

  // ── Room / Multiplayer ────────────────────────────────────
  roomCode: null,
  roomPassword: null,
  roomSongLocked: false,
  isHost: false,
  isSimulatedOpponent: false,
  opponent: null,
  meRevealed: false,

  // ── View State ────────────────────────────────────────────
  currentView: 'lobby',   // 'lobby' | 'waiting' | 'arena' | 'result'
  customModalOpen: false,

  // ── Typing Engine ─────────────────────────────────────────
  raceActive: false,
  lines: [],
  syncedTimestamps: [],   // optional [seconds, ...] matching lines
  totalChars: 0,
  lineIdx: 0,
  charIdx: 0,
  globalTypedChars: 0,
  correctKeystrokes: 0,
  totalKeystrokes: 0,
  combo: 0,
  maxCombo: 0,
  score: 0,
  startTime: null,
  countdownNum: null,

  // ── Tracks Data ───────────────────────────────────────────
  tracks: [...TRACKS],

  // ── Toast ─────────────────────────────────────────────────
  toastMessage: null,
  toastVisible: false,

  // ── Chat Messages ─────────────────────────────────────────
  chatMessages: [],

  // ═══════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════

  setMode: (mode) => set({ mode }),
  setTier: (tier) => set({ tier }),
  setAvatar: (idx) => set({ avatarIdx: idx }),
  setSelectedTrack: (id) => {
    const track = get().tracks.find((t) => t.id === id);
    const nonAscii = (track?.lines || []).some((l) => hasNonAscii(l));
    set({ selectedTrackId: id, romanizeEnabled: nonAscii });
  },
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setRomanizeEnabled: (val) => set({ romanizeEnabled: val }),
  setSyncMode: (syncMode) => set({ syncMode }),
  setView: (view) => set({ currentView: view }),
  setCustomModalOpen: (open) => set({ customModalOpen: open }),

  setHandle: (handle) => {
    localStorage.setItem('nitchat_handle', handle);
    set({ handle });
  },

  showToast: (message) => {
    set({ toastMessage: message, toastVisible: true });
    setTimeout(() => set({ toastVisible: false }), 2600);
  },

  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),

  getSelectedTrack: () => {
    const { tracks, selectedTrackId } = get();
    return tracks.find((t) => t.id === selectedTrackId) || tracks[0];
  },

  // ── Race Setup ────────────────────────────────────────────
  prepareRace: () => {
    const { getSelectedTrack, romanizeEnabled } = get();
    const track = getSelectedTrack();
    if (!track) return;

    const rawLines = track.lines || [];
    const rawSynced = track.synced || [];
    const lines = [];
    const syncedTimestamps = [];

    for (let i = 0; i < rawLines.length; i++) {
      const raw = rawLines[i];
      const text = romanizeEnabled && hasNonAscii(raw) ? romanizeLine(raw) : raw;
      if (text && text.trim()) {
        lines.push(text.trim());
        if (rawSynced[i] !== undefined) {
          syncedTimestamps.push(rawSynced[i].time);
        }
      }
    }

    const totalChars = lines.reduce((sum, l) => sum + l.length, 0);

    set({
      lines,
      syncedTimestamps,
      totalChars,
      lineIdx: 0,
      charIdx: 0,
      globalTypedChars: 0,
      correctKeystrokes: 0,
      totalKeystrokes: 0,
      combo: 0,
      maxCombo: 0,
      score: 0,
      startTime: null,
      raceActive: false,
      countdownNum: null,
    });
  },

  startRace: () => set({ raceActive: true, startTime: Date.now(), countdownNum: null }),

  endRace: () => set({ raceActive: false }),

  setCountdown: (num) => set({ countdownNum: num }),

  jumpToLine: (newLineIdx) => {
    const s = get();
    if (newLineIdx < 0 || newLineIdx >= s.lines.length || newLineIdx === s.lineIdx) return;
    const offset = s.lines.slice(0, newLineIdx).reduce((sum, l) => sum + l.length, 0);
    set({
      lineIdx: newLineIdx,
      charIdx: 0,
      globalTypedChars: offset,
    });
  },

  advanceChar: () => {
    const s = get();
    const currentLine = s.lines[s.lineIdx];
    if (!currentLine) return false;

    const newCharIdx = s.charIdx + 1;
    const newGlobal = s.globalTypedChars + 1;
    const newCombo = s.combo + 1;
    const newMaxCombo = Math.max(newCombo, s.maxCombo);
    const newScore = s.score + 10 + Math.min(20, Math.floor(newCombo / 5) * 2);

    if (newCharIdx >= currentLine.length) {
      const newLineIdx = s.lineIdx + 1;
      if (newLineIdx >= s.lines.length) {
        set({
          charIdx: newCharIdx,
          globalTypedChars: newGlobal,
          correctKeystrokes: s.correctKeystrokes + 1,
          combo: newCombo,
          maxCombo: newMaxCombo,
          score: newScore,
          raceActive: false,
        });
        return 'finished';
      }
      set({
        lineIdx: newLineIdx,
        charIdx: 0,
        globalTypedChars: newGlobal,
        correctKeystrokes: s.correctKeystrokes + 1,
        combo: newCombo,
        maxCombo: newMaxCombo,
        score: newScore,
      });
      return 'newline';
    }

    set({
      charIdx: newCharIdx,
      globalTypedChars: newGlobal,
      correctKeystrokes: s.correctKeystrokes + 1,
      combo: newCombo,
      maxCombo: newMaxCombo,
      score: newScore,
    });
    return 'char';
  },

  handleBackspace: () => {
    const s = get();
    if (s.charIdx > 0) {
      set({
        charIdx: s.charIdx - 1,
        globalTypedChars: Math.max(0, s.globalTypedChars - 1),
      });
    }
  },

  handleMistake: () => {
    set((s) => ({
      combo: 0,
      totalKeystrokes: s.totalKeystrokes + 1,
    }));
  },

  incrementKeystrokes: () => {
    set((s) => ({ totalKeystrokes: s.totalKeystrokes + 1 }));
  },

  updatePersonalBest: (wpm) => {
    const s = get();
    if (wpm > s.personalBest) {
      localStorage.setItem('nitchat_pb', String(wpm));
      set({ personalBest: wpm });
    }
  },

  setOpponent: (opp) => set({ opponent: opp }),

  updateOpponentProgress: (progress) => {
    set((s) => ({
      opponent: s.opponent ? { ...s.opponent, ...progress } : null,
    }));
  },

  setRoom: ({ code, password = null, isHost, songLocked = false }) =>
    set({ roomCode: code, roomPassword: password, isHost, roomSongLocked: songLocked }),
  setRoomSongLocked: (songLocked) => set({ roomSongLocked: songLocked }),
  clearRoom: () =>
    set({ roomCode: null, roomPassword: null, roomSongLocked: false, isHost: false, opponent: null, isSimulatedOpponent: false }),

  addTrack: (track) => {
    const nonAscii = (track?.lines || []).some((l) => hasNonAscii(l));
    set((s) => {
      const filtered = s.tracks.filter((t) => t.id !== track.id);
      return {
        tracks: [track, ...filtered],
        selectedTrackId: track.id,
        romanizeEnabled: nonAscii,
      };
    });
  },

  resetToLobby: () => {
    set({
      currentView: 'lobby',
      raceActive: false,
      roomCode: null,
      roomPassword: null,
      roomSongLocked: false,
      isHost: false,
      opponent: null,
      isSimulatedOpponent: false,
      meRevealed: false,
      chatMessages: [],
      countdownNum: null,
    });
  },
}));

export default useGameStore;
