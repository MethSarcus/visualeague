import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { LeagueSettings } from "../../../interfaces/sleeper_api/LeagueSettings";
import SleeperLeague from "../../../interfaces/sleeper_api/custom/SleeperLeague";
import { SleeperPlayerDetails } from "../../../interfaces/sleeper_api/custom/Player";

const cors = Cors({
  methods: ["GET", "HEAD"],
});

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://methsarcus:<password>@cluster0.ertyk0m.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("players").collection("player_details");
  // perform actions on the collection object
  client.close();
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
  player: SleeperPlayerDetails;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { player } = req.query;
  await runMiddleware(req, res, cors);

  if (player) {
    const completeLeague = await getPlayer(league.toString());
    res.status(200).json({ league: completeLeague });
  } else {
    res.status(401).json({ league: new SleeperLeague([], {} as LeagueSettings, [], []) });
  }
}

async function getPlayer(playerId: string) {
    
}