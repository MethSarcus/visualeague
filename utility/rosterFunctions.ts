import { MatchupPlayer } from "../data_classes/MatchupPlayer";
import {
  LeagueSettings,
  ScoringSettings,
} from "../interfaces/sleeper_api/LeagueSettings";

export const getAllLeaguePositions = (leagues: LeagueSettings[]) => {
  var positions: POSITION[][] = [];
  leagues.forEach((league) => {
    league.roster_positions?.forEach((slot) => {
      positions.push(getRosterSlotPositions(slot));
    });
  });

  return [...new Set(positions.flat())];
};

//A function that takes in a sleeper roster slot designation and returns an array of positions that can fill that slot
export const getRosterSlotPositions = (slotId: string) => {
  switch (slotId) {
    case LINEUP_POSITION.QB: {
      return [POSITION.QB];
    }
    case LINEUP_POSITION.RB: {
      return [POSITION.RB];
    }
    case LINEUP_POSITION.WR: {
      return [POSITION.WR];
    }
    case LINEUP_POSITION.TE: {
      return [POSITION.TE];
    }
    case LINEUP_POSITION.DEF: {
      return [POSITION.DEF];
    }
    case LINEUP_POSITION.K: {
      return [POSITION.K];
    }
    case LINEUP_POSITION.DL: {
      return [POSITION.DL];
    }
    case LINEUP_POSITION.LB: {
      return [POSITION.LB];
    }
    case LINEUP_POSITION.DB: {
      return [POSITION.DB];
    }
    case LINEUP_POSITION.FLEX: {
      return [POSITION.RB, POSITION.WR, POSITION.TE];
    }
    case LINEUP_POSITION.WRRB_FLEX: {
      return [POSITION.RB, POSITION.WR];
    }
    case LINEUP_POSITION.REC_FLEX: {
      return [POSITION.WR, POSITION.TE];
    }
    case LINEUP_POSITION.SUPER_FLEX: {
      return [POSITION.QB, POSITION.RB, POSITION.WR, POSITION.TE];
    }

    case LINEUP_POSITION.IDP_FLEX: {
      return [POSITION.DL, POSITION.LB, POSITION.DB];
    }

    default: {
      return [];
    }
  }
};

//A function that takes in a sleeper roster slot designation and returns an array of positions that can fill that slot
export const getPositionRosterSlots = (slotId: string) => {
  switch (slotId) {
    case POSITION.QB: {
      return [LINEUP_POSITION.QB, LINEUP_POSITION.SUPER_FLEX];
    }
    case POSITION.RB: {
      return [LINEUP_POSITION.RB, LINEUP_POSITION.FLEX, LINEUP_POSITION.SUPER_FLEX, LINEUP_POSITION.WRRB_FLEX];
    }
    case POSITION.WR: {
      return [LINEUP_POSITION.WR, LINEUP_POSITION.FLEX, LINEUP_POSITION.SUPER_FLEX, LINEUP_POSITION.WRRB_FLEX, LINEUP_POSITION.REC_FLEX];
    }
    case POSITION.TE: {
      return [LINEUP_POSITION.TE, LINEUP_POSITION.FLEX, LINEUP_POSITION.SUPER_FLEX, LINEUP_POSITION.REC_FLEX];
    }
    case POSITION.DEF: {
      return [LINEUP_POSITION.DEF];
    }
    case POSITION.K: {
      return [LINEUP_POSITION.K];
    }
    case POSITION.DL: {
      return [LINEUP_POSITION.DL, LINEUP_POSITION.IDP_FLEX];
    }
    case POSITION.LB: {
      return [LINEUP_POSITION.LB, LINEUP_POSITION.IDP_FLEX];
    }
    case POSITION.DB: {
      return [LINEUP_POSITION.DB, LINEUP_POSITION.IDP_FLEX];
    }
    default: {
      return [];
    }
  }
};

export enum POSITION {
  QB = "QB",
  RB = "RB",
  WR = "WR",
  TE = "TE",
  DEF = "DEF",
  K = "K",
  DL = "DL",
  LB = "LB",
  DB = "DB",
}

export enum LINEUP_POSITION {
  QB = "QB",
  RB = "RB",
  WR = "WR",
  TE = "TE",
  DEF = "DEF",
  K = "K",
  DL = "DL",
  LB = "LB",
  DB = "DB",
  FLEX = "FLEX",
  WRRB_FLEX = "WRRB_FLEX",
  REC_FLEX = "REC_FLEX",
  SUPER_FLEX = "SUPER_FLEX",
  IDP_FLEX = "IDP_FLEX",
  BN = "BN",
  IR = "IR"
}

//A function that takes in a sleeper scoring settings json object and returns what type of receiving points are given
export const getLeagueReceptionScoringType = (
  leagueSettings: LeagueSettings
) => {
  const ppr = getVariablePPR(leagueSettings.scoring_settings);
  const qbNum =
    leagueSettings.roster_positions?.filter((pos) => {
      return pos == "SUPER_FLEX" || pos == POSITION.QB;
    }).length + "QB";
  var leagueType = "";
  switch (leagueSettings.settings.type) {
    case 0: {
      leagueType = "Redraft";
      break;
    }
    case 1: {
      leagueType = "Keeper";
      break;
    }
    case 2: {
      leagueType = "Dynasty";
      break;
    }
    default: {
      leagueType = "";
    }
  }

  const returnObj = {
    pprString: ppr,
    numQbString: qbNum,
    leagueTypeString: leagueType,
  };

  return returnObj;
};

