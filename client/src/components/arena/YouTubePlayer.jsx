// ═══════════════════════════════════════════════════════════════
// YouTubePlayer — Embedded YouTube IFrame API with Lock & Sync Seek
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from 'react';
import './YouTubePlayer.css';

export default function YouTubePlayer({
  videoId,
  isPlaying,
  raceStartTime = null,
  locked = false,
  isHost = false,
  remoteMediaSync = null,
  onTimeUpdate,
  onMediaAction,
  onHeartbeat,
  onEnded,
}) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const timeLoopRef = useRef(null);
  const lastTimeRef = useRef(0);
  const lastHeartbeatRef = useRef(0);
  const suppressSyncUntilRef = useRef(0);
  const didInitialSyncRef = useRef(false);
  const raceStartTimeRef = useRef(raceStartTime);
  raceStartTimeRef.current = raceStartTime;

  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const onMediaActionRef = useRef(onMediaAction);
  onMediaActionRef.current = onMediaAction;
  const onHeartbeatRef = useRef(onHeartbeat);
  onHeartbeatRef.current = onHeartbeat;

  const [statusText, setStatusText] = useState('YouTube Sync Ready');
  const [muted, setMuted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setUnavailable(true);
      setStatusText('Focus Audio Mode (No YouTube ID)');
      return;
    }

    setUnavailable(false);
    setStatusText('Connecting YouTube audio...');
    lastTimeRef.current = 0;

    let destroyed = false;

    const initPlayer = () => {
      if (destroyed || !mountRef.current || !window.YT?.Player) return;

      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy(); } catch {}
      }

      const containerId = `yt-frame-${videoId}-${Date.now()}`;
      mountRef.current.innerHTML = `<div id="${containerId}" style="width:100%;height:100%"></div>`;

      playerRef.current = new window.YT.Player(containerId, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          start: 0,
          controls: locked ? 0 : 1,
          disablekb: locked ? 1 : 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (ev) => {
            if (destroyed) return;
            setStatusText(locked ? 'YouTube Synced • 🔒 Locked' : 'YouTube Synced • Ready');
            if (muted) ev.target.mute();
            if (isPlaying) {
              try {
                suppressSyncUntilRef.current = Date.now() + 1200;
                const offset = raceStartTimeRef.current
                  ? Math.max(0, (Date.now() - raceStartTimeRef.current) / 1000)
                  : 0;
                ev.target.seekTo(offset, true);
                ev.target.playVideo();
              } catch {}
            }
            clearInterval(timeLoopRef.current);
            timeLoopRef.current = setInterval(() => {
              try {
                if (typeof ev.target?.getCurrentTime !== 'function') return;
                const t = ev.target.getCurrentTime();
                onTimeUpdate?.(t);

                // Detect manual seek when unlocked
                if (!locked && Date.now() > suppressSyncUntilRef.current) {
                  const delta = Math.abs(t - lastTimeRef.current);
                  if (delta > 1.35) {
                    const playingNow = ev.target.getPlayerState?.() === window.YT?.PlayerState?.PLAYING;
                    onMediaActionRef.current?.({ time: t, isPlaying: playingNow });
                  }
                }

                // Host heartbeat every 1.5s to keep guest at exact same second
                if (isHost && Date.now() - lastHeartbeatRef.current > 1500) {
                  lastHeartbeatRef.current = Date.now();
                  const playingNow = ev.target.getPlayerState?.() === window.YT?.PlayerState?.PLAYING;
                  onHeartbeatRef.current?.({ time: t, isPlaying: playingNow });
                }
                lastTimeRef.current = t;
              } catch {}
            }, 200);
          },
          onStateChange: (ev) => {
            if (ev.data === window.YT.PlayerState.PLAYING) {
              setStatusText(locked ? 'Playing • 🔒 Locked' : 'Playing Synced Track');
              // Catch up if buffering delayed one tab at match start
              if (!didInitialSyncRef.current && raceStartTimeRef.current) {
                didInitialSyncRef.current = true;
                const expectedSec = Math.max(0, (Date.now() - raceStartTimeRef.current) / 1000);
                const actualSec = ev.target.getCurrentTime?.() || 0;
                if (expectedSec < 15 && Math.abs(actualSec - expectedSec) > 0.8) {
                  suppressSyncUntilRef.current = Date.now() + 1200;
                  ev.target.seekTo(expectedSec, true);
                  lastTimeRef.current = expectedSec;
                  return;
                }
              }
              if (!locked && Date.now() > suppressSyncUntilRef.current) {
                const t = ev.target.getCurrentTime?.() || 0;
                onMediaActionRef.current?.({ time: t, isPlaying: true });
              }
            } else if (ev.data === window.YT.PlayerState.PAUSED) {
              setStatusText(locked ? 'Paused • 🔒 Locked' : 'Track Paused');
              if (!locked && Date.now() > suppressSyncUntilRef.current) {
                const t = ev.target.getCurrentTime?.() || 0;
                onMediaActionRef.current?.({ time: t, isPlaying: false });
              }
            } else if (ev.data === window.YT.PlayerState.ENDED) {
              setStatusText('Track Finished');
              onEndedRef.current?.();
            }
          },
          onError: () => {
            setUnavailable(true);
            setStatusText('Embed restricted — Focus Audio Active');
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        tag.onerror = () => {
          setUnavailable(true);
          setStatusText('Focus Audio Mode');
        };
        document.head.appendChild(tag);
      }
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevReady?.();
        initPlayer();
      };
    }

    return () => {
      destroyed = true;
      clearInterval(timeLoopRef.current);
      try { playerRef.current?.destroy(); } catch {}
      playerRef.current = null;
    };
  }, [videoId, locked]);

  // Auto-play at exact match start (0s or elapsed offset) when race starts
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      try {
        if (typeof playerRef.current.playVideo === 'function') {
          didInitialSyncRef.current = false;
          suppressSyncUntilRef.current = Date.now() + 1200;
          const offset = raceStartTime ? Math.max(0, (Date.now() - raceStartTime) / 1000) : 0;
          playerRef.current.seekTo?.(offset, true);
          lastTimeRef.current = offset;
          playerRef.current.playVideo();
        }
      } catch {}
    }
  }, [isPlaying]);

  // Apply remote seek / play / pause / heartbeat from friend
  useEffect(() => {
    if (!remoteMediaSync || !playerRef.current) return;
    if (locked && !remoteMediaSync.heartbeat) return;
    try {
      const { time, isPlaying: remotePlaying, heartbeat } = remoteMediaSync;
      const current = playerRef.current.getCurrentTime?.() || 0;

      // For periodic heartbeats, only seek if drift > 1.1s
      if (heartbeat) {
        if (typeof time === 'number' && Math.abs(current - time) > 1.1) {
          suppressSyncUntilRef.current = Date.now() + 1000;
          playerRef.current.seekTo?.(time, true);
          lastTimeRef.current = time;
        }
        return;
      }

      suppressSyncUntilRef.current = Date.now() + 1200;
      if (typeof time === 'number' && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(time, true);
        lastTimeRef.current = time;
      }
      if (remotePlaying === true && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      } else if (remotePlaying === false && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    } catch {}
  }, [remoteMediaSync, locked]);

  const handleTogglePlay = () => {
    if (locked) return;
    const p = playerRef.current;
    if (!p || typeof p.getPlayerState !== 'function') return;
    try {
      const t = p.getCurrentTime?.() || 0;
      if (p.getPlayerState() === window.YT.PlayerState.PLAYING) {
        p.pauseVideo();
        onMediaActionRef.current?.({ time: t, isPlaying: false });
      } else {
        p.playVideo();
        onMediaActionRef.current?.({ time: t, isPlaying: true });
      }
    } catch {}
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    try {
      if (playerRef.current) {
        next ? playerRef.current.mute() : playerRef.current.unMute();
      }
    } catch {}
  };

  if (!videoId) return null;

  return (
    <div className="glass-card yt-card">
      <div className="yt-header">
        <div className="yt-status-left">
          <div className="yt-bars" aria-hidden="true">
            <span className="yt-bar b1" />
            <span className="yt-bar b2" />
            <span className="yt-bar b3" />
          </div>
          <span className="yt-status-text">{statusText}</span>
        </div>

        <div className="yt-controls">
          {locked ? (
            <span className="yt-lock-badge">🔒 Seek Locked</span>
          ) : (
            <button type="button" className="yt-btn" onClick={handleTogglePlay}>
              Play / Pause
            </button>
          )}
          <button type="button" className="yt-btn" onClick={handleToggleMute}>
            {muted ? 'Unmute' : 'Mute'}
          </button>
          <button type="button" className="yt-btn" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? 'Show Video' : 'Audio Only'}
          </button>
        </div>
      </div>

      <div className={`yt-frame-wrap ${collapsed ? 'collapsed' : ''}`}>
        <div ref={mountRef} className="yt-mount" />
        {locked && <div className="yt-lock-shield" title="Song seeking is locked for this 1v1 match" />}
        {unavailable && (
          <div className="yt-fallback">
            <p>YouTube embed unavailable for this video — racing in Focus Audio mode.</p>
          </div>
        )}
      </div>
    </div>
  );
}
