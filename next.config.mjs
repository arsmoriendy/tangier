/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizePackageImports: ["@phosphor-icons/react"],
  // serverExternalPackages: ["usb"],
  output: "standalone",
}

export default nextConfig
