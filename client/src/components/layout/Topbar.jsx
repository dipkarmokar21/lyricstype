// ═══════════════════════════════════════════════════════════════
// Topbar — Sticky header with brand, sound toggle, avatar pill
// ═══════════════════════════════════════════════════════════════
import { useLocation } from 'react-router-dom';
import useGameStore from '@/stores/gameStore';
import { AVATARS } from '@/utils/constants';
import { playCorrectKey } from '@/utils/sound';
import './Topbar.css';

export default function Topbar() {
  const { pathname } = useLocation();
  const isArena = pathname.includes('/race');
  const { handle, avatarIdx, soundOn, toggleSound, resetToLobby, setCustomModalOpen } = useGameStore();

  const handleToggleSfx = () => {
    const next = !soundOn;
    toggleSound();
    if (next) playCorrectKey(8);
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* Brand */}
        <button className="brand" onClick={resetToLobby}>
          <div className="brand-dot">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div className="brand-text">
            type<span className="brand-accent">.</span>nitchat<span className="brand-muted">.com</span>
          </div>
          <span className="beta-badge">BETA</span>
        </button>

        {/* Controls */}
        <div className="top-actions">
          {!isArena && (
            <button className="pill-btn" onClick={() => setCustomModalOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Custom Track
            </button>
          )}

          <button className={`pill-btn ${soundOn ? 'active' : ''}`} onClick={handleToggleSfx} title={soundOn ? 'Keystroke SFX: ON' : 'Keystroke SFX: OFF'}>
            {soundOn ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="22" y1="9" x2="16" y2="15" />
                <line x1="16" y1="9" x2="22" y2="15" />
              </svg>
            )}
            SFX
          </button>

          <button className="avatar-pill" title="Your Profile">
            <span className="avatar-mini" dangerouslySetInnerHTML={{ __html: AVATARS[avatarIdx] }} />
            <span className="avatar-name">{handle}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

