import { NextApiRequest, NextApiResponse } from "next";
import { SleeperPlayerDetails } from "../../../classes/custom/Player";
import type { MongoClient } from "mongodb";

const { connectToDatabase } = require("../../../lib/mongodb");

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
  } else if (player?.length == 3) {
    let playerId = player[0];
    let season = player[1]
    let weekNumber = player[2];


    const playerDetails = await getPlayerStats(
      connectToDatabase(),
      playerId as string,
      season as unknown as number,
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
  connectToDatabase: Promise<MongoClient>,
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

    const player = await collection.findOne(query);
    return player?.details ?? player;
  } catch (err) {
    console.log(err);
  }
}

export async function getPlayerStats(
  connectToDatabase: Promise<MongoClient>,
  playerId: string,
  season: number,
  week: number
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(season.toString());

    let projections = db.collection(`week_${week}_stats`);
    let query = { _id: playerId };

    let projection = await projections.findOne(query);
    return projection;
  } catch (err) {
    console.log(err);
  }
}


export async function getPlayerProjections(
  connectToDatabase: Promise<MongoClient>,
  playerId: string,
  season: number,
  week: number
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(season.toString());

    let projections = db.collection(`week_${week}_projections`);
    let query = { _id: playerId };

    let projection = await projections.findOne(query);
    return projection;
  } catch (err) {
    console.log(err);
  }
}

export async function getMultiPlayerProjections(
  connectToDatabase: Promise<MongoClient>,
  playerIds: string[],
  week: number,
  season: number
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(`${season}`);

    let projections = db.collection(`week_${week}_projections`);
    let query = { _id: { $in: playerIds } };
    let projection = await projections.find(query).toArray();
    return projection;
  } catch (err) {
    console.log(err);
  }
}

export async function getMultiPlayerStats(
  connectToDatabase: Promise<MongoClient>,
  playerIds: string[],
  season: number,
  week: number
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(`${season}`);

    let weekData = db.collection(`week_${week}_stats`);
    let query = { _id: { $in: playerIds } };
    let data = await weekData.find(query).toArray();
    return data;
  } catch (err) {
    console.log(err);
  }
}

export async function getMultiPlayerDetails(
  connectToDatabase: Promise<MongoClient>,
  playerIds: string[],
  season: string,
  startWeek: number,
  endWeek: number,
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(`${season}`);

    let details = db.collection("player_details");

    let query = { _id: { $in: playerIds } };
    const projection: Record<string, 1> = {
      "details.fantasy_positions": 1,
      "details.position": 1,
      "details.last_name": 1,
      "details.first_name": 1,
      "details.player_id": 1,
      "details.team": 1,
      "details.age": 1,
      "details.ktc": 1,
    }
    for (let week = startWeek; week <= endWeek; week++) {
      projection[`stats.${week}`] = 1
      projection[`projections.${week}`] = 1
    }

    const playerDetails = await details.find(query, {projection}).toArray();
    return playerDetails;
  } catch (err) {
    console.log(err);
  }
}

export async function getWeeklyPlayerStats(
  connectToDatabase: Promise<MongoClient>,
  playerIds: string[],
  season: string,
  startWeek: number,
  endWeek: number
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(`${season}`);
    let weeks = [];
    for (var i = startWeek; i <= endWeek; i++) {
        weeks.push(i);
    }
    let query = { _id: { $in: playerIds } };

    return Promise.all(weeks.map(weekNumber => {
      return db.collection(`week_${weekNumber}_stats`)
        .find(query)
        .toArray()
    }))
  } catch (err) {
    console.log(err);
  }
}
