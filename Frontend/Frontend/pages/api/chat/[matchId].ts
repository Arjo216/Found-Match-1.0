// pages/api/chat/[matchId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { conversations } from "../../../data/seed";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { matchId } = req.query;
  const conv = conversations.find(c => c.id === matchId);

  if (!conv) return res.status(404).json({ error: "Not found" });

  if (req.method === "GET") {
    return res.status(200).json(conv.messages || []);
  }

  if (req.method === "POST") {
    const { text } = req.body || {};
    if (text) {
      conv.messages.push({ from: "me", text });
      conv.last = text;
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: "no text" });
  }

  res.status(405).end();
}
