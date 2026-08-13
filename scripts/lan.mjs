import os from "node:os";

export function lanIPv4() {
  const ips = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if ((addr.family === "IPv4" || addr.family === 4) && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }
  return ips;
}
