import { createEnv } from "@t3-oss/env-nextjs"
import * as z from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.url().nonempty(),
    PRINTER_VID: z.coerce.number().default(0x04b8),
    PRINTER_PID: z.coerce.number().default(0x202),
    PRINTER_WIDTH: z.coerce.number().default(33),
  },
  client: {},
  experimental__runtimeEnv: {},
})
