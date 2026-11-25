// ═══════════════════════════════════════════════════════════════
// Constants — Cute SVG Avatars, Tracks with YouTube IDs, Stranger Pool
// ═══════════════════════════════════════════════════════════════

export const AVATARS = [
  `<svg viewBox="0 0 64 64" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bgCat" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B5FD"/><stop offset="100%" stop-color="#7C5CFF"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#bgCat)"/><path d="M13 33 C13 16, 51 16, 51 33" fill="none" stroke="#1E1B4B" stroke-width="4" stroke-linecap="round"/><polygon points="18,26 22,14 30,22" fill="#F8FAFC"/><polygon points="46,26 42,14 34,22" fill="#F8FAFC"/><polygon points="20,24 22.5,17 27.5,22" fill="#FDA4AF"/><polygon points="44,24 41.5,17 36.5,22" fill="#FDA4AF"/><ellipse cx="32" cy="37" rx="17" ry="15" fill="#F8FAFC"/><rect x="10" y="29" width="6" height="13" rx="3" fill="#312E81"/><rect x="48" y="29" width="6" height="13" rx="3" fill="#312E81"/><path d="M22 36 Q25 33 28 36" fill="none" stroke="#1E1B4B" stroke-width="2.4" stroke-linecap="round"/><path d="M36 36 Q39 33 42 36" fill="none" stroke="#1E1B4B" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="21" cy="40" rx="3" ry="1.8" fill="#FDA4AF" opacity="0.7"/><ellipse cx="43" cy="40" rx="3" ry="1.8" fill="#FDA4AF" opacity="0.7"/><polygon points="30.5,39.5 33.5,39.5 32,41.5" fill="#FB7185"/><path d="M29.5 43 Q32 45 34.5 43" fill="none" stroke="#1E1B4B" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  `<svg viewBox="0 0 64 64" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bgBlob" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#0F172A"/></linearGradient><linearGradient id="bodyBlob" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A5F3FC"/><stop offset="100%" stop-color="#38BDF8"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#bgBlob)"/><circle cx="14" cy="14" r="1.5" fill="#FEF08A"/><circle cx="52" cy="16" r="1.8" fill="#FFFFFF" opacity="0.85"/><circle cx="48" cy="49" r="1.2" fill="#FEF08A"/><path d="M16 44 C14 26, 22 17, 32 17 C42 17, 50 26, 48 44 C47 50, 40 52, 32 51 C24 52, 17 50, 16 44 Z" fill="url(#bodyBlob)"/><path d="M32 17 L32 11" stroke="#E0F2FE" stroke-width="2.5" stroke-linecap="round"/><circle cx="32" cy="10" r="3" fill="#FBBF24"/><circle cx="25.5" cy="34" r="2.8" fill="#0F172A"/><circle cx="38.5" cy="34" r="2.8" fill="#0F172A"/><circle cx="24.6" cy="33" r="1" fill="#FFFFFF"/><circle cx="37.6" cy="33" r="1" fill="#FFFFFF"/><path d="M28.5 40 Q32 43.5 35.5 40" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  `<svg viewBox="0 0 64 64" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bgPanda" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FDE68A"/><stop offset="100%" stop-color="#F59E0B"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#bgPanda)"/><circle cx="18" cy="22" r="7" fill="#1E293B"/><circle cx="46" cy="22" r="7" fill="#1E293B"/><ellipse cx="32" cy="36" rx="18" ry="16" fill="#FFFFFF"/><ellipse cx="24.5" cy="35" rx="5.5" ry="4.5" transform="rotate(-15 24.5 35)" fill="#1E293B"/><ellipse cx="39.5" cy="35" rx="5.5" ry="4.5" transform="rotate(15 39.5 35)" fill="#1E293B"/><circle cx="25" cy="34.5" r="1.7" fill="#FFFFFF"/><circle cx="39" cy="34.5" r="1.7" fill="#FFFFFF"/><ellipse cx="19" cy="40.5" rx="2.8" ry="1.6" fill="#FDA4AF" opacity="0.85"/><ellipse cx="45" cy="40.5" rx="2.8" ry="1.6" fill="#FDA4AF" opacity="0.85"/><ellipse cx="32" cy="39.5" rx="2.5" ry="1.7" fill="#1E293B"/><path d="M29.5 43 Q32 45 34.5 43" fill="none" stroke="#1E293B" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  `<svg viewBox="0 0 64 64" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bgFox" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FB7185"/><stop offset="100%" stop-color="#4C1D95"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#bgFox)"/><polygon points="15,31 19,13 30,24" fill="#FB923C"/><polygon points="49,31 45,13 34,24" fill="#FB923C"/><polygon points="18,28 20.5,17 27,24" fill="#FEF3C7"/><polygon points="46,28 43.5,17 37,24" fill="#FEF3C7"/><ellipse cx="32" cy="37" rx="18" ry="14" fill="#FB923C"/><path d="M14 38 Q22 36 32 47 Q42 36 50 38 Q46 51 32 51 Q18 51 14 38 Z" fill="#FFFBEB"/><circle cx="32" cy="29" r="1.8" fill="#FEF08A"/><path d="M22 36.5 Q25 38.5 28 36.5" fill="none" stroke="#1E1B4B" stroke-width="2.2" stroke-linecap="round"/><path d="M36 36.5 Q39 38.5 42 36.5" fill="none" stroke="#1E1B4B" stroke-width="2.2" stroke-linecap="round"/><polygon points="30,41 34,41 32,43.5" fill="#1E1B4B"/></svg>`,
];

