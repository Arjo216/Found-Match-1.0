// pages/api/users/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { users } from "../../../data/seed";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json(users.me);
  if (req.method === "PUT") {
    users.me = { ...users.me, ...(req.body || {}) };
    return res.status(200).json(users.me);
  }
  res.status(405).end();
}
