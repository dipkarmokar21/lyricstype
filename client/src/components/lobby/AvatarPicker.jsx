// ═══════════════════════════════════════════════════════════════
// AvatarPicker — 4 cute SVG avatar options
// ═══════════════════════════════════════════════════════════════
import useGameStore from '@/stores/gameStore';
import { AVATARS } from '@/utils/constants';
import './AvatarPicker.css';

export default function AvatarPicker() {
  const { avatarIdx, setAvatar } = useGameStore();

  return (
    <div className="avatar-picker-grid">
      {AVATARS.map((svg, i) => (
        <button
          key={i}
          className={`avatar-opt ${avatarIdx === i ? 'selected' : ''}`}
          onClick={() => setAvatar(i)}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ))}
    </div>
  );
}

