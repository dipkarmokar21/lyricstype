// ═══════════════════════════════════════════════════════════════
// HomePage — YouTube Search, Mode Cards, Profile, Track Picker, Friend Room
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useGameStore from '@/stores/gameStore';
import SongSearchBar from './SongSearchBar';
import ModeSelector from './ModeSelector';
import AvatarPicker from './AvatarPicker';
import TrackPicker from './TrackPicker';
import FriendPanel from './FriendPanel';
import MatchmakingModal from './MatchmakingModal';
import CustomTrackModal from '../ui/CustomTrackModal';
import { STRANGER_POOL } from '@/utils/constants';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const store = useGameStore();
  const {
    mode, handle, tier, romanizeEnabled, syncMode,
    setHandle, setTier, setRomanizeEnabled, setSyncMode,
    prepareRace, setOpponent, getSelectedTrack,
  } = store;

  const [matchmakingOpen, setMatchmakingOpen] = useState(false);
  const [pendingOpp, setPendingOpp] = useState(null);

  // Auto-switch to friend mode if URL has ?room=
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      store.setMode('friend');
    }
  }, []);

  const handleStartSolo = () => {
    if (handle) localStorage.setItem('nitchat_handle', handle);
    setOpponent(null);
    prepareRace();
    navigate('/race');
  };

  const handleFindStranger = () => {
    if (handle) localStorage.setItem('nitchat_handle', handle);
    const track = getSelectedTrack();
    const pick = STRANGER_POOL[Math.floor(Math.random() * STRANGER_POOL.length)];
    const opp = {
      id: 'ghost_' + Date.now(),
      name: pick.name,
      avatarIdx: pick.avatarIdx,
      tags: [...new Set([track?.tag || 'Music', ...(pick.tags || [])])].slice(0, 3),
      charIndex: 0,
      wpm: 0,
      finished: false,
      revealed: false,
    };
    setPendingOpp(opp);
    setOpponent(opp);
    setMatchmakingOpen(true);
  };

  const handleMatchReady = () => {
    setMatchmakingOpen(false);
    prepareRace();
    navigate('/race');
  };

  const handleMatchCancel = () => {
    setMatchmakingOpen(false);
    setPendingOpp(null);
    setOpponent(null);
  };

  const selectedTrack = getSelectedTrack();

  return (
    <div className="home-page animate-fadeUp">
      {/* Hero + YouTube Song Search */}
      <div className="hero-section">
        <h1 className="hero-title">
          Type Lyrics. <span className="gradient-text">Race Strangers.</span><br />
          Find Your Vibe.
        </h1>
        <p className="hero-sub">
          Search any song on YouTube, type lyrics in English or Banglish/Hinglish, race friends or strangers, and chat on NitChat.
        </p>
        <div style={{ marginTop: 20 }}>
          <SongSearchBar />
        </div>
      </div>

      {/* Anonymous Identity Bar */}
      <div className="glass-card profile-bar">
        <div className="profile-left">
          <div className="section-label-sm">Your Anonymous Vibe</div>
          <AvatarPicker />
        </div>
        <div className="profile-right">
          <div className="handle-input-wrap">
            <input
              className="field"
              maxLength={18}
              placeholder="Anonymous handle..."
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <ModeSelector />

      {/* Private Friend Room Panel (when mode === 'friend') */}
      {mode === 'friend' && <FriendPanel />}

      {/* Song Grid */}
      <div className="song-section">
        <div className="song-header">
          <div>
            <h2>Choose a Race Track</h2>
            <p className="song-sub">Search YouTube above or pick a curated track below</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`pill-btn ${romanizeEnabled ? 'active' : ''}`}
              onClick={() => setRomanizeEnabled(!romanizeEnabled)}
              title="Convert Bangla/Hindi/Korean/etc. into English-keyboard phonetics (Banglish/Hinglish)"
            >
              Banglish / Romanize: {romanizeEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              className={`pill-btn ${syncMode === 'synced' ? 'active' : ''}`}
              onClick={() => setSyncMode(syncMode === 'synced' ? 'unsynced' : 'synced')}
              title="Sync lyrics line with YouTube playback or type freely"
            >
              Lyrics: {syncMode === 'synced' ? 'Synced' : 'Unsynced'}
            </button>
          </div>
        </div>
        <TrackPicker />
      </div>

      {/* Matchmaking Controls (Solo or Stranger) */}
      {mode !== 'friend' && (
        <div className="glass-card controls-bar">
          {mode === 'stranger' ? (
            <div className="speed-tier-section">
              <div className="section-label-sm">Opponent Pace Tier</div>
              <div className="speed-selector">
                {['chill', 'balanced', 'pro'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`speed-opt ${tier === t ? 'active' : ''}`}
                    onClick={() => setTier(t)}
                  >
                    {t === 'chill' ? 'Chill ~40 WPM' : t === 'balanced' ? 'Balanced ~60 WPM' : 'Pro ~85 WPM'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="speed-tier-section">
              <div className="section-label-sm">Solo Practice</div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                Type at your own pace with live YouTube backing
              </span>
            </div>
          )}

          <div className="cta-section">
            <div className="selected-track-label">
              <span className="label-sm">Selected Track</span>
              <span className="track-name">{selectedTrack?.title} — {selectedTrack?.artist}</span>
            </div>
            <button
              type="button"
              className="btn-primary cta-btn"
              onClick={mode === 'solo' ? handleStartSolo : handleFindStranger}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {mode === 'solo' ? 'Start Solo Session' : 'Find 1v1 Anonymous Match'}
            </button>
          </div>
        </div>
      )}

      <CustomTrackModal />
      <MatchmakingModal
        open={matchmakingOpen}
        opponent={pendingOpp}
        onCancel={handleMatchCancel}
        onReady={handleMatchReady}
      />
    </div>
  );
}
