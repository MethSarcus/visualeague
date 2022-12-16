import { NextApiRequest, NextApiResponse } from "next";
import { SleeperMatchup } from "../../../classes/sleeper/SleeperMatchup";
import { getMatchups } from "../league/[league]";

type Data = {
  matchups: SleeperMatchup[][] | string
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { leagueId } = req.query;
  try {
    if (leagueId?.length == 2) {
      let matchups = (await Promise.all(
        getMatchups(
          leagueId[0].toString() ?? "",
          parseInt(leagueId[1])
        )
      )) as SleeperMatchup[][];
    res.status(200).json({ matchups: matchups });
    } else {
      res.status(401).json({ matchups: "error occured" });
    }

  } catch (error) {
    res.status(401).json({ matchups: "error occured" });
  }
}