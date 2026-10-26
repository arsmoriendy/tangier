"use server"

import { env } from "@/lib/env"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import pkg from "package.json"

export async function dumpDatabase() {
  const timestamp = new Date().toISOString()
  const filename = `/tmp/tangier-v${pkg.version}-backup-${timestamp}.sql`

  await promisify(execFile)("pg_dump", [
    `--dbname`,
    env.DATABASE_URL,
    "--no-privileges",
    "--no-owner",
    "--clean",
    `--file`,
    filename,
  ])

  return filename
}

export async function restoreDatabase(filename: string) {
  await promisify(execFile)("psql", [
    env.DATABASE_URL,
    "--single-transaction",
    "--set=ON_ERROR_STOP=on",
    "--file",
    filename,
  ])
}
