import { createEnv } from "@t3-oss/env-nextjs"
import z from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    PRINTER_VID: z.coerce.number().default(0x04b8),
    PRINTER_PID: z.coerce.number().default(0x202),
    PRINTER_WIDTH: z.coerce.number().default(33),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_SHOW_REACT_QUERY_DEV_TOOL: z.any(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SHOW_REACT_QUERY_DEV_TOOL:
      process.env.NEXT_PUBLIC_SHOW_REACT_QUERY_DEV_TOOL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