export const TRACKS = [
  {
    id: 'neon-pulse',
    title: 'Neon Pulse',
    artist: 'Midnight Echo',
    tag: 'Synth Pop',
    bpm: '118 BPM',
    youtubeId: '4xDzrJKXOOY',
    coverSvg: `<svg viewBox="0 0 120 120" style="width:100%;height:100%"><defs><linearGradient id="c1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7C5CFF"/><stop offset="55%" stop-color="#EC4899"/><stop offset="100%" stop-color="#0F172A"/></linearGradient></defs><rect width="120" height="120" fill="url(#c1)"/><circle cx="60" cy="52" r="24" fill="#FDE047" opacity="0.85"/><path d="M0 78 L120 78 M0 88 L120 88 M0 100 L120 100" stroke="#38BDF8" stroke-width="1.5" opacity="0.65"/><polygon points="0,120 35,70 62,92 92,62 120,120" fill="#090A0F" opacity="0.82"/></svg>`,
    lines: [
      'Streetlights blur across the midnight glass',
      'We chase the rhythm while the shadows pass',
      'Turn up the static till the skyline glows',
      'Two strangers racing where the neon flows',
      'Every heartbeat hits the synthesizer wave',
      'No need to worry what the morning saves',
    ],
  },
  {
    id: 'golden-horizon',
    title: 'Golden Horizon',
    artist: 'Paper Satellites',
    tag: 'Indie Acoustic',
    bpm: '96 BPM',
    youtubeId: 'jfKfPfyJRdk',
    coverSvg: `<svg viewBox="0 0 120 120" style="width:100%;height:100%"><defs><linearGradient id="c2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FBBF24"/><stop offset="55%" stop-color="#FB7185"/><stop offset="100%" stop-color="#1E1B4B"/></linearGradient></defs><rect width="120" height="120" fill="url(#c2)"/><circle cx="60" cy="60" r="30" fill="none" stroke="#FFFBEB" stroke-width="1.5" opacity="0.5"/><circle cx="60" cy="60" r="16" fill="#FEF3C7" opacity="0.9"/><circle cx="28" cy="28" r="2" fill="#FFF"/><circle cx="92" cy="34" r="1.5" fill="#FFF"/><circle cx="84" cy="88" r="2" fill="#FFF"/></svg>`,
    lines: [
      'Look at the amber sky begin to fade',
      'We kept the melodies our summers made',
      'Soft guitar chords drift across the room',
      'Turning the quiet night to golden bloom',
      'Count every lantern floating out to sea',
      'You hum the bridge and throw the verse to me',
    ],
  },
  {
    id: 'velvet-groove',
    title: 'Rhythm of the City',
    artist: 'Velvet Groove',
    tag: 'Pop Groove',
    bpm: '106 BPM',
    youtubeId: '5yx6BWlEVcY',
    coverSvg: `<svg viewBox="0 0 120 120" style="width:100%;height:100%"><defs><linearGradient id="c3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38BDF8"/><stop offset="50%" stop-color="#6366F1"/><stop offset="100%" stop-color="#090A0F"/></linearGradient></defs><rect width="120" height="120" fill="url(#c3)"/><rect x="26" y="48" width="10" height="40" rx="5" fill="#FFF" opacity="0.85"/><rect x="44" y="30" width="10" height="58" rx="5" fill="#FFF" opacity="0.95"/><rect x="62" y="40" width="10" height="48" rx="5" fill="#FFF" opacity="0.8"/><rect x="80" y="24" width="10" height="64" rx="5" fill="#A5F3FC" opacity="0.95"/></svg>`,
    lines: [
      'Bassline knocking on a Friday night',
      'Sneakers tapping underneath the violet light',
      'Every corner has a melody to share',
      'Catching the groove floating in the midnight air',
      'Do not miss a beat when the drums kick in',
      'Smile in the dark let the whole floor spin',
    ],
  },
  {
    id: 'chasing-satellites',
    title: 'Chasing Satellites',
    artist: 'Solaris Club',
    tag: 'Pop Anthem',
    bpm: '126 BPM',
    youtubeId: 'rUxyKA_-grg',
    coverSvg: `<svg viewBox="0 0 120 120" style="width:100%;height:100%"><defs><linearGradient id="c4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34D399"/><stop offset="50%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#312E81"/></linearGradient></defs><rect width="120" height="120" fill="url(#c4)"/><ellipse cx="60" cy="60" rx="44" ry="16" transform="rotate(-25 60 60)" fill="none" stroke="#FFF" stroke-width="2" opacity="0.75"/><circle cx="60" cy="60" r="14" fill="#F8FAFC" opacity="0.95"/><circle cx="94" cy="43" r="5" fill="#FBBF24"/></svg>`,
    lines: [
      'Lately I have been wide awake till dawn',
      'Counting every comet before the night is gone',
      'Static on the radio starts to sound like gold',
      'Jumping off the edge with a story left untold',
      'Faster than the signal racing through the wire',
      'Every single syllable climbing even higher',
    ],
  },
];

export const STRANGER_POOL = [
  { name: 'Velvet_Echo', avatarIdx: 3, tags: ['Night Owl', 'Indie Pop'] },
  { name: 'Neon_Drifter', avatarIdx: 1, tags: ['Midnight Synth', 'Fast Typer'] },
  { name: 'LoFi_Ghost', avatarIdx: 0, tags: ['Chill Beats', 'Music Nerd'] },
  { name: 'Mochi_Pulse', avatarIdx: 2, tags: ['Late Drive', 'Acoustic'] },
];

export const RANDOM_ALIASES = [
  'LoFi_Mochi', 'Neon_Drifter', 'Velvet_Wave', 'Pixel_Ghost',
  'Starry_Echo', 'Midnight_Koi', 'Synth_Cloud', 'Vinyl_Dreamer',
  'Indie_Spark', 'Cyber_Boba', 'Moonlit_Keys', 'Echo_Panda',
];
