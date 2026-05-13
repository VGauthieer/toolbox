import type { Script } from "./types";

const dnsEnum: Script = {
  id: "dns-enum",
  name: "DNS Enumeration",
  description: "Énumération des enregistrements DNS et sous-domaines",
  category: "Reconnaissance",
  risk: "low",
  icon: "🌐",
  command: (target: string) => `dnsenum ${target}`
};

export default dnsEnum;
