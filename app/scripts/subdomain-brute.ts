import type { Script } from "./types";

const subdomainBrute: Script = {
  id: "subdomain-brute",
  name: "Subdomain Bruteforce",
  description: "Découverte de sous-domaines par bruteforce",
  category: "Reconnaissance",
  risk: "medium",
  icon: "🔎",
  command: (target: string) => `subfinder -d ${target}`
};

export default subdomainBrute;
