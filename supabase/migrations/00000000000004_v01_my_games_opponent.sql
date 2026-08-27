-- V0.1 Milestone D: extend `my_games` with the opponent's identity so the
-- Home screen doesn't need to compose 3 client-side queries per game row.
--
-- Classic games always have exactly 2 players (GAME_RULES.md section 4), so
-- "the other participant" is unambiguous. Like every other view here, this
-- one does its own explicit auth.uid() filtering rather than relying on the
-- base tables' RLS being enforced during the view's execution (see
-- docs/DECISIONS.md / DATABASE.md for why).

create or replace view public.my_games as
select
  g.*,
  (g.status = 'active' and g.current_turn_player_id = auth.uid()) as is_my_turn,
  opp.player_id as opponent_id,
  p.username as opponent_username
from public.games_public g
join public.game_players_public gp on gp.game_id = g.id and gp.player_id = auth.uid()
join public.game_players_public opp on opp.game_id = g.id and opp.player_id <> auth.uid()
join public.profiles p on p.id = opp.player_id
where gp.player_id = auth.uid();
