import { getSupabase } from './supabase';

export interface MyGameRow {
  id: string;
  status: 'pending' | 'active' | 'completed';
  tempo: string;
  turn_duration_hours: number | null;
  tile_bag_remaining: number;
  current_turn_player_id: string | null;
  end_reason: string | null;
  created_at: string;
  is_my_turn: boolean;
  opponent_id: string;
  opponent_username: string;
}

export function fetchMyGames() {
  return getSupabase()
    .from('my_games')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<MyGameRow[]>();
}

export function fetchMyGame(gameId: string) {
  return getSupabase().from('my_games').select('*').eq('id', gameId).maybeSingle<MyGameRow>();
}
