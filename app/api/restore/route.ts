import * as path from "node:path"
import { rename } from "node:fs/promises"
import { createWriteStream } from "node:fs"
import { NextRequest, NextResponse } from "next/server"
import { Readable } from "stream"
import { withAuth } from "@/lib/auth-guard"
import { v7 } from "uuid"
import { pipeline } from "node:stream/promises"
import { restoreDatabase } from "@/lib/db/backup-restore"

export async function POST(req: NextRequest) {
  const unauthorized = await withAuth({ admin: true })
  if (unauthorized) return unauthorized

  if (!req.body)
    return NextResponse.json({ error: "empty body" }, { status: 400 })

  const id = v7()
  const tmp = path.join("/tmp", `${id}.part`)
  const final = path.join("/tmp", id)

  await pipeline(Readable.fromWeb(req.body as any), createWriteStream(tmp), {
    signal: req.signal,
  })

  await rename(tmp, final)

  await restoreDatabase(final)

  return new NextResponse()
}
