// pages/api/match/swipe.ts
import type { NextApiRequest, NextApiResponse } from "next";

// NOTE: simple mock: accept POST and respond ok (no persistent DB)
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // you can inspect req.body { target_id, liked, type }
    return res.status(200).json({ ok: true });
  }
  res.status(405).end();
}
