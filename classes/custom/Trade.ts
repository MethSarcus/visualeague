import {
  Adds,
  Drops,
  FaabTransfer,
  SleeperTransaction,
  TradeSettings,
  TradeMetadata,
  TradeDraftPick,
} from "../sleeper/SleeperTransaction";

export default class Trade implements SleeperTransaction {
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
  playersTraded: Set<string> = new Set()
  creator: string;
  created: any;
  consenter_ids: number[];
  adds: Adds;
  biggestPointDifferential = 0
  biggestTradeScore = 0

  memberNetPoints = new Map<number, number>();
  memberTradeScore = new Map<number, number>();
  playerScoresSinceTrade = new Map<string, number>();

  constructor(transaction: SleeperTransaction) {
    this.waiver_budget = transaction.waiver_budget;
    this.type = transaction.type;
    this.transaction_id = transaction.transaction_id;
    this.status_updated = transaction.status_updated;
    this.status = transaction.status;
    this.roster_ids = transaction.roster_ids;
    this.leg = transaction.leg;
    this.drops = transaction.drops;
    this.draft_picks = transaction.draft_picks;
    this.creator = transaction.creator;
    this.consenter_ids = transaction.consenter_ids;
    this.adds = transaction.adds;
    this.settings = transaction.settings;
    this.metadata = transaction.metadata;
    this.created = transaction.created;

    this.consenter_ids.forEach((id) => {
      this.memberNetPoints.set(id, 0);
      
    });

    if (transaction.adds != null) {
        for (const [playerid, rosterid] of Object.entries(transaction.adds)) {
            this.playerScoresSinceTrade.set(playerid, 0)
            this.playersTraded.add(playerid)
        }
    }
  }

  addPlayerScore(player_id: string, score: number) {
    let curScore = this.playerScoresSinceTrade.get(player_id) ?? 0
    this.playerScoresSinceTrade.set(player_id, curScore + score)
  }

  setMemberPlayerDifferential() {
    this.playerScoresSinceTrade.forEach((score, player_id) => {
        let newOwnerId = this.adds[player_id] as number
        let newOwnerScore = this.memberNetPoints.get(newOwnerId)! + score
        let oldOwnerId = this.drops[player_id] as number
        let oldOwnerScore = this.memberNetPoints.get(oldOwnerId)! - score

        this.memberNetPoints.set(newOwnerId, newOwnerScore)
        this.memberNetPoints.set(oldOwnerId, oldOwnerScore)
    })

    this.memberNetPoints.forEach((points, memberId) => {
        let tradeValue = 0
        let numAllPlayers: number = Object.entries(this.adds).length

        this.memberTradeScore.set(memberId, tradeValue)
    })
    this.getWorstDifferential()
  }

  getWorstDifferential() {
    this.memberNetPoints.forEach((points, id) => {
        if (Math.abs(points) > this.biggestPointDifferential) {
            this.biggestPointDifferential = Math.abs(points)
        }
    })
  }
}
