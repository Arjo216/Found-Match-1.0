// pages/api/match/index.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Lightweight proxy to the backend /match/ endpoint.
 * - Forwards query string
 * - Forwards Authorization header and cookies (so cookie-based auth works)
 * - Forwards status + JSON/text body back to the client
 *
 * Configure BACKEND_URL in your env if your FastAPI runs on a non-default host/port.
 */
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    // Build backend URL (forward query params)
    const url = new URL("/match/", BACKEND_URL);
    Object.entries(req.query || {}).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });

    // Forward useful headers (auth/cookies)
    const headers: Record<string, string> = {};
    if (req.headers.authorization) headers["authorization"] = String(req.headers.authorization);
    //if (req.headers.cookie) headers["cookie"] = String(req.headers.cookie);

    // Do the backend request
    const backendRes = await fetch(url.toString(), {
      method: "GET",
      headers,
      // 'credentials' is irrelevant for server fetch, cookies forwarded via header
    });

    const text = await backendRes.text();
    const contentType = backendRes.headers.get("content-type") || "";

    // Propagate status
    res.status(backendRes.status);

    // Return JSON if possible, otherwise return raw text
    if (contentType.includes("application/json")) {
      try {
        const json = JSON.parse(text);
        return res.json(json);
      } catch (e) {
        // invalid JSON — return text fallback
        res.setHeader("content-type", "application/json");
        return res.send(text);
      }
    } else {
      if (contentType) res.setHeader("content-type", contentType);
      return res.send(text);
    }
  } catch (err) {
    console.error("Proxy /api/match error:", err);
    return res.status(500).json({ error: "proxy_failed", detail: String(err) });
  }
}
