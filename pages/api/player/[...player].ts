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
  } else if (player?.length == 3) {
    let playerId = player[0];
    let season = player[1]
    let weekNumber = player[2];


    const playerDetails = await getPlayerStats(
      connectToDatabase(),
      playerId as string,
      weekNumber as unknown as number,
      season as unknown as number
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
    return res.stats;
  } catch (err) {
    console.log(err);
  }
}

export async function getPlayerStats(
  connectToDatabase: typeof MongoClient,
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
  connectToDatabase: typeof MongoClient,
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
  connectToDatabase: typeof MongoClient,
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
  connectToDatabase: typeof MongoClient,
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

    let weekData = db.collection(`week_${week}`);
    let query = { _id: { $in: playerIds } };
    let data = await weekData.find(query).toArray();
    return data;
  } catch (err) {
    console.log(err);
  }
}

export async function getMultiPlayerDetails(
  connectToDatabase: typeof MongoClient,
  playerIds: string[],
  season: string,
) {
  const client = await connectToDatabase;
  if (!client) {
    return;
  }

  try {
    const db = client.db(`${season}`);

    let details = db.collection("player_details");

    let query = { _id: { $in: playerIds } };
    let projectionQuery = {
      projection: {
        "details.fantasy_positions": 1,
        "details.position": 1,
        "details.last_name": 1,
        "details.first_name": 1,
        "details.player_id": 1,
        "details.team": 1,
        "details.age": 1,
        "details.ktc": 1,
        "stats": 1,
        "projections": 1,
      },
    };
    let playerDetails = await details.find(query, projectionQuery).toArray();
    return playerDetails;
  } catch (err) {
    console.log(err);
  }
}

export async function getWeeklyPlayerStats(
  connectToDatabase: typeof MongoClient,
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

    await Promise.all(weeks.map(weekNumber => {
      return db.collection(`week_${weekNumber}`)
        .find(query)
        .toArray()
    }));

    return weeks
  } catch (err) {
    console.log(err);
  }
}
