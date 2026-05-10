import type { Script } from "./types";

const nmapFull: Script = {
  id: "nmap-full",
  name: "Nmap Full Scan",
  description: "Scan complet de ports avec détection de services et OS",
  category: "Reconnaissance",
  risk: "low",
  icon: "🔍",
  command: (target: string) => `nmap -A -T4 ${target}`,
};

export default nmapFull;
