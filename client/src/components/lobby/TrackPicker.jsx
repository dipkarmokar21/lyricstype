// ═══════════════════════════════════════════════════════════════
// TrackPicker — Song card grid with cover art, vibe badge, & BPM
// ═══════════════════════════════════════════════════════════════
import useGameStore from '@/stores/gameStore';
import './TrackPicker.css';

const DEFAULT_COVER = `<svg viewBox="0 0 120 120" style="width:100%;height:100%"><defs><linearGradient id="cCustom" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#A78BFA"/><stop offset="100%" stop-color="#0EA5E9"/></linearGradient></defs><rect width="120" height="120" fill="url(#cCustom)"/><circle cx="60" cy="60" r="24" fill="none" stroke="#FFF" stroke-width="2.5" stroke-dasharray="6 4"/><polygon points="55,48 74,60 55,72" fill="#FFF"/></svg>`;

export default function TrackPicker() {
  const { tracks, selectedTrackId, setSelectedTrack } = useGameStore();

  return (
    <div className="track-grid">
      {tracks.map((track) => {
        const isSelected = selectedTrackId === track.id;
        return (
          <button
            key={track.id}
            type="button"
            className={`song-card ${isSelected ? 'selected' : ''}`}
            onClick={() => setSelectedTrack(track.id)}
          >
            <div className="song-cover-wrap">
              <div
                className="song-cover-svg"
                dangerouslySetInnerHTML={{ __html: track.coverSvg || DEFAULT_COVER }}
              />
              <span className="song-vibe-badge">{track.tag}</span>
              {isSelected && (
                <span className="song-check-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </div>

            <div className="song-info">
              <h4>{track.title}</h4>
              <span className="song-artist">{track.artist}</span>
            </div>

            <div className="song-footer">
              <span className="song-bpm">{track.bpm || (track.youtubeId ? 'YouTube' : 'Custom')}</span>
              <span className="song-lines">{track.lines.length} lines</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
