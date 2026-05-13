import type { Script } from "./types";

const xssScanner: Script = {
  id: "xss-scanner",
  name: "XSS Scanner",
  description: "Détection de failles Cross-Site Scripting",
  category: "Vulnérabilités",
  risk: "high",
  icon: "⚡",
  command: (target: string) => `dalfox url ${target}`
};

export default xssScanner;
