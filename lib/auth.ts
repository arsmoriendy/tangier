import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/lib/db"
import { admin } from "better-auth/plugins"
import { countUser } from "@/lib/crud/users"

export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      active: { type: "boolean", defaultValue: false, input: false },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  databaseHooks: {
    user: {
      create: {
        // administrate and activate first user
        before: async (user) => {
          const userCount = await countUser()
          return { data: { ...user, active: userCount === 0, role: "admin" } }
        },
      },
    },
  },
  plugins: [admin()],
})
