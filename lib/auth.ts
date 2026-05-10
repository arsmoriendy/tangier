import { APIError, betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/lib/db"
import { admin } from "better-auth/plugins"
import { countUser, readUser } from "@/lib/crud/users"
import { count, eq } from "drizzle-orm"
import { user } from "@/lib/db/auth-schema"

export const auth = betterAuth({
  emailAndPassword: { enabled: true, minPasswordLength: 3 },
  user: {
    changeEmail: { enabled: true, updateEmailWithoutVerification: true },
    deleteUser: {
      enabled: true,
      beforeDelete: async (u) => {
        const { role } = (await readUser({
          where: eq(user.id, u.id),
          columns: { role: true },
        }))!

        if (role !== "admin") return

        const adminCount = (
          await db
            .select({ count: count() })
            .from(user)
            .where(eq(user.role, "admin"))
        )[0].count

        if (adminCount <= 1) {
          throw new APIError("CONFLICT", {
            message: "Cannot delete sole admin user",
          })
        }
      },
    },
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
          return {
            data: {
              ...user,
              active: userCount === 0,
              role: userCount === 0 ? "admin" : "user",
            },
          }
        },
      },
    },
  },
  plugins: [admin()],
})
