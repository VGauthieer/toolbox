import nmapFull from "./nmap-full";
import nmapStealth from "./nmap-stealth";
import whoisLookup from "./whois-lookup";
import dnsEnum from "./dns-enum";
import subdomainBrute from "./subdomain-brute";
import niktoScan from "./nikto-scan";
import sqlmapScan from "./sqlmap-scan";
import xssScanner from "./xss-scanner";
import dirBuster from "./dir-buster";
import arpScan from "./arp-scan";
import sniffTraffic from "./sniff-traffic";
import mitmDetect from "./mitm-detect";
import hydraBrute from "./hydra-brute";
import hashCrack from "./hash-crack";
import credDump from "./cred-dump";
import shodanLookup from "./Shodan-lookup";

import type { Script } from "./types";

export const SCRIPTS: Script[] = [
  // Reconnaissance
  nmapFull,
  nmapStealth,
  whoisLookup,
  dnsEnum,
  subdomainBrute,
  shodanLookup,
  // Vulnérabilités
  niktoScan,
  sqlmapScan,
  xssScanner,
  dirBuster,
  // Réseau
  arpScan,
  sniffTraffic,
  mitmDetect,
  // Mots de passe
  hydraBrute,
  hashCrack,
  credDump,
];

export type { Script } from "./types";
export { CATEGORIES } from "./types";
