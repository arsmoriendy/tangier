import { sanitizeFilename } from "@/lib/sanitize-filename"
import pkg from "package.json"

export function generateBackupFilename() {
  const timestamp = new Date().toISOString()
  return sanitizeFilename(`tangier-v${pkg.version}-backup-${timestamp}.sql`)
}
