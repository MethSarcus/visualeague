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
  playersTraded: Set<string> = new Set();
  creator: string;
  created: any;
  consenter_ids: number[];
  adds: Adds;
  biggestPointDifferential = 0;
  biggestTradeScoreDifferential = 0;
  numPlayersTraded: Map<number, number> = new Map();

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
      this.numPlayersTraded.set(id, 0);
    });

    if (transaction.adds != null) {
      for (const [playerid, rosterid] of Object.entries(transaction.adds)) {
        this.playerScoresSinceTrade.set(playerid, 0);
        this.playersTraded.add(playerid);
        let curNumPlayersTraded = this.numPlayersTraded.get(rosterid);
        this.numPlayersTraded.set(rosterid, (curNumPlayersTraded ?? 0) + 1);
      }
    }
  }

  addPlayerScore(player_id: string, score: number) {
    let curScore = this.playerScoresSinceTrade.get(player_id) ?? 0;
    this.playerScoresSinceTrade.set(player_id, curScore + score);
  }

  setMemberPlayerDifferential() {
    this.playerScoresSinceTrade.forEach((score, player_id) => {
      let newOwnerId = this.adds[player_id];
      let newOwnerScore = this.memberNetPoints.get(newOwnerId)! + score;
      let oldOwnerId = this.drops[player_id];
      let oldOwnerScore = this.memberNetPoints.get(oldOwnerId)! - score;

      this.memberNetPoints.set(newOwnerId, newOwnerScore);
      this.memberNetPoints.set(oldOwnerId, oldOwnerScore);
    });

    this.memberNetPoints.forEach((points, rosterId) => {
      let numAllPlayers: number = this.playersTraded.size;
      let numPlayersTraded = this.numPlayersTraded.get(rosterId);

      if (numPlayersTraded != undefined) {
        this.memberTradeScore.set(
          rosterId,
          this.calcTradeScore(numAllPlayers, numPlayersTraded, points)
        );
      }
    });
    this.getWorstDifferential();
    this.getWorstTradeScoreDifferential()
  }

  getWorstDifferential() {
    this.memberNetPoints.forEach((points, id) => {
      if (Math.abs(points) > this.biggestPointDifferential) {
        this.biggestPointDifferential = Math.abs(points);
      }
    });
  }

  getWorstTradeScoreDifferential() {
    this.memberTradeScore.forEach((points, id) => {
      if (Math.abs(points) > this.biggestTradeScoreDifferential) {
        this.biggestTradeScoreDifferential = Math.abs(points);
      }
    });
  }

  calcTradeScore(totalPlayers: number, numTraded: number, pf: number) {
    return (totalPlayers / numTraded) * pf;
  }
}