//A function that takes in a sleeper scoring settings json object and returns what type of receiving points are given
export const getVariablePPR = (scoring_settings: ScoringSettings) => {
  var returnString = "";
  var bonusPos = "";
  const varRec = [
    scoring_settings.rec_0_4,
    scoring_settings.rec_5_9,
    scoring_settings.rec_10_19,
    scoring_settings.rec_20_29,
    scoring_settings.rec_30_39,
    scoring_settings.bonus_rec_rb,
    scoring_settings.bonus_rec_wr,
    scoring_settings.bonus_rec_te,
    scoring_settings.rec_40p,
  ]
    .filter((set) => {
      return set != null && set != undefined;
    })
    .reduce((partialSum, a) => partialSum! + a!, 0);

  if (
    scoring_settings.bonus_rec_rb != null &&
    scoring_settings.bonus_rec_rb > 0
  ) {
    bonusPos += "RB ";
  }

  if (
    scoring_settings.bonus_rec_wr != null &&
    scoring_settings.bonus_rec_wr > 0
  ) {
    bonusPos += "WR ";
  }

  if (
    scoring_settings.bonus_rec_te != null &&
    scoring_settings.bonus_rec_te > 0
  ) {
    bonusPos += "TE";
  }
  const positionRec = [
    scoring_settings.bonus_rec_rb,
    scoring_settings.bonus_rec_wr,
    scoring_settings.bonus_rec_te,
  ]
    .filter((set) => {
      return set != null && set != undefined;
    })
    .reduce((partialSum, a) => partialSum! + a!, 0);
  if (varRec && varRec > 0) {
    returnString += "V-PPR";
    if (positionRec && positionRec > 0) {
      returnString += " " + bonusPos + " Prem";
    }

    return returnString;
  } else if (scoring_settings.rec && scoring_settings.rec > 0) {
    returnString += scoring_settings.rec.toFixed(1) + " PPR";
    if (positionRec && positionRec > 0) {
      returnString += " " + bonusPos + " Prem";
    }

    return returnString;
  } else {
    returnString += "0 PPR";
    if (positionRec && positionRec > 0) {
      returnString += " " + bonusPos + " Prem";
    }

    return returnString;
  }
};


//Returns true if any position scores extra points for receptions
export const hasPremiumScoring = (scoring_settings: ScoringSettings) => {
  if (
    scoring_settings.bonus_rec_rb != null &&
    scoring_settings.bonus_rec_rb > 0
  ) {
    return true;
  } else if (
    scoring_settings.bonus_rec_wr != null &&
    scoring_settings.bonus_rec_wr > 0
  ) {
    return true;
  } else if (
    scoring_settings.bonus_rec_te != null &&
    scoring_settings.bonus_rec_te > 0
  ) {
    return true;
  } else {
    return false;
  }
};

//returns true if points are different based on length of reception
export const hasVariablePPR = (scoring_settings: ScoringSettings) => {
  const varRec = [
    scoring_settings.rec_0_4,
    scoring_settings.rec_5_9,
    scoring_settings.rec_10_19,
    scoring_settings.rec_20_29,
    scoring_settings.rec_30_39,
    scoring_settings.rec_40p,
  ]
    .filter((set) => {
      return set != null && set != undefined;
    })
    .reduce((partialSum, a) => partialSum! + a!, 0);

  if (varRec && varRec > 0) {
    return true;
  } else {
    return false;
  }
};

export function getOptimalLineup(players: MatchupPlayer[], starterPositions: LINEUP_POSITION[]) {
  let optimalLineup: MatchupPlayer[] = []
  players = players.sort((a: MatchupPlayer, b: MatchupPlayer) => {
    if (a.score < b.score) {
      return 1
    } else if (a.score > b.score) {
      return -1
    } else {
      return 0
    }
  })

  starterPositions.forEach((position) => {
    let eligiblePlayers = players.filter(player => {
      if (optimalLineup.includes(player) || !getPositionRosterSlots(player.eligiblePositions?.at(0) as LINEUP_POSITION).includes(position)) {
        return false
      } else {
        return true
      }
    })

    optimalLineup.push(eligiblePlayers[0])
  })

  return optimalLineup
}

export function getOptimalProjectedLineup(players: MatchupPlayer[], starterPositions: LINEUP_POSITION[]) {
  let optimalLineup: MatchupPlayer[] = []
  players = players.sort((a: MatchupPlayer, b: MatchupPlayer) => {
    if (a.projectedScore < b.projectedScore) {
      return 1
    } else if (a.projectedScore > b.projectedScore) {
      return -1
    } else {
      return 0
    }
  })

  starterPositions.forEach((position) => {
    let eligiblePlayers = players.filter(player => {
      if (optimalLineup.includes(player) || !getPositionRosterSlots(player.eligiblePositions?.at(0) as LINEUP_POSITION).includes(position)) {
        return false
      } else {
        return true
      }
    })

    optimalLineup.push(eligiblePlayers[0])
  })

  return optimalLineup
}

function getEligiblePlayersForSlot(players: MatchupPlayer[], position: POSITION) {
  let eligiblePlayers: MatchupPlayer[] = []
  players.forEach(player => {
    if (player.eligiblePositions?.includes(position)) {
      eligiblePlayers.push(player)
    }
  })

  return eligiblePlayers

}
