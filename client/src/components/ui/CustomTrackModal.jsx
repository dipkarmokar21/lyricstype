// ═══════════════════════════════════════════════════════════════
// CustomTrackModal — Add custom lyrics / YouTube tracks
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import useGameStore from '@/stores/gameStore';
import { extractYoutubeId } from '@/utils/helpers';
import './Modal.css';

export default function CustomTrackModal() {
  const { customModalOpen, setCustomModalOpen, addTrack, showToast } = useGameStore();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [ytLink, setYtLink] = useState('');
  const [lyrics, setLyrics] = useState('');

  if (!customModalOpen) return null;

  const handleSave = () => {
    const lines = lyrics.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 1) {
      showToast('Paste at least 1 line of lyrics');
      return;
    }
    const ytId = extractYoutubeId(ytLink);
    const newTrack = {
      id: 'custom_' + Date.now(),
      title: title.trim() || 'Custom Track',
      artist: artist.trim() || 'User Upload',
      tag: ytId ? 'Custom + YT' : 'Custom',
      youtubeId: ytId,
      lines,
    };
    addTrack(newTrack);
    setCustomModalOpen(false);
    setTitle('');
    setArtist('');
    setYtLink('');
    setLyrics('');
    showToast(`Added "${newTrack.title}"!`);
  };

  return (
    <div className="modal-backdrop" onClick={() => setCustomModalOpen(false)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Custom Track</h3>
          <button className="pill-btn" onClick={() => setCustomModalOpen(false)}>✕</button>
        </div>

        <div className="input-group">
          <label>Track Title</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Late Night Acoustic" />
        </div>

        <div className="input-group">
          <label>Artist / Creator</label>
          <input className="field" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="e.g. Indie Session" />
        </div>

        <div className="input-group">
          <label>YouTube Link or Video ID (Optional)</label>
          <input className="field" value={ytLink} onChange={(e) => setYtLink(e.target.value)} placeholder="https://youtube.com/watch?v=... or 11-char ID" />
        </div>

        <div className="input-group">
          <label>Lyrics (one line per verse)</label>
          <textarea className="field textarea" value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={5} placeholder="Paste your lyrics lines here..." />
        </div>

        <button className="btn-primary" onClick={handleSave}>Save & Select Track</button>
      </div>
    </div>
  );
}

