export interface Settings {
  waiver_bid: number;
  seq: number;
  priority?: number;
  is_counter?: number;
  expires_at?: number;
}

export interface Metadata {
  notes: string;
}

export interface DraftPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
  league_id?: any;
}

export interface SleeperTransaction {
  waiver_budget: any[];
  type: string;
  transaction_id: string;
  status_updated: any;
  status: string;
  settings: Settings;
  roster_ids: number[];
  metadata: Metadata;
  leg: number;
  drops: Map<string, number>;
  draft_picks: DraftPick[];
  creator: string;
  created: any;
  consenter_ids: number[];
  adds: Map<string, number>;
}
