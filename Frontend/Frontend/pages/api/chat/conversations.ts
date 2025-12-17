// pages/api/chat/conversations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { conversations } from "../../../data/seed";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json(conversations.map(c => ({ id: c.id, title: c.title, last: c.last })));
}
