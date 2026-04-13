import type { Script } from "./types";

const shodanLookup: Script = {
    id: "shodan-lookup",
    name: "Shodan Lookup",
    description: "Reconnaissance OSINT via l'API Shodan",
    category: "Reconnaissance",
    risk: "low",
    icon: "🌐",
    command: (target: string) => `python3 app/scripts/shodan.py ${target}`,
};

export default shodanLookup;