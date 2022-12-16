import { NextApiRequest, NextApiResponse } from "next";
import { SleeperPlayerDetails } from "../../../../classes/custom/Player";
import { ScoringSettings } from "../../../../classes/sleeper/LeagueSettings";
import { connectToDatabase } from "../../../../lib/mongodb";
import { getMultiPlayerDetails, getMultiPlayerStats } from "../../player/[...player]";

type Data = {
  stats: object[] | string
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { players, week } = req.query;
  try {
    let playerDetails = await getMultiPlayerStats(connectToDatabase(), players as string[], parseInt(week as string))
    res.status(200).json({ stats: playerDetails as unknown as SleeperPlayerDetails[] });
  } catch (error) {
    res.status(401).json({ stats: "error occured" });
  }
}