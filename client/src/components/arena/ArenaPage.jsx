// ═══════════════════════════════════════════════════════════════
// ArenaPage — Live typing race (Synced/Unsynced + Romanize + Socket 1v1)
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '@/stores/gameStore';
import { getSocket } from '@/services/socket';
import { AVATARS } from '@/utils/constants';
import { calcWpm, formatTime } from '@/utils/helpers';
import { playCorrectKey, playErrorKey, playFinishFanfare, playCountdownBeep, playGoBeep } from '@/utils/sound';
import YouTubePlayer from './YouTubePlayer';
import './ArenaPage.css';

export default function ArenaPage() {
  const navigate = useNavigate();
  const store = useGameStore();
  const hiddenInputRef = useRef(null);
  const timerRef = useRef(null);
  const ghostRef = useRef(null);
  const lastEmitRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const [wrongCharIdx, setWrongCharIdx] = useState(null);
  const [floats, setFloats] = useState([]);
  const [remoteMediaSync, setRemoteMediaSync] = useState(null);

  const {
    raceActive, lines, syncedTimestamps, lineIdx, charIdx, globalTypedChars, totalChars,
    correctKeystrokes, totalKeystrokes, combo, score, startTime,
    soundOn, mode, roomCode, roomSongLocked, isHost, romanizeEnabled, syncMode,
    opponent, handle, avatarIdx, getSelectedTrack,
    prepareRace, startRace, endRace, advanceChar, handleBackspace, handleMistake,
    incrementKeystrokes, updatePersonalBest, setCountdown, countdownNum,
    updateOpponentProgress, setRomanizeEnabled, setSyncMode, jumpToLine,
  } = store;

  const track = getSelectedTrack();
  const currentLine = lines[lineIdx] || '';
  const nextLine = lines[lineIdx + 1] || '';

  const wpm = calcWpm(correctKeystrokes, startTime);
  const acc = totalKeystrokes === 0 ? 100 : Math.round((correctKeystrokes / totalKeystrokes) * 100);
  const progress = totalChars ? Math.min(100, (globalTypedChars / totalChars) * 100) : 0;
  const oppProgress = (opponent && totalChars) ? Math.min(100, (opponent.charIndex / totalChars) * 100) : 0;

  useEffect(() => {
    if (!lines.length) {
      prepareRace();
    }
  }, []);

  useEffect(() => {
    if (lines.length && !raceActive && countdownNum === null) {
      runCountdown();
    }
  }, [lines.length]);

  // Listen for real-time friend progress & media sync over Socket.IO
  useEffect(() => {
    if (mode !== 'friend' || !roomCode) return;
    const socket = getSocket();
    const onOppProgress = ({ charIndex, wpm: oppWpm, finished }) => {
      updateOpponentProgress({ charIndex, wpm: oppWpm, finished });
    };
    const onMediaSync = ({ time, isPlaying, heartbeat }) => {
      setRemoteMediaSync({ time, isPlaying, heartbeat: Boolean(heartbeat), seq: Date.now() });
    };
    socket.on('race:opponent-progress', onOppProgress);
    socket.on('race:media-sync', onMediaSync);
    return () => {
      socket.off('race:opponent-progress', onOppProgress);
      socket.off('race:media-sync', onMediaSync);
    };
  }, [mode, roomCode]);

  const handleMediaAction = useCallback(({ time, isPlaying }) => {
    const s = useGameStore.getState();
    if (s.mode !== 'friend' || !s.roomCode || s.roomSongLocked) return;
    getSocket().emit('race:media-sync', { code: s.roomCode, time, isPlaying });
  }, []);

  const handleHostHeartbeat = useCallback(({ time, isPlaying }) => {
    const s = useGameStore.getState();
    if (s.mode !== 'friend' || !s.roomCode || !s.isHost) return;
    getSocket().emit('race:host-heartbeat', { code: s.roomCode, time, isPlaying });
  }, []);

  const emitFriendProgress = (finished = false) => {
    const s = useGameStore.getState();
    if (s.mode !== 'friend' || !s.roomCode) return;
    const now = Date.now();
    if (!finished && now - lastEmitRef.current < 100) return;
    lastEmitRef.current = now;
    getSocket().emit('race:progress', {
      code: s.roomCode,
      charIndex: s.globalTypedChars,
      wpm: calcWpm(s.correctKeystrokes, s.startTime),
      finished,
    });
  };

  const runCountdown = () => {
    let count = 3;
    setCountdown(count);
    if (soundOn) playCountdownBeep();

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        if (soundOn) playCountdownBeep();
      } else {
        setCountdown(0);
        if (soundOn) playGoBeep();
        clearInterval(interval);
        setTimeout(() => {
          startRace();
          startGhost();
          hiddenInputRef.current?.focus();
        }, 300);
      }
    }, 850);
  };

  const startGhost = () => {
    const s0 = useGameStore.getState();
    if (s0.mode !== 'stranger' || !s0.opponent) return;
    const tierWpm = { chill: 38, balanced: 56, pro: 78 }[s0.tier] || 52;
    const baseCharsPerSec = (tierWpm * 5) / 60;

    ghostRef.current = setInterval(() => {
      const s = useGameStore.getState();
      if (!s.raceActive || !s.opponent || s.opponent.finished) {
        clearInterval(ghostRef.current);
        return;
      }
      if (Math.random() < 0.14) return;
      const step = Math.random() < 0.75 ? 1 : 2;
      const newIdx = Math.min(s.totalChars, s.opponent.charIndex + step);
      const finished = newIdx >= s.totalChars;
      updateOpponentProgress({ charIndex: newIdx, wpm: calcWpm(newIdx, s.startTime), finished });
    }, Math.max(85, Math.round(1000 / baseCharsPerSec)));
  };

  useEffect(() => {
    if (raceActive) {
      timerRef.current = setInterval(() => {
        const s = useGameStore.getState();
        if (s.startTime) setElapsed(Math.floor((Date.now() - s.startTime) / 1000));
      }, 250);
    }
    return () => clearInterval(timerRef.current);
  }, [raceActive]);

  // Synced lyrics follower based on YouTube playback seconds
  const handleYtTimeUpdate = useCallback((currentSec) => {
    const s = useGameStore.getState();
    if (s.syncMode !== 'synced' || !s.syncedTimestamps?.length || !s.raceActive) return;

    let targetIdx = 0;
    for (let i = 0; i < s.syncedTimestamps.length; i++) {
      if (currentSec >= s.syncedTimestamps[i]) targetIdx = i;
      else break;
    }
    if (targetIdx !== s.lineIdx) {
      jumpToLine(targetIdx);
    }
  }, []);

  const finishMatch = useCallback((extraCorrect = 0) => {
    const s = useGameStore.getState();
    if (!s.raceActive && s.startTime === null) return;
    endRace();
    emitFriendProgress(true);
    clearInterval(timerRef.current);
    clearInterval(ghostRef.current);
    if (s.soundOn) playFinishFanfare();
    const finalWpm = calcWpm(s.correctKeystrokes + extraCorrect, s.startTime);
    updatePersonalBest(finalWpm);
    setTimeout(() => navigate('/result'), 500);
  }, [navigate]);

  const spawnFloat = (text = '+10', type = 'hit', atLineIdx = 0, atCharIdx = 0) => {
    const id = Date.now() + Math.random();
    setFloats((prev) => [...prev.slice(-10), { id, text, type, lineIdx: atLineIdx, charIdx: atCharIdx }]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id));
    }, 1400);
  };

  const handleKeyDown = useCallback((e) => {
    const s = useGameStore.getState();
    if (!s.raceActive) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' && document.activeElement.id !== 'hiddenTypingInput') return;
    if (tag === 'TEXTAREA') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === ' ' || e.key === 'Backspace' || e.key.length === 1) {
      e.preventDefault?.();
    }

    if (e.key === 'Backspace') {
      setWrongCharIdx(null);
      handleBackspace();
      return;
    }

    if (e.key.length !== 1) return;

    incrementKeystrokes();
    const activeLine = s.lines[s.lineIdx];
    const expected = activeLine?.[s.charIdx];

    if (e.key === expected) {
      setWrongCharIdx(null);
      const pts = 10 + Math.min(20, Math.floor(s.combo / 5) * 2);
      spawnFloat(`+${pts}`, pts > 10 ? 'gold' : 'hit', s.lineIdx, s.charIdx);
      const result = advanceChar();
      if (s.soundOn) playCorrectKey(s.combo);

      if (result === 'finished') {
        finishMatch(1);
      } else {
        emitFriendProgress(false);
      }
    } else {
      setWrongCharIdx(s.charIdx);
      spawnFloat('MISS', 'miss', s.lineIdx, s.charIdx);
      handleMistake();
      if (s.soundOn) playErrorKey();
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleMobileInput = (e) => {
    const val = e.target.value;
    if (val) {
      for (const ch of val) {
        handleKeyDown({ key: ch, preventDefault: () => {} });
      }
      e.target.value = '';
    }
  };

  const handleExit = () => {
    clearInterval(timerRef.current);
    clearInterval(ghostRef.current);
    navigate('/');
  };

  const handleToggleRomanize = () => {
    if (mode !== 'solo') return;
    const next = !romanizeEnabled;
    setRomanizeEnabled(next);
    prepareRace();
    startRace();
  };

  const handleToggleSync = () => {
    if (mode !== 'solo') return;
    setSyncMode(syncMode === 'synced' ? 'unsynced' : 'synced');
  };

  const renderChars = () => {
    const tokens = currentLine.split(/(\s+)/);
    let globalIdx = 0;

    return tokens.map((token, tIdx) => {
      if (!token) return null;
      const isSpace = /^\s+$/.test(token);

      const chars = token.split('').map((ch) => {
        const i = globalIdx++;
        let cls = 'lyric-char untyped';
        if (i < charIdx) cls = 'lyric-char correct';
        else if (i === charIdx) cls = wrongCharIdx === i ? 'lyric-char incorrect caret-player' : 'lyric-char caret-player';

        const charFloats = floats.filter((f) => f.lineIdx === lineIdx && f.charIdx === i);
        const display = ch === ' ' ? '\u00A0' : ch;
        return (
          <span key={i} className={cls}>
            {display}
            {charFloats.map((f) => (
              <span key={f.id} className={`score-float ${f.type}`}>
                {f.text}
              </span>
            ))}
          </span>
        );
      });

      if (isSpace) return <span key={`sp-${tIdx}`}>{chars}</span>;
      return (
        <span key={`w-${tIdx}`} className="lyric-word">
          {chars}
        </span>
      );
    });
  };

  return (
    <div className="arena-page animate-fadeUp">
      <div className="arena-top">
        <div className="arena-top-left">
          <button type="button" className="pill-btn" onClick={handleExit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Lobby
          </button>
          <div>
            <h2 className="arena-track-title">{track?.title}</h2>
            <p className="arena-track-artist">{track?.artist}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`pill-btn ${romanizeEnabled ? 'active' : ''}`}
            disabled={mode !== 'solo'}
            style={mode !== 'solo' ? { opacity: 0.65, cursor: 'not-allowed' } : undefined}
            title={mode !== 'solo' ? 'Locked during 1v1 match' : 'Toggle Banglish / Romanize'}
            onClick={handleToggleRomanize}
          >
            Romanize: {romanizeEnabled ? 'ON' : 'OFF'}
          </button>
          {syncedTimestamps?.length > 0 && (
            <button
              type="button"
              className={`pill-btn ${syncMode === 'synced' ? 'active' : ''}`}
              disabled={mode !== 'solo'}
              style={mode !== 'solo' ? { opacity: 0.65, cursor: 'not-allowed' } : undefined}
              title={mode !== 'solo' ? 'Locked during 1v1 match' : 'Toggle Synced / Unsynced'}
              onClick={handleToggleSync}
            >
              {syncMode === 'synced' ? 'Synced' : 'Unsynced'}
            </button>
          )}
          <button type="button" className="pill-btn" onClick={handleExit}>Exit</button>
        </div>
      </div>

      <div className="glass-card race-card">
        <div className="race-label">
          <span className="live-dot" />
          Live {mode === 'solo' ? 'Solo' : mode === 'friend' ? `Friend Room • ${roomCode}` : '1v1'} Race Track
        </div>

        <div className="lane">
          <div className="lane-info">
            <span className="lane-avatar" dangerouslySetInnerHTML={{ __html: AVATARS[avatarIdx] }} />
            <span className="lane-name">{handle}</span>
            <span className="lane-you-badge">YOU</span>
          </div>
          <div className="lane-bar">
            <div className="lane-fill player-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="lane-wpm">{wpm} WPM</span>
        </div>

        {opponent && (
          <div className="lane">
            <div className="lane-info">
              <span className="lane-avatar" dangerouslySetInnerHTML={{ __html: AVATARS[opponent.avatarIdx || 1] }} />
              <span className="lane-name">{opponent.name}</span>
              <span className="lane-opp-badge">{mode === 'friend' ? 'FRIEND' : 'STRANGER'}</span>
            </div>
            <div className="lane-bar">
              <div className="lane-fill opp-fill" style={{ width: `${oppProgress}%` }} />
            </div>
            <span className="lane-wpm">{opponent.wpm || 0} WPM</span>
          </div>
        )}
      </div>

      <YouTubePlayer
        videoId={track?.youtubeId}
        isPlaying={raceActive}
        raceStartTime={startTime}
        locked={mode === 'friend' && roomSongLocked}
        isHost={mode === 'friend' && isHost}
        remoteMediaSync={remoteMediaSync}
        onTimeUpdate={handleYtTimeUpdate}
        onMediaAction={handleMediaAction}
        onHeartbeat={handleHostHeartbeat}
        onEnded={() => finishMatch(0)}
      />

      <div
        className="glass-card typing-stage"
        onClick={() => hiddenInputRef.current?.focus()}
      >
        <div className="line-progress-bar">
          <div className="line-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="hud-grid">
          <div className="hud-item">
            <div className="hud-val">{wpm}</div>
            <div className="hud-label">WPM</div>
          </div>
          <div className="hud-item">
            <div className="hud-val hud-acc">{acc}%</div>
            <div className="hud-label">ACC</div>
          </div>
          <div className="hud-item">
            <div className="hud-val">{score}</div>
            <div className="hud-label">SCORE</div>
          </div>
          <div className="hud-item">
            <div className="hud-val hud-combo">{combo}</div>
            <div className="hud-label">COMBO</div>
          </div>
          <div className="hud-item">
            <div className="hud-val">{formatTime(elapsed)}</div>
            <div className="hud-label">TIME</div>
          </div>
        </div>

        <div className="line-counter">
          Line {Math.min(lineIdx + 1, lines.length)} / {lines.length}
        </div>

        <div className="lyric-display">
          <div className="active-line">{renderChars()}</div>
          <div className="next-line">{nextLine}</div>
        </div>

        <input
          ref={hiddenInputRef}
          id="hiddenTypingInput"
          className="hidden-input"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onInput={handleMobileInput}
        />

        {countdownNum !== null && countdownNum > 0 && (
          <div className="countdown-overlay">
            <div className="countdown-num">{countdownNum}</div>
          </div>
        )}
        {countdownNum === 0 && (
          <div className="countdown-overlay go-overlay">
            <div className="countdown-num go-text">GO!</div>
          </div>
        )}
      </div>
    </div>
  );
}
