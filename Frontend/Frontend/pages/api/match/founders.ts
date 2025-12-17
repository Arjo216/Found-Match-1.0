// pages/api/match/founders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { founders } from "../../../data/seed";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET -> return feed
  return res.status(200).json(founders);
}
