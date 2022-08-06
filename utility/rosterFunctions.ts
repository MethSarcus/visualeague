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
    case POSITION.QB: {
      return [POSITION.QB];
    }
    case POSITION.RB: {
      return [POSITION.RB];
    }
    case POSITION.WR: {
      return [POSITION.WR];
    }
    case POSITION.TE: {
      return [POSITION.TE];
    }
    case POSITION.DEF: {
      return [POSITION.DEF];
    }
    case POSITION.K: {
      return [POSITION.K];
    }
    case POSITION.DL: {
      return [POSITION.DL];
    }
    case POSITION.LB: {
      return [POSITION.LB];
    }
    case POSITION.DB: {
      return [POSITION.DB];
    }
    case "FLEX": {
      return [POSITION.RB, POSITION.WR, POSITION.TE];
    }
    case "WRRB_FLEX": {
      return [POSITION.RB, POSITION.WR];
    }
    case "REC_FLEX": {
      return [POSITION.WR, POSITION.TE];
    }
    case "SUPER_FLEX": {
      return [POSITION.QB, POSITION.RB, POSITION.WR, POSITION.TE];
    }

    case "IDP_FLEX": {
      return [POSITION.DL, POSITION.LB, POSITION.DB];
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

export enum FLEXES {}

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
  } else if (scoring_settings.rec > 0) {
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
