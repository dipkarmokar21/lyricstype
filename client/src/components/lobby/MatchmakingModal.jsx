// ═══════════════════════════════════════════════════════════════
// MatchmakingModal — Radar Searching -> Match Found VS -> Syncing
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import useGameStore from '@/stores/gameStore';
import { AVATARS } from '@/utils/constants';
import { playCountdownBeep } from '@/utils/sound';
import './MatchmakingModal.css';

export default function MatchmakingModal({ open, opponent, onCancel, onReady }) {
  const { avatarIdx, handle, soundOn, getSelectedTrack } = useGameStore();
  const track = getSelectedTrack();
  const [phase, setPhase] = useState('searching'); // 'searching' | 'found'

  useEffect(() => {
    if (!open) {
      setPhase('searching');
      return;
    }
    setPhase('searching');

    const t1 = setTimeout(() => {
      setPhase('found');
      if (soundOn) playCountdownBeep();
    }, 1700);

    const t2 = setTimeout(() => {
      onReady();
    }, 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="mm-overlay">
      <div className="glass-card mm-card">
        {phase === 'searching' ? (
          <div className="mm-searching">
            <div className="radar-wrap">
              <div className="radar-ring" />
              <div className="radar-ring" />
              <div className="radar-ring" />
              <div
                className="radar-avatar"
                dangerouslySetInnerHTML={{ __html: AVATARS[avatarIdx] }}
              />
            </div>

            <div className="mm-text">
              <h3>Searching for a match...</h3>
              <p>
                Finding someone vibing to <span className="mm-song">{track?.title}</span>
              </p>
            </div>

            <button type="button" className="pill-btn" onClick={onCancel}>
              Cancel Search
            </button>
          </div>
        ) : (
          <div className="mm-found">
            <span className="mm-found-badge">Match Found</span>

            <div className="mm-vs-row">
              <div className="mm-player">
                <div
                  className="mm-vs-avatar player-ring"
                  dangerouslySetInnerHTML={{ __html: AVATARS[avatarIdx] }}
                />
                <span className="mm-vs-name">{handle}</span>
              </div>

              <div className="mm-vs-text">VS</div>

              <div className="mm-player">
                <div
                  className="mm-vs-avatar opp-ring"
                  dangerouslySetInnerHTML={{ __html: AVATARS[opponent?.avatarIdx ?? 1] }}
                />
                <span className="mm-vs-name opp-name">{opponent?.name || 'Velvet_Echo'}</span>
              </div>
            </div>

            <div className="mm-tags">
              {(opponent?.tags || [track?.tag || 'Music', 'Night Owl']).map((tag) => (
                <span key={tag} className="mm-tag">#{tag}</span>
              ))}
            </div>

            <div className="mm-sync-pill">
              <span className="mm-spinner" />
              <span>Syncing YouTube Player &amp; Room...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

