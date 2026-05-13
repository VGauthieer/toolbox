import type { Script } from "./types";

const dirBuster: Script = {
  id: "dir-buster",
  name: "Directory Buster",
  description: "Découverte de répertoires cachés par bruteforce",
  category: "Vulnérabilités",
  risk: "medium",
  icon: "📂",
  command: (target: string) => `gobuster dir -u ${target} -w /usr/share/wordlists/dirb/common.txt`
};

export default dirBuster;
