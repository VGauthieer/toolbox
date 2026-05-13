export interface ScriptOption {
  id: string;
  label: string;
  choices: { value: string; label: string }[];
  default: string;
}

export interface Script {
  id: string;
  name: string;
  description: string;
  category: string;
  risk: "low" | "medium" | "high";
  icon: string;
  options?: ScriptOption[];
  command: (target: string, options?: Record<string, string>) => string;
}

export interface ScriptCategory {
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: ScriptCategory[] = [
  { name: "Reconnaissance", icon: "🔍", color: "#4488ff" },
  { name: "Vulnérabilités", icon: "🕷️", color: "#ff4444" },
  { name: "Réseau", icon: "📡", color: "#ffaa00" },
  { name: "Mots de passe", icon: "🔑", color: "#aa44ff" },
];
