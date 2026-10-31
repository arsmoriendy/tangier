"use server"

import { migrateDb } from "@/lib/db/migrate-db"
import { env } from "@/lib/env"
import { generateBackupFilename } from "@/lib/generate-backup-filename"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

export async function dumpDatabase() {
  const filename = generateBackupFilename()

  await promisify(execFile)("pg_dump", [
    `--dbname`,
    env.DATABASE_URL,
    "--no-privileges",
    "--if-exists",
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
  await migrateDb()
}
