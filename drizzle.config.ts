import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./lib/db",
  schema: ["./lib/db/schema.ts", "./lib/db/auth-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
