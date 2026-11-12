/**
 * libpq connection parameters that can be provided through `PG*` variables.
 * Anything not listed here makes `pgEnvFromUrl` bail out, so the caller can
 * keep using `--dbname` rather than silently dropping the parameter.
 */
const VARIABLE_BY_PARAMETER: Record<string, string> = {
  application_name: "PGAPPNAME",
  channel_binding: "PGCHANNELBINDING",
  client_encoding: "PGCLIENTENCODING",
  connect_timeout: "PGCONNECT_TIMEOUT",
  gssdelegation: "PGGSSDELEGATION",
  gssencmode: "PGGSSENCMODE",
  krbsrvname: "PGKRBSRVNAME",
  load_balance_hosts: "PGLOADBALANCEHOSTS",
  options: "PGOPTIONS",
  passfile: "PGPASSFILE",
  replication: "PGREPLICATION",
  requirepeer: "PGREQUIREPEER",
  sslcert: "PGSSLCERT",
  sslcrl: "PGSSLCRL",
  sslkey: "PGSSLKEY",
  sslmaxprotocolversion: "PGSSLMAXPROTOCOLVERSION",
  sslminprotocolversion: "PGSSLMINPROTOCOLVERSION",
  sslmode: "PGSSLMODE",
  sslnegotiation: "PGSSLNEGOTIATION",
  sslpassword: "PGSSLPASSWORD",
  sslrootcert: "PGSSLROOTCERT",
  target_session_attrs: "PGTARGETSESSIONATTRS",
  tcp_user_timeout: "PGTCPUSER_TIMEOUT",
}

function decode(value: string): string | null {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

function decodeHost(hostname: string): string | null {
  const host = decode(hostname)
  if (host === null) return null
  return host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host
}

/**
 * Splits a postgres connection URI into libpq `PG*` variables, keeping the
 * password out of the process argv.
 *
 * Returns `null` for anything that can't be mapped faithfully — keyword/value
 * conninfo, multiple hosts, unknown parameters, other schemes — so callers can
 * fall back to `--dbname` instead of changing how the connection is made.
 */
export function pgEnvFromUrl(databaseUrl: string) {
  let url: URL
  try {
    url = new URL(databaseUrl)
  } catch {
    return null
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") return null

  const host = url.hostname === "" ? "" : decodeHost(url.hostname)
  const user = decode(url.username)
  const password = decode(url.password)
  const database = decode(url.pathname.slice(1))
  if (
    host === null ||
    user === null ||
    password === null ||
    database === null
  )
    return null

  const pgEnv: Record<string, string> = {}

  if (host !== "") pgEnv.PGHOST = host
  if (url.port !== "") pgEnv.PGPORT = url.port
  if (user !== "") pgEnv.PGUSER = user
  if (password !== "") pgEnv.PGPASSWORD = password
  if (database !== "") pgEnv.PGDATABASE = database

  for (const [parameter, value] of url.searchParams) {
    const variable = VARIABLE_BY_PARAMETER[parameter]
    if (variable === undefined) return null
    pgEnv[variable] = value
  }

  return pgEnv
}
