// ═══════════════════════════════════════════════════════════════
// Layout — Root wrapper with ambient BG + Topbar
// ═══════════════════════════════════════════════════════════════
import Topbar from './Topbar';
import Toast from '../ui/Toast';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <>
      {/* Ambient glowing orbs */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      <Topbar />

      <main className="app-main">
        {children}
      </main>

      <Toast />
    </>
  );
}

