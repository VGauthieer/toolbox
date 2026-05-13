import type { Script } from "./types";

const credDump: Script = {
  id: "cred-dump",
  name: "Credential Dumper",
  description: "Extraction de credentials depuis fichiers config",
  category: "Mots de passe",
  risk: "high",
  icon: "🗝️",
  command: (target: string) => `secretsdump.py -lı ${target}`
};

export default credDump;
