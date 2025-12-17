// pages/api/match/undo.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // in a real backend you'd restore the record
    return res.status(200).json({ ok: true });
  }
  res.status(405).end();
}
