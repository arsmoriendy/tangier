import { sanitizeFilename } from "@/lib/sanitize-filename"
import pkg from "package.json"

export function generateBackupFilepath() {
  const timestamp = new Date().toISOString()
  return sanitizeFilename(
    `/tmp/tangier-v${pkg.version}-backup-${timestamp}.sql`
  )
}
