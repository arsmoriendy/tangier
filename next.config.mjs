import createNextIntlPlugin from "next-intl/plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  serverExternalPackages: ["usb"],
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  output: "standalone",
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
