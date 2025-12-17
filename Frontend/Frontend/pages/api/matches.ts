// pages/api/matches.ts
import cookie from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

import { convertObjectKeysToCamelCase } from "@utils";
import { supabaseInstance } from "@infrastructure";
import { EApiEndpoint, EApiError } from "@enums";
import { logApiError } from "./services/logger";

const apiRouteSecret = process.env.NEXT_PUBLIC_API_ROUTE_SECRET;

/**
 * Helper to safely read a query param that might be string | string[] | undefined
 */
function readSingleQueryParam(q: string | string[] | undefined): string | undefined {
  if (Array.isArray(q)) return q[0];
  return q;
}

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  try {
    if (request.headers.authorization !== apiRouteSecret) {
      logApiError(
        EApiEndpoint.MATCHES,
        EApiError.UNAUTHORIZED,
        "Invalid api route secret - request headers",
        request.headers
      );
      return response.status(401).send(EApiError.UNAUTHORIZED);
    }

    // This returns { user } or null
    const { user } = await supabaseInstance.auth.api.getUserByCookie(request);

    if (!user) {
      logApiError(
        EApiEndpoint.MATCHES,
        EApiError.UNAUTHORIZED,
        "No user data - request headers",
        request.headers
      );
      return response.status(401).send(EApiError.UNAUTHORIZED);
    }

    // Safely read limit/offset from query params (they may be arrays or undefined)
    const limitParam = readSingleQueryParam(request.query.limit);
    const offsetParam = readSingleQueryParam(request.query.offset);

    if (!limitParam || !offsetParam) {
      logApiError(
        EApiEndpoint.MATCHES,
        EApiError.BAD_REQUEST,
        "No limit or offset - request query",
        request.query
      );
      return response.status(400).send(EApiError.BAD_REQUEST);
    }

    // parse to integers with guarding
    const limitNum = Number.parseInt(limitParam, 10);
    const offsetNum = Number.parseInt(offsetParam, 10);
    if (Number.isNaN(limitNum) || Number.isNaN(offsetNum)) {
      logApiError(
        EApiEndpoint.MATCHES,
        EApiError.BAD_REQUEST,
        "limit/offset not numbers",
        { limitParam, offsetParam }
      );
      return response.status(400).send(EApiError.BAD_REQUEST);
    }

    // Read cookie safely
    const cookies = cookie.parse(request.headers.cookie || "");
    const tokenRaw = cookies["sb:token"];
    const token = typeof tokenRaw === "string" ? tokenRaw : undefined;

    if (!token) {
      logApiError(
        EApiEndpoint.MATCHES,
        EApiError.UNAUTHORIZED,
        "Missing auth token cookie",
        { cookies }
      );
      return response.status(401).send(EApiError.UNAUTHORIZED);
    }

    // Set supabase client session using the string token
    supabaseInstance.auth.session = () => ({
      user,
      token_type: "",
      access_token: token,
    });

    // Call the stored RPC (example keys - adapt if your RPC expects different names)
    const { data: matchesData, error: matchesError } = await supabaseInstance.rpc("matches", {
      profile_id_input: user.id,
      limit_input: limitNum,
      offset_input: offsetNum,
    });

    if (matchesError) {
      logApiError(EApiEndpoint.MATCHES, EApiError.INTERNAL_SERVER_ERROR, "Error", matchesError);
      return response.status(500).send(matchesError);
    }

    const parsedMatches = (matchesData || []).map(convertObjectKeysToCamelCase);

    return response.status(200).json(parsedMatches);
  } catch (err) {
    // Catch-all: log and return 500
    logApiError(EApiEndpoint.MATCHES, EApiError.INTERNAL_SERVER_ERROR, "Unhandled error", err);
    return response.status(500).send(EApiError.INTERNAL_SERVER_ERROR);
  }
};

export default handler;
