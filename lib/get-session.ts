"use server"

import { headers } from "next/headers"
import { createRemoteJWKSet, jwtVerify, RemoteJWKSet } from "jose"
import { auth } from "@/lib/auth"
import { env } from "@/lib/env"
import { readUser } from "@/lib/crud/users"
import { user } from "@/lib/db/auth-schema"
import { eq } from "drizzle-orm"

type SessionResult = typeof auth.$Infer.Session // { session, user }

let JWKS: RemoteJWKSet | undefined

async function resultFromJwt(token: string): Promise<SessionResult | null> {
  if (JWKS === undefined)
    JWKS = createRemoteJWKSet(new URL(`${env.BETTER_AUTH_URL}/api/auth/jwks`))

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: env.BETTER_AUTH_URL,
      audience: env.BETTER_AUTH_URL,
    })

    // definePayload: (sess) => ({ auth: sess }) puts { user, session } under `auth`
    const session = payload.auth as SessionResult

    // The token outlives role/active changes, so keep the account data fresh:
    // a demoted or deactivated user must lose access before the token expires.
    const currentUser = await readUser({
      where: eq(user.id, session.user.id),
      columns: { role: true, active: true },
    })
    if (!currentUser) return null

    return {
      ...session,
      user: {
        ...session.user,
        role: currentUser.role,
        active: currentUser.active,
      },
    }
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
