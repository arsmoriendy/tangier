import { dumpDatabase } from "@/lib/db/backup-restore"
import { basename } from "node:path"
import { stat, unlink } from "node:fs/promises"
import { createReadStream } from "node:fs"
import { after, NextResponse } from "next/server"
import { Readable } from "stream"
import { withAuth } from "@/lib/auth-guard"

export async function GET() {
  const unauthorized = await withAuth({ admin: true })
  if (unauthorized) return unauthorized

  const dumpfile = await dumpDatabase()
  const { size } = await stat(dumpfile)
  const readableWebStream = Readable.toWeb(createReadStream(dumpfile))
  const headers = {
    "Content-Type": "application/sql",
    "Content-Length": size.toString(),
    "Content-Disposition": `attachment; filename="${basename(dumpfile)}"`,
  }

  after(async () => await unlink(dumpfile))

  return new NextResponse(readableWebStream as ReadableStream, {
    headers,
  })
}
