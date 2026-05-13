import type { Script } from "./types";

const sniffTraffic: Script = {
  id: "sniff-traffic",
  name: "Traffic Sniffer",
  description: "Capture et analyse du trafic réseau",
  category: "Réseau",
  risk: "medium",
  icon: "🎣",
  command: (target: string) => `tshark -i eth0 -Y http -T fields -e http.request.method -e http.request.uri`,
};

export default sniffTraffic;
