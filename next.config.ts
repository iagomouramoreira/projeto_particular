import os from "node:os";
import type { NextConfig } from "next";

function lanIPv4() {
  const ips: string[] = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family === "IPv4" && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }
  return ips;
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  allowedDevOrigins: ["127.0.0.1", "localhost", ...lanIPv4()],
};

export default nextConfig;
