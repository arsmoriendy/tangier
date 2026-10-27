"use server"

import { headers } from "next/headers"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { auth } from "@/lib/auth"
import { env } from "@/lib/env"

type SessionResult = typeof auth.$Infer.Session // { session, user }

const JWKS = createRemoteJWKSet(new URL(`${env.BETTER_AUTH_URL}/api/auth/jwks`))

async function resultFromJwt(token: string): Promise<SessionResult | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: env.BETTER_AUTH_URL,
      audience: env.BETTER_AUTH_URL,
    })

    // definePayload: (sess) => ({ auth: sess }) puts { user, session } under `auth`
    const session = payload.auth as SessionResult

    return session
  } catch {
    return null // bad signature, expired, wrong issuer/audience, unknown kid
  }
}

export async function getSession(): Promise<SessionResult | null> {
  const h = await headers()

  const authHeader = h.get("authorization")
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const fromJwt = await resultFromJwt(authHeader.slice(7).trim())
    if (fromJwt) return fromJwt
  }

  // Cookie or bearer session token (database-backed)
  const session = await auth.api.getSession({ headers: h })
  return session ? session : null
}
