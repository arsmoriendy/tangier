import createNextIntlPlugin from "next-intl/plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizePackageImports: ["@phosphor-icons/react"],
  serverExternalPackages: ["usb"],
  output: "standalone",
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
