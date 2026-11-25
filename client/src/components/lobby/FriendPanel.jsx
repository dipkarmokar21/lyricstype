// ═══════════════════════════════════════════════════════════════
// FriendPanel — Private Room (Auto Room ID + Password + Share Link)
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useGameStore from '@/stores/gameStore';
import { connectSocket } from '@/services/socket';
import { AVATARS } from '@/utils/constants';
import './FriendPanel.css';

export default function FriendPanel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const store = useGameStore();
  const {
    handle, avatarIdx, roomCode, roomPassword, roomSongLocked, syncMode, romanizeEnabled, isHost, opponent,
    getSelectedTrack, setRoom, setRoomSongLocked, setSyncMode, setRomanizeEnabled, clearRoom, setOpponent, addTrack, prepareRace, showToast,
  } = store;

  const [joinCode, setJoinCode] = useState(searchParams.get('room') || '');
  const [joinPass, setJoinPass] = useState(searchParams.get('pass') || '');
  const [lockOnCreate, setLockOnCreate] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Listen for Socket.IO room events
  useEffect(() => {
    const socket = connectSocket();

    const onPlayerJoined = ({ playerId, playerData }) => {
      setOpponent({
        id: playerId,
        name: playerData?.name || 'Friend',
        avatarIdx: playerData?.avatarIdx ?? 1,
        charIndex: 0,
        wpm: 0,
        finished: false,
      });
      showToast(`${playerData?.name || 'Friend'} joined the room!`);
    };

    const onTrackUpdated = ({ track }) => {
      if (track) addTrack(track);
    };

    const onLockUpdated = ({ songLocked }) => {
      setRoomSongLocked(Boolean(songLocked));
    };

    const onSettingsUpdated = ({ syncMode: sMode, romanizeEnabled: rom }) => {
      if (sMode) setSyncMode(sMode);
      if (typeof rom === 'boolean') setRomanizeEnabled(rom);
    };

    const onRaceGo = ({ track, songLocked, syncMode: sMode, romanizeEnabled: rom }) => {
      if (track) addTrack(track);
      if (typeof songLocked === 'boolean') setRoomSongLocked(songLocked);
      if (sMode) setSyncMode(sMode);
      if (typeof rom === 'boolean') setRomanizeEnabled(rom);
      prepareRace();
      navigate('/race');
    };

    const onPlayerLeft = () => {
      setOpponent(null);
      showToast('Friend left the room');
    };

    socket.on('room:player-joined', onPlayerJoined);
    socket.on('room:track-updated', onTrackUpdated);
    socket.on('room:lock-updated', onLockUpdated);
    socket.on('room:settings-updated', onSettingsUpdated);
    socket.on('race:go', onRaceGo);
    socket.on('room:player-left', onPlayerLeft);

    return () => {
      socket.off('room:player-joined', onPlayerJoined);
      socket.off('room:track-updated', onTrackUpdated);
      socket.off('room:lock-updated', onLockUpdated);
      socket.off('room:settings-updated', onSettingsUpdated);
      socket.off('race:go', onRaceGo);
      socket.off('room:player-left', onPlayerLeft);
    };
  }, [navigate]);

  // Auto-join if URL has both ?room=...&pass=...
  useEffect(() => {
    const r = searchParams.get('room');
    const p = searchParams.get('pass');
    if (r && p && !roomCode) {
      handleJoinRoom(r, p);
    }
  }, []);

  const handleCreateRoom = () => {
    setConnecting(true);
    const socket = connectSocket();
    const track = getSelectedTrack();

    socket.emit(
      'room:create',
      { playerData: { name: handle, avatarIdx }, track, songLocked: lockOnCreate, syncMode, romanizeEnabled },
      (res) => {
        setConnecting(false);
        if (res?.code) {
          setRoom({ code: res.code, password: res.password, isHost: true, songLocked: res.songLocked });
          showToast(`Room ${res.code} created!`);
        } else {
          showToast('Could not create room — check server connection');
        }
      }
    );
  };

  const handleJoinRoom = (codeOverride, passOverride) => {
    const c = (codeOverride ?? joinCode).trim().toUpperCase();
    const p = (passOverride ?? joinPass).trim();
    if (!c || !p) {
      showToast('Enter both Room ID and Password');
      return;
    }

    setConnecting(true);
    const socket = connectSocket();
    socket.emit(
      'room:join',
      { code: c, password: p, playerData: { name: handle, avatarIdx } },
      (res) => {
        setConnecting(false);
        if (res?.error) {
          showToast(res.error);
          return;
        }
        const room = res.room;
        if (room.track) addTrack(room.track);
        if (room.syncMode) setSyncMode(room.syncMode);
        if (typeof room.romanizeEnabled === 'boolean') setRomanizeEnabled(room.romanizeEnabled);
        setRoom({ code: room.code, password: p, isHost: false, songLocked: Boolean(room.songLocked) });

        // Find host in players
        const entries = Object.entries(room.players || {});
        const other = entries.find(([id]) => id !== socket.id);
        if (other) {
          const [id, data] = other;
          setOpponent({
            id,
            name: data.name || 'Host',
            avatarIdx: data.avatarIdx ?? 0,
            charIndex: 0,
            wpm: 0,
            finished: false,
          });
        }
        showToast(`Joined room ${room.code}! Waiting for host to start.`);
      }
    );
  };

  const handleStartFriendRace = () => {
    const socket = connectSocket();
    const track = getSelectedTrack();
    socket.emit('race:start', { code: roomCode, track, songLocked: roomSongLocked, syncMode, romanizeEnabled });
  };

  const handleToggleRoomLock = () => {
    const next = !roomSongLocked;
    setRoomSongLocked(next);
    connectSocket().emit('room:set-lock', { code: roomCode, songLocked: next });
  };

  const handleToggleRoomSync = () => {
    if (!isHost) return;
    const next = syncMode === 'synced' ? 'unsynced' : 'synced';
    setSyncMode(next);
    connectSocket().emit('room:set-settings', { code: roomCode, syncMode: next, romanizeEnabled });
  };

  const handleToggleRoomRomanize = () => {
    if (!isHost) return;
    const next = !romanizeEnabled;
    setRomanizeEnabled(next);
    connectSocket().emit('room:set-settings', { code: roomCode, syncMode, romanizeEnabled: next });
  };

  const handleLeaveRoom = () => {
    const socket = connectSocket();
    socket.emit('room:leave');
    clearRoom();
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}?room=${roomCode}&pass=${roomPassword}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    showToast('Copied invite link with Room ID & Password!');
  };

  if (roomCode) {
    return (
      <div className="glass-card friend-room-card">
        <div className="fr-top">
          <div>
            <span className="fr-badge">PRIVATE FRIEND ROOM</span>
            <h3 className="fr-title">
              {isHost ? 'Share Room ID, Password or Link' : `Connected to ${roomCode}`}
            </h3>
          </div>
          <button type="button" className="pill-btn" onClick={handleLeaveRoom}>Leave Room</button>
        </div>

        <div className="fr-creds">
          <div className="fr-cred-box">
            <span className="fr-cred-label">ROOM ID</span>
            <span className="fr-cred-val">{roomCode}</span>
          </div>
          <div className="fr-cred-box">
            <span className="fr-cred-label">PASSWORD</span>
            <span className="fr-cred-val pass">{roomPassword}</span>
          </div>
          <button type="button" className="pill-btn active" onClick={copyInviteLink}>
            Copy Invite Link
          </button>
          {isHost ? (
            <>
              <button
                type="button"
                className={`pill-btn ${roomSongLocked ? 'active' : ''}`}
                onClick={handleToggleRoomLock}
                title="Lock song seeking during match"
              >
                {roomSongLocked ? '🔒 Song Locked' : '🔓 Song Unlocked'}
              </button>
              <button
                type="button"
                className={`pill-btn ${syncMode === 'synced' ? 'active' : ''}`}
                onClick={handleToggleRoomSync}
                title="Host decides Synced vs Unsynced for both players"
              >
                Lyrics: {syncMode === 'synced' ? 'Synced' : 'Unsynced'}
              </button>
              <button
                type="button"
                className={`pill-btn ${romanizeEnabled ? 'active' : ''}`}
                onClick={handleToggleRoomRomanize}
                title="Host decides Romanize ON/OFF for both players"
              >
                Romanize: {romanizeEnabled ? 'ON' : 'OFF'}
              </button>
            </>
          ) : (
            <>
              <span className="pill-btn">{roomSongLocked ? '🔒 Song Locked' : '🔓 Song Unlocked'}</span>
              <span className="pill-btn">Lyrics: {syncMode === 'synced' ? 'Synced' : 'Unsynced'}</span>
              <span className="pill-btn">Romanize: {romanizeEnabled ? 'ON' : 'OFF'}</span>
            </>
          )}
        </div>

        <div className="fr-versus">
          <div className="fr-slot ready">
            <div className="fr-av" dangerouslySetInnerHTML={{ __html: AVATARS[avatarIdx] }} />
            <div className="fr-name">{handle}</div>
            <div className="fr-status ok">{isHost ? 'Host • Ready' : 'Guest • Ready'}</div>
          </div>

          <div className="fr-vs-pill">VS</div>

          <div className={`fr-slot ${opponent ? 'ready' : ''}`}>
            {opponent ? (
              <>
                <div className="fr-av" dangerouslySetInnerHTML={{ __html: AVATARS[opponent.avatarIdx ?? 1] }} />
                <div className="fr-name">{opponent.name}</div>
                <div className="fr-status ok">Connected</div>
              </>
            ) : (
              <>
                <div className="fr-av placeholder">?</div>
                <div className="fr-name muted">Waiting...</div>
                <div className="fr-status">Share ID &amp; Pass</div>
              </>
            )}
          </div>
        </div>

        {isHost ? (
          <button
            type="button"
            className="btn-primary"
            disabled={!opponent}
            onClick={handleStartFriendRace}
          >
            {opponent ? 'Start 1v1 Race Now →' : 'Waiting for Friend to Join...'}
          </button>
        ) : (
          <div className="fr-guest-wait">Waiting for host to start the race...</div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card friend-lobby-card">
      <div className="fl-col">
        <h4>Create Private Room</h4>
        <p>Auto-generates a Room ID, 4-digit Password &amp; direct invite link.</p>
        <label className="fl-lock-toggle">
          <input
            type="checkbox"
            checked={lockOnCreate}
            onChange={(e) => setLockOnCreate(e.target.checked)}
          />
          <span>🔒 Lock Song Seeking during match</span>
        </label>
        <button
          type="button"
          className="btn-primary"
          disabled={connecting}
          onClick={handleCreateRoom}
        >
          {connecting ? 'Creating...' : 'Create Room & Get ID + Pass'}
        </button>
      </div>

      <div className="fl-divider" />

      <div className="fl-col">
        <h4>Join Friend&apos;s Room</h4>
        <div className="fl-join-inputs">
          <input
            className="field"
            placeholder="Room ID (e.g. NIT-4K8X)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          <input
            className="field"
            placeholder="Password (4-digit)"
            maxLength={6}
            value={joinPass}
            onChange={(e) => setJoinPass(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={connecting}
            onClick={() => handleJoinRoom()}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
