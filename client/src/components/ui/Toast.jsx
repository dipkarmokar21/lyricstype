// ═══════════════════════════════════════════════════════════════
// Toast — Notification popup
// ═══════════════════════════════════════════════════════════════
import useGameStore from '@/stores/gameStore';
import './Toast.css';

export default function Toast() {
  const { toastMessage, toastVisible } = useGameStore();

  return (
    <div className={`toast-popup ${toastVisible ? 'show' : ''}`}>
      {toastMessage}
    </div>
  );
}

