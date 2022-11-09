// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";
import { LeagueSettings } from "../../../classes/sleeper/LeagueSettings";
import { SleeperTransaction } from "../../../classes/sleeper/SleeperTransaction";
import { getLeague } from "../league/[league]";

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
  trades: SleeperTransaction[];
};

const tradeString = "trade";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { leagueId } = req.query;
  await runMiddleware(req, res, cors);

  if (leagueId) {
    const league = (await getLeague(leagueId.toString())) as LeagueSettings;
    const transactionPromises = getTradePromises(
      leagueId.toString(),
      league.settings.start_week,
      league.settings.leg
    );
    const transactions = (await Promise.all(
      transactionPromises
    )) as SleeperTransaction[][];
    const trades = transactions
      .flat()
      .filter((transaction) => transaction.type == tradeString);
    res.status(200).json({ trades: trades });
  } else {
    res.status(401).json({ trades: [] });
  }
}

// -------------------------------------------------------------------
// Gets all trades
// -------------------------------------------------------------------
function getTradePromises(
  leagueId: string,
  startWeek: number,
  endWeek: number
) {
  const promises = [];
  for (let i = startWeek; i <= endWeek; i++) {
    promises.push(
      new Promise((resolve) => {
        setTimeout(
          () =>
            resolve(
              fetch(
                `https://api.sleeper.app/v1/league/${leagueId}/transactions/${i}`
              ).then((response) => response.json())
            ),
          200
        );
      })
    );
  }

  return promises;
}
