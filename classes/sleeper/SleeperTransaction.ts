interface Settings {
  waiver_bid: number;
  seq: number;
  priority?: number;
  is_counter?: number;
  expires_at?: number;
}

interface Metadata {
  notes: string;
}

interface DraftPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
  league_id?: any;
}

export interface Adds { [key: string | number]: string | number }

export interface Drops { [key: string | number]: string | number }

export interface SleeperTransaction {
  waiver_budget: FaabTransfer[];
  type: string;
  transaction_id: string;
  status_updated: any;
  status: string;
  settings: Settings;
  roster_ids: number[];
  metadata: Metadata;
  leg: number;
  drops: Drops;
  draft_picks: DraftPick[];
  creator: string;
  created: any;
  consenter_ids: number[];
  adds: Adds;
}

export interface FaabTransfer {
  sender: number
  receiver: number
  amount: number
}