import type { Script } from "./types";

const sqlmapScan: Script = {
  id: "sqlmap-scan",
  name: "SQLMap Injection",
  description: "Détection automatique d'injections SQL",
  category: "Vulnérabilités",
  risk: "high",
  icon: "💉",
  command: (target) => 'sqlmap -u ${target} --batch'
};

export default sqlmapScan;
