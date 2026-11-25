import supabase from '../config/supabase.js';

/**
 * Save a race result / score
 */
export async function saveScore({ player_name, track_id, wpm, accuracy, score, combo, mode }) {
  const { data, error } = await supabase
    .from('scores')
    .insert({ player_name, track_id, wpm, accuracy, score, max_combo: combo, mode })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get leaderboard — top scores, optionally by track
 */
export async function getLeaderboard({ track_id = null, limit = 20 } = {}) {
  let query = supabase
    .from('scores')
    .select('*, tracks(title, artist)')
    .order('wpm', { ascending: false })
    .limit(limit);

  if (track_id) query = query.eq('track_id', track_id);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get personal best for a player
 */
export async function getPersonalBest(playerName) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('player_name', playerName)
    .order('wpm', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
}

