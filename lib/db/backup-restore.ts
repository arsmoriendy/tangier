"use server"

import { migrateDb } from "@/lib/db/migrate-db"
import { pgEnvFromUrl } from "@/lib/db/pg-env"
import { env } from "@/lib/env"
import { generateBackupFilename } from "@/lib/generate-backup-filename"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

/**
 * libpq reads the connection from `PG*` env vars, keeping the password out of
 * the argv (`ps`, `/proc/<pid>/cmdline`). A value that can't be mapped
 * faithfully falls back to `--dbname`, which is still readable locally.
 */
function connection(): { args: string[]; env: NodeJS.ProcessEnv } {
  const pgEnv = pgEnvFromUrl(env.DATABASE_URL)

  if (pgEnv === null) {
    console.warn(
      "DATABASE_URL can't be split into PG* variables; passing it via --dbname exposes the credentials in the process list"
    )
    return { args: ["--dbname", env.DATABASE_URL], env: process.env }
  }

  return { args: [], env: { ...process.env, ...pgEnv } }
}

export async function dumpDatabase() {
  const filename = generateBackupFilename()
  const { args, env: connectionEnv } = connection()

  await promisify(execFile)(
    "pg_dump",
    [
      ...args,
      "--no-privileges",
      "--if-exists",
      "--no-owner",
      "--clean",
      "--file",
      filename,
    ],
    { env: connectionEnv }
  )

  return filename
}

export async function restoreDatabase(filename: string) {
  const { args, env: connectionEnv } = connection()

  await promisify(execFile)(
    "psql",
    [
      ...args,
      "--single-transaction",
      "--set=ON_ERROR_STOP=on",
      "--file",
      filename,
    ],
    { env: connectionEnv }
  )
  await migrateDb()
}
