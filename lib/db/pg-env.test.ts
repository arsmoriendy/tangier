import { describe, expect, test } from "vitest"
import { pgEnvFromUrl } from "./pg-env"

describe("pgEnvFromUrl", () => {
  test("splits a full connection URI", () => {
    expect(
      pgEnvFromUrl(
        "postgresql://app:s3cret@db.internal:6543/shop?sslmode=require&connect_timeout=10"
      )
    ).toEqual({
      PGHOST: "db.internal",
      PGPORT: "6543",
      PGUSER: "app",
      PGPASSWORD: "s3cret",
      PGDATABASE: "shop",
      PGSSLMODE: "require",
      PGCONNECT_TIMEOUT: "10",
    })
  })

  test("decodes escaped credentials and database names", () => {
    expect(
      pgEnvFromUrl(
        "postgresql://a%40b:p%40ss%2Fword@h/da%20tabase?options=-c%20search_path%3Dpublic"
      )
    ).toEqual({
      PGHOST: "h",
      PGUSER: "a@b",
      PGPASSWORD: "p@ss/word",
      PGDATABASE: "da tabase",
      PGOPTIONS: "-c search_path=public",
    })
  })

  test("accepts the postgres scheme and omitted parts", () => {
    expect(pgEnvFromUrl("postgres://localhost/shop")).toEqual({
      PGHOST: "localhost",
      PGDATABASE: "shop",
    })
  })

  test("handles a unix socket host", () => {
    expect(
      pgEnvFromUrl("postgresql://%2Fvar%2Frun%2Fpostgresql/shop")
    ).toEqual({ PGHOST: "/var/run/postgresql", PGDATABASE: "shop" })
    expect(pgEnvFromUrl("postgresql:///shop")).toEqual({ PGDATABASE: "shop" })
  })

  test("strips ipv6 brackets", () => {
    expect(pgEnvFromUrl("postgresql://[::1]:5432/shop")).toEqual({
      PGHOST: "::1",
      PGPORT: "5432",
      PGDATABASE: "shop",
    })
  })

  test("bails out on unknown parameters", () => {
    expect(pgEnvFromUrl("postgresql://h/shop?sslmode=require&bogus=1")).toBeNull()
  })

  test("bails out when the URI can't be mapped faithfully", () => {
    expect(pgEnvFromUrl("host=h dbname=shop user=app")).toBeNull()
    expect(pgEnvFromUrl("postgresql://h1:5432,h2:5433/shop")).toBeNull()
    expect(pgEnvFromUrl("mysql://app:s3cret@h/shop")).toBeNull()
    expect(pgEnvFromUrl("postgresql://app:%zz@h/shop")).toBeNull()
  })
})
