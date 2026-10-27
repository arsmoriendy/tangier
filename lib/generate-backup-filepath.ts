import pkg from "package.json"

export function generateBackupFilepath() {
  const timestamp = new Date().toISOString()
  return `/tmp/tangier-v${pkg.version}-backup-${timestamp}.sql`
}
