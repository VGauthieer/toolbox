import type { Script } from "./types";

const nmapStealth: Script = {
  id: "nmap-stealth",
  name: "Nmap Stealth Scan",
  description: "Scan SYN furtif pour éviter la détection IDS",
  category: "Reconnaissance",
  risk: "medium",
  icon: "👻",
};

export default nmapStealth;
