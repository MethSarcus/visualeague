export interface TradeSettings {
  waiver_bid: number;
  seq: number;
  priority?: number;
  is_counter?: number;
  expires_at?: number;
}

export interface TradeMetadata {
  notes: string;
}

export interface TradeDraftPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
  league_id?: any;
}

export interface Adds { [key: string | number]: number }

export interface Drops { [key: string | number]: number }

export interface SleeperTransaction {
  waiver_budget: FaabTransfer[];
  type: string;
  transaction_id: string;
  status_updated: any;
  status: string;
  settings: TradeSettings;
  roster_ids: number[];
  metadata: TradeMetadata;
  leg: number;
  drops: Drops;
  draft_picks: TradeDraftPick[];
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