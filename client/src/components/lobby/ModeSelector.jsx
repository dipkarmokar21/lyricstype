// ═══════════════════════════════════════════════════════════════
// ModeSelector — Solo / Friend / Stranger mode cards
// ═══════════════════════════════════════════════════════════════
import useGameStore from '@/stores/gameStore';
import './ModeSelector.css';

const MODES = [
  {
    key: 'solo',
    badge: 'SOLO CHILL',
    title: 'Single Player',
    desc: 'Zero pressure. Type at your own pace, track WPM, combo & beat your personal best.',
  },
  {
    key: 'friend',
    badge: 'PRIVATE ROOM',
    title: 'Chill with Friend',
    desc: 'Create a room code, share the link, race live side-by-side & hang out in room chat.',
  },
  {
    key: 'stranger',
    badge: '1V1 ANONYMOUS',
    title: 'Match a Stranger',
    desc: 'Race someone with the same music taste & unlock an anonymous NitChat after finishing.',
  },
];

export default function ModeSelector() {
  const { mode, setMode } = useGameStore();

  return (
    <div className="mode-grid">
      {MODES.map((m) => (
        <button
          key={m.key}
          className={`mode-card ${mode === m.key ? 'selected' : ''}`}
          onClick={() => setMode(m.key)}
        >
          <span className="mode-badge">{m.badge}</span>
          <h3>{m.title}</h3>
          <p>{m.desc}</p>
        </button>
      ))}
    </div>
  );
}

