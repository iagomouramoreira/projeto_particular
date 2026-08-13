import { spawn } from "node:child_process";
import { lanIPv4 } from "./lan.mjs";

const port = process.env.PORT || "3000";
const ips = lanIPv4();

console.log("\n  projeto_particular — controle financeiro\n");
console.log(`  Computador:  http://localhost:${port}`);
if (ips.length === 0) {
  console.log("  Celular:     nenhuma rede local encontrada. Conecte o Wi-Fi.");
} else {
  for (const ip of ips) {
    console.log(`  Celular:     http://${ip}:${port}`);
  }
}
console.log("  Mesmo Wi-Fi no computador e no telefone. Deixe este terminal aberto.\n");

const child = spawn(
  "npx",
  ["next", "dev", "--hostname", "0.0.0.0", "--port", String(port)],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
