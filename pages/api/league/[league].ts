// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { LeagueSettings } from "../../../interfaces/sleeper_api/LeagueSettings";
import League from "../../../interfaces/sleeper_api/custom/League";
import { SleeperUser } from "../../../interfaces/sleeper_api/SleeperUser";
import { SleeperMatchup } from "../../../interfaces/sleeper_api/SleeperMatchup";
import { SleeperRoster } from "../../../interfaces/sleeper_api/SleeperRoster";

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
  league: League;
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
    res.status(401).json({ league: new League([], {} as LeagueSettings, [], []) });
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
  })
}

async function getCompleteLeague(leagueId: string) {
  const leagueSettings = await getLeague(leagueId);
  const leagueUsers = await getLeagueMembers(leagueId);
  const leagueRosters = await getLeagueRosters(leagueId);

  // instead of awaiting this call, create an array of Promises
  const matchups = await Promise.all(
    getMatchups(leagueId, (leagueSettings as LeagueSettings).settings.leg)
  );

  console.log(matchups);

  // use await on Promise.all so the Promises execute in parallel
  return new League(
    leagueUsers as SleeperUser[],
    leagueSettings as LeagueSettings,
    matchups as SleeperMatchup[],
    leagueRosters as SleeperRoster[]
  );
}
