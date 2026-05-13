import type { Script } from "./types";

const mitmDetect: Script = {
  id: "mitm-detect",
  name: "MITM Detection",
  description: "Détection d'attaques Man-in-the-Middle",
  category: "Réseau",
  risk: "low",
  icon: "🛡️",
  command: (target: string) => `tshark -i eth0 -Y arp -T field -e arp.src.hw_mac -e arp.src.proto_ipv4 -e arp.opcode`
};

export default mitmDetect;
