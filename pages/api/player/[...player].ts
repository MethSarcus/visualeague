import { NextApiRequest, NextApiResponse } from "next";
import { SleeperPlayerDetails } from "../../../classes/custom/Player";

const { connectToDatabase } = require("../../../lib/mongodb");
const { MongoClient } = require("mongodb");

type Data = {
  details: SleeperPlayerDetails | string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { player } = req.query;
  if (player?.length == 1) {
    const playerDetails = await getPlayerDetails(
      connectToDatabase(),
      player[0] as string
    );

    res
      .status(200)
      .json({ details: playerDetails as unknown as SleeperPlayerDetails });
  } else if (player?.length == 2) {
    let playerId = player[0];
    let weekNumber = player[1];

    const playerDetails = await getPlayerStats(
      connectToDatabase(),
      playerId as string,
      weekNumber as unknown as number
    );
    res
      .status(200)
      .json({ details: playerDetails as unknown as SleeperPlayerDetails });
  } else {
    res.status(401).json({ details: "error occured" });
  }
}

export async function getPlayerDetails(
  connectToDatabase: typeof MongoClient,
  playerId: string
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db("players");

    let collection = db.collection("player_details");

    let query = { _id: playerId };

    let res = await collection.findOne(query);
    return res.details;
  } catch (err) {
    console.log(err);
  }
}

export async function getPlayerStats(
  connectToDatabase: typeof MongoClient,
  playerId: string,
  week: number
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(`week_${week}`);

    let stats = db.collection("player_stats");
    let projections = db.collection("player_projections");
    let query = { _id: playerId };

    let stat = await stats.findOne(query);
    let projection = await projections.findOne(query);
    return {player_stats: stat, player_projections: projection};
  } catch (err) {
    console.log(err);
  }
}

export async function getPlayerProjections(
  connectToDatabase: typeof MongoClient,
  playerId: string,
  week: number
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(`week_${week}`);

    let projections = db.collection("player_projections");
    let query = { _id: playerId };

    let projection = await projections.findOne(query);
    return projection;
  } catch (err) {
    console.log(err);
  }
}

export async function getMultiPlayerProjections(
  connectToDatabase: typeof MongoClient,
  playerIds: string[],
  week: number
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(`week_${week}`);

    let projections = db.collection("player_projections");
    let query = {_id:{$in:playerIds}};
    let projection = await projections.find(query).toArray()
    return projection;
  } catch (err) {
    console.log(err);
  }
}

export async function getMultiPlayerStats(
  connectToDatabase: typeof MongoClient,
  playerIds: string[],
  week: number
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(`week_${week}`);

    let projections = db.collection("player_stats");
    let query = {_id:{$in:playerIds}};
    let projection = await projections.find(query).toArray()
    return projection;
  } catch (err) {
    console.log(err);
  }
}

export async function getMultiPlayerDetails(
  connectToDatabase: typeof MongoClient,
  playerIds: string[]
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(`players`);

    let details = db.collection("player_details");
    let query = {_id:{$in:playerIds}};
    let detail = await details.find(query).toArray()
    return detail;
  } catch (err) {
    console.log(err);
  }
}
