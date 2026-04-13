import type { Script } from "./types";

const niktoScan: Script = {
  id: "nikto-scan",
  name: "Nikto Web Scan",
  description: "Scan de vulnérabilités web connues",
  category: "Vulnérabilités",
  risk: "medium",
  icon: "🕷️",
  command: (target: string) => `nikto -h ${target}`,
};

export default niktoScan;
