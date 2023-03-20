import path from 'path';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';


type Data = {
    stats: string | undefined;
  };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
  ){
    const { season, week } = req.query;
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), 'stats');
  //Read the json data file data.json
  try {
    const fileContents = await fs.readFile(jsonDirectory + `/${season}/stats/week_${week}_stats.json`, 'utf8');
    //Return the content of the data file in json format
    res.status(200).json(fileContents);
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      res.status(404).json("Season does not exist")
    } else {
      res.status(404).json(e.code)
    }
  }

}