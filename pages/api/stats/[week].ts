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
    const { week } = req.query;
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), 'stats');
  //Read the json data file data.json
  const fileContents = await fs.readFile(jsonDirectory + `/2022/stats/week_${week}_stats.json`, 'utf8');
  //Return the content of the data file in json format
  res.status(200).json(fileContents);
}