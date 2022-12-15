export interface Settings {
  wins: number;
  waiver_position: number;
  waiver_budget_used: number;
  total_moves: number;
  ties: number;
  rank: number;
  ppts_decimal: number;
  ppts: number;
  losses: number;
  fpts_decimal: number;
  fpts_against_decimal: number;
  fpts_against: number;
  fpts: number;
  division: number;
}
export interface Metadata {
  streak: string;
  record: string;
  league_name: string;
  league_description: string;
  league_avatar: string;
  allow_pn_scoring: string;
  allow_pn_news: string;
  restrict_pn_scoring_starters_only: string;
}

export interface SleeperRoster {
  taxi: string[];
  starters: string[];
  settings: Settings;
  roster_id: number;
  reserve: string[];
  players: string[];
  player_map?: any;
  owner_id: string;
  metadata: Metadata;
  league_id: string;
  keepers?: any;
  co_owners?: any;
}
