import { NextApiRequest, NextApiResponse } from "next";
import { SleeperPlayerDetails } from "../../../classes/custom/Player";
import { getMultiPlayerDetails } from "../player/[...player]";

const { connectToDatabase } = require("../../../lib/mongodb");

type Data = {
  details: SleeperPlayerDetails[] | string
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { player } = req.query;
  try {
    let playerDetails = await getMultiPlayerDetails(connectToDatabase(), player as string[])
    res.status(200).json({ details: playerDetails as unknown as SleeperPlayerDetails[] });
  } catch (error) {
    res.status(401).json({ details: "error occured" });
  }
}