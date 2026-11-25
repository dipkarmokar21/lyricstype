// ═══════════════════════════════════════════════════════════════
// SongSearchBar — Search YouTube songs + auto-fetch free lyrics
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import api from '@/services/api';
import useGameStore from '@/stores/gameStore';
import { hasNonAscii } from '@/utils/romanize';
import './SongSearchBar.css';

export default function SongSearchBar() {
  const { addTrack, setRomanizeEnabled, setSyncMode, showToast } = useGameStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const data = await api.searchYoutube(q);
      setResults(data || []);
      if (!data?.length) showToast('No YouTube songs found — try another query');
    } catch (err) {
      showToast('Search failed: make sure backend server is running');
    } finally {
      setSearching(false);
    }
  };

  const handlePickSong = async (video) => {
    setLoadingTrackId(video.videoId);
    try {
      const lyr = await api.fetchLyrics({
        q: video.title,
        title: video.title,
        artist: video.artist,
        fallbackQ: query.trim(),
        duration: video.seconds || 0,
      });

      const lines = lyr?.lines?.length
        ? lyr.lines
        : [
            `Playing ${video.title}`,
            `No auto-lyrics found in free database`,
            `Click Custom Track to paste your own lyrics`,
          ];

      const containsNonAscii = lines.some((l) => hasNonAscii(l));
      setRomanizeEnabled(containsNonAscii);
      setSyncMode('unsynced');

      const newTrack = {
        id: `yt_${video.videoId}`,
        title: lyr?.trackName || video.title,
        artist: lyr?.artistName || video.artist,
        tag: lyr?.hasSynced ? 'Synced Lyrics' : containsNonAscii ? 'Romanized' : 'YouTube',
        bpm: video.duration || 'YT',
        youtubeId: video.videoId,
        thumbnail: video.thumbnail,
        synced: lyr?.synced || [],
        lines,
      };

      addTrack(newTrack);
      setResults([]);
      setQuery('');
      showToast(
        lyr?.lines?.length
          ? `Loaded "${newTrack.title}" (${lyr.hasSynced ? 'Synced' : 'Plain'} lyrics${containsNonAscii ? ' • Banglish/Romanized ON' : ''})`
          : `Selected "${video.title}" (no lyrics found — paste via Custom Track if needed)`
      );
    } catch {
      showToast('Could not fetch lyrics, selected YouTube track anyway');
    } finally {
      setLoadingTrackId(null);
    }
  };

  return (
    <div className="yt-search-wrap">
      <form className="yt-search-form" onSubmit={handleSearch}>
        <svg className="yt-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          className="yt-search-input"
          placeholder="Search any song on YouTube (Bangla, Hindi, English, K-Pop)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="yt-search-btn" disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="glass-card yt-results-dropdown">
          <div className="yt-results-header">
            <span>YouTube Results — click to load song &amp; auto-fetch lyrics</span>
            <button type="button" className="yt-close-btn" onClick={() => setResults([])}>✕</button>
          </div>
          <div className="yt-results-list">
            {results.map((v) => (
              <button
                key={v.videoId}
                type="button"
                className="yt-result-item"
                disabled={loadingTrackId === v.videoId}
                onClick={() => handlePickSong(v)}
              >
                <img src={v.thumbnail} alt="" className="yt-thumb" />
                <div className="yt-meta">
                  <div className="yt-title">{v.title}</div>
                  <div className="yt-sub">{v.artist} • {v.duration}</div>
                </div>
                <span className="yt-pick-pill">
                  {loadingTrackId === v.videoId ? 'Fetching...' : 'Select'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

