// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { LeagueSettings } from "../../../interfaces/sleeper_api/LeagueSettings";
import SleeperLeague from "../../../interfaces/sleeper_api/custom/SleeperLeague";
import { SleeperUser } from "../../../interfaces/sleeper_api/SleeperUser";
import { SleeperMatchup } from "../../../interfaces/sleeper_api/SleeperMatchup";
import { SleeperRoster } from "../../../interfaces/sleeper_api/SleeperRoster";
import { getPlayerProjections, getPlayerStats } from "../player/[...player]";
const { connectToDatabase } = require("../../../lib/mongodb");
const { MongoClient } = require("mongodb");

const cors = Cors({
  methods: ["GET", "HEAD"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

type Data = {
  league: SleeperLeague;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { league } = req.query;
  await runMiddleware(req, res, cors);

  if (league) {
    const completeLeague = await getCompleteLeague(league.toString());
    res.status(200).json({ league: completeLeague });
  } else {
    res
      .status(401)
      .json({ league: new SleeperLeague([], {} as LeagueSettings, [], [], []) });
  }
}

// -------------------------------------------------------------------
// these functions retrieve all draft picks for all a user
// -------------------------------------------------------------------
function getLeague(leagueId: string) {
  // gets league details
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          fetch(`https://api.sleeper.app/v1/league/${leagueId}/`).then(
            (response) => response.json()
          )
        ),
      200
    );
  });
}

// -------------------------------------------------------------------
// Gets all members of a league
// -------------------------------------------------------------------
function getLeagueMembers(leagueId: string) {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`).then(
            (response) => response.json()
          )
        ),
      200
    );
  });
}

// -------------------------------------------------------------------
// Gets all rosters for a league
// -------------------------------------------------------------------
function getLeagueRosters(leagueId: string) {
  // gets league details
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`).then(
            (response) => response.json()
          )
        ),
      200
    );
  });
}

// -------------------------------------------------------------------
// Gets all matchups
// -------------------------------------------------------------------
function getMatchups(leagueId: string, numWeeks: number) {
  const promises = [];
  for (let i = 1; i <= numWeeks; i++) {
    promises.push(
      new Promise((resolve) => {
        setTimeout(
          () =>
            resolve(
              fetch(
                `https://api.sleeper.app/v1/league/${leagueId}/matchups/${i}`
              ).then((response) => response.json())
            ),
          200
        );
      })
    );
  }

  return promises;
}

// -------------------------------------------------------------------
// Gets all matchups
// -------------------------------------------------------------------
function getStats(connectToDatabase: typeof MongoClient, playerIds: string[], week: number) {
  const promises: Promise<unknown>[] = [];
  playerIds.forEach((playerId) => {
    promises.push(
      new Promise((resolve) => {
        setTimeout(
          () =>
            resolve(
              getPlayerProjections(connectToDatabase, playerId, week)),
          200
        );
      })
    )
  })

  return promises;
}

function getMatchup(leagueId: string, week: number) {
  // get matchup for given week in given league
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          fetch(
            `https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`
          ).then((response) => response.json())
        ),
      200
    );
  });
}

function getPlayer( connectToDatabase: typeof MongoClient,
  playerId: string,
  week: number) {
  // get matchup for given week in given league
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          getPlayerStats(
            connectToDatabase, playerId, week
          )
        ),
      200
    );
  });
}

async function getMatchupStat(matchup: SleeperMatchup[], db: typeof MongoClient, weekNum: number) {
    const playerPromises: Promise<{ player_stats: any; player_projections: any; } | undefined>[] = [];
    matchup.flat().forEach((matchup) => {
      matchup.players.forEach(player => {
        playerPromises.push(getPlayerProjections(db, player, weekNum));
      });
      
    });

  return playerPromises;
}

async function getMatchupStats(matchups: SleeperMatchup[][], db: typeof MongoClient) {
  const playerStats: Map<number, any> = new Map();
  matchups.forEach(async (weeklyMatchup, index) => {
    let weekNum = index + 1;
    let playerList: string[][] = [];
    weeklyMatchup.forEach((matchup) => {
      playerList.push(matchup.players)
    });
    let playerStatsObj = (getStats(db, playerList.flat(), weekNum));

    console.log(playerStatsObj);
    playerStats.set(weekNum, await Promise.all(playerStatsObj));

  });
  console.log(playerStats)
  return playerStats;
}

async function getCompleteLeague(leagueId: string) {
  const leagueSettings = await getLeague(leagueId);
  const leagueUsers = await getLeagueMembers(leagueId);
  const leagueRosters = await getLeagueRosters(leagueId);
  let playerStats: any;
  let db = connectToDatabase();

  // instead of awaiting this call, create an array of Promises
  const matchups = (await Promise.all(
    getMatchups(leagueId, (leagueSettings as LeagueSettings).settings.last_scored_leg)
  )) as SleeperMatchup[][];
  playerStats = (await getMatchupStat(matchups[0], db, 1));

  console.log(playerStats);

  // use await on Promise.all so the Promises execute in parallel
  return new SleeperLeague(
    leagueUsers as SleeperUser[],
    leagueSettings as LeagueSettings,
    matchups.flat() as SleeperMatchup[],
    leagueRosters as SleeperRoster[],
    await (Promise.all(playerStats))
  );
}
