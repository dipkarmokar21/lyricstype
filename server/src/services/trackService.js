import supabase from '../config/supabase.js';

/**
 * Get all tracks, optionally filtered by tag
 */
export async function getAllTracks(tag = null) {
  let query = supabase.from('tracks').select('*').order('created_at', { ascending: false });
  if (tag) query = query.eq('tag', tag);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get a single track by ID
 */
export async function getTrackById(id) {
  const { data, error } = await supabase.from('tracks').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Create a custom track
 */
export async function createTrack({ title, artist, tag, youtube_id, lines }) {
  const { data, error } = await supabase
    .from('tracks')
    .insert({ title, artist, tag: tag || 'Custom', youtube_id, lines })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

