import {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  updatePlayerProgress,
} from '../services/roomService.js';

/**
 * Socket.IO handler for real-time race multiplayer
 */
export default function registerRaceHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);
    let currentRoom = null;

    // --- CREATE ROOM ---
    socket.on('room:create', ({ playerData, track, songLocked, syncMode, romanizeEnabled }, callback) => {
      const room = createRoom(socket.id, playerData, track, songLocked, syncMode, romanizeEnabled);
      currentRoom = room.code;
      socket.join(room.code);
      callback({
        code: room.code,
        password: room.password,
        track: room.track,
        songLocked: room.songLocked,
        syncMode: room.syncMode,
        romanizeEnabled: room.romanizeEnabled,
      });
      console.log(`[WS] Room created: ${room.code} (pass: ${room.password}, locked: ${room.songLocked}, sync: ${room.syncMode}) by ${socket.id}`);
    });

    // --- JOIN ROOM ---
    socket.on('room:join', ({ code, password, playerData }, callback) => {
      const normalizedCode = (code || '').toUpperCase().trim();
      const result = joinRoom(normalizedCode, password, socket.id, playerData);
      if (result.error) return callback({ error: result.error });

      currentRoom = normalizedCode;
      socket.join(normalizedCode);

      const room = result.room;
      const players = Object.fromEntries(room.players);
      socket.to(normalizedCode).emit('room:player-joined', {
        playerId: socket.id,
        playerData,
        players,
      });

      callback({
        room: {
          code: room.code,
          players,
          hostId: room.hostId,
          track: room.track,
          songLocked: room.songLocked,
          syncMode: room.syncMode,
          romanizeEnabled: room.romanizeEnabled,
        },
      });
      console.log(`[WS] ${socket.id} joined room ${normalizedCode}`);
    });

    // --- UPDATE TRACK IN ROOM (host only) ---
    socket.on('room:set-track', ({ code, track }) => {
      const room = getRoom(code);
      if (!room || room.hostId !== socket.id) return;
      room.track = track;
      socket.to(code).emit('room:track-updated', { track });
    });

    // --- TOGGLE SONG LOCK (host only) ---
    socket.on('room:set-lock', ({ code, songLocked }) => {
      const room = getRoom(code);
      if (!room || room.hostId !== socket.id) return;
      room.songLocked = Boolean(songLocked);
      socket.to(code).emit('room:lock-updated', { songLocked: room.songLocked });
    });

    // --- UPDATE ROOM SETTINGS (syncMode / romanizeEnabled, host only) ---
    socket.on('room:set-settings', ({ code, syncMode, romanizeEnabled }) => {
      const room = getRoom(code);
      if (!room || room.hostId !== socket.id) return;
      if (syncMode) room.syncMode = syncMode === 'synced' ? 'synced' : 'unsynced';
      if (typeof romanizeEnabled === 'boolean') room.romanizeEnabled = romanizeEnabled;
      socket.to(code).emit('room:settings-updated', {
        syncMode: room.syncMode,
        romanizeEnabled: room.romanizeEnabled,
      });
    });

    // --- START RACE (host only) ---
    socket.on('race:start', ({ code, track, songLocked, syncMode, romanizeEnabled }) => {
      const room = getRoom(code);
      if (!room || room.hostId !== socket.id) return;

      room.state = 'racing';
      if (track) room.track = track;
      if (typeof songLocked === 'boolean') room.songLocked = songLocked;
      if (syncMode) room.syncMode = syncMode === 'synced' ? 'synced' : 'unsynced';
      if (typeof romanizeEnabled === 'boolean') room.romanizeEnabled = romanizeEnabled;

      io.to(code).emit('race:go', {
        track: room.track,
        songLocked: room.songLocked,
        syncMode: room.syncMode,
        romanizeEnabled: room.romanizeEnabled,
      });
    });

    // --- MEDIA SYNC (unlocked seek / play / pause) ---
    socket.on('race:media-sync', ({ code, time, isPlaying }) => {
      const room = getRoom(code);
      if (!room || room.songLocked) return;
      socket.to(code).emit('race:media-sync', { time, isPlaying });
    });

    // --- HOST HEARTBEAT SYNC (keeps guest at exact same second even when locked) ---
    socket.on('race:host-heartbeat', ({ code, time, isPlaying }) => {
      const room = getRoom(code);
      if (!room || room.hostId !== socket.id) return;
      socket.to(code).emit('race:media-sync', { time, isPlaying, heartbeat: true });
    });

    // --- PROGRESS UPDATE ---
    socket.on('race:progress', ({ code, charIndex, wpm, finished }) => {
      updatePlayerProgress(code, socket.id, { progress: charIndex, wpm, finished });
      socket.to(code).emit('race:opponent-progress', {
        playerId: socket.id,
        charIndex,
        wpm,
        finished,
      });

      if (finished) {
        const room = getRoom(code);
        if (!room) return;
        const allDone = [...room.players.values()].every((p) => p.finished);
        if (allDone) {
          room.state = 'finished';
          io.to(code).emit('race:finished', {
            players: Object.fromEntries(room.players),
          });
        }
      }
    });

    // --- CHAT MESSAGE ---
    socket.on('chat:message', ({ code, text }) => {
      socket.to(code).emit('chat:message', { senderId: socket.id, text });
    });

    // --- REVEAL IDENTITY ---
    socket.on('chat:reveal', ({ code }) => {
      socket.to(code).emit('chat:reveal', { playerId: socket.id });
    });

    // --- LEAVE ROOM ---
    socket.on('room:leave', () => {
      if (currentRoom) {
        leaveRoom(currentRoom, socket.id);
        socket.to(currentRoom).emit('room:player-left', { playerId: socket.id });
        socket.leave(currentRoom);
        currentRoom = null;
      }
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
      if (currentRoom) {
        leaveRoom(currentRoom, socket.id);
        socket.to(currentRoom).emit('room:player-left', { playerId: socket.id });
      }
      console.log(`[WS] Disconnected: ${socket.id}`);
    });
  });
}
