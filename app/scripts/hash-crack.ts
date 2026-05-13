import type { Script } from "./types";

const hashCrack: Script = {
  id: "hash-crack",
  name: "Hash Cracker",
  description: "Cracking de hashes avec dictionnaire et règles",
  category: "Mots de passe",
  risk: "medium",
  icon: "🔑",
  command: (target: string) => `hashcat -m 0 ${target}`,
};

export default hashCrack;
