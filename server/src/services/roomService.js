/**
 * In-memory room management for real-time multiplayer (with Room ID + Password)
 */

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NIT-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function generatePassword() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function createRoom(hostId, hostData, track = null, songLocked = false, syncMode = 'unsynced', romanizeEnabled = false) {
  const code = generateRoomCode();
  const password = generatePassword();
  const room = {
    code,
    password,
    hostId,
    players: new Map([[hostId, { ...hostData, ready: true, progress: 0, wpm: 0, finished: false }]]),
    track,
    songLocked: Boolean(songLocked),
    syncMode: syncMode === 'synced' ? 'synced' : 'unsynced',
    romanizeEnabled: Boolean(romanizeEnabled),
    state: 'waiting', // waiting | countdown | racing | finished
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code) {
  return rooms.get(code?.toUpperCase()) || null;
}

export function joinRoom(code, password, playerId, playerData) {
  const room = getRoom(code);
  if (!room) return { error: 'Room not found' };
  if (room.password && String(password || '').trim() !== room.password) {
    return { error: 'Incorrect room password' };
  }
  if (room.players.size >= 2) return { error: 'Room is full' };
  if (room.state !== 'waiting') return { error: 'Race already started' };

  room.players.set(playerId, { ...playerData, ready: true, progress: 0, wpm: 0, finished: false });
  return { room };
}

export function leaveRoom(code, playerId) {
  const room = getRoom(code);
  if (!room) return;
  room.players.delete(playerId);
  if (room.players.size === 0) {
    rooms.delete(code);
  } else if (room.hostId === playerId) {
    room.hostId = room.players.keys().next().value;
  }
}

export function updatePlayerProgress(code, playerId, progress) {
  const room = getRoom(code);
  if (!room) return;
  const player = room.players.get(playerId);
  if (player) Object.assign(player, progress);
}

export function deleteRoom(code) {
  rooms.delete(code);
}

export function getActiveRoomCount() {
  return rooms.size;
}
