import type { Script } from "./types";

const hydraBrute: Script = {
  id: "hydra-brute",
  name: "Hydra Bruteforce",
  description: "Bruteforce de services d'authentification",
  category: "Mots de passe",
  risk: "high",
  icon: "🔓",
  options: [
    {
      id: "service",
      label: "Type de service",
      choices: [
        { value: "ssh", label: "SSH" },
        { value: "ftp", label: "FTP" },
        { value: "http-get", label: "HTTP GET" },
        { value: "http-post-form", label: "HTTP POST Form" },
        { value: "smtp", label: "SMTP" },
        { value: "rdp", label: "RDP" },
        { value: "mysql", label: "MySQL" },
        { value: "smb", label: "SMB" },
        { value: "telnet", label: "Telnet" },
        { value: "vnc", label: "VNC" },
      ],
      default: "ssh",
    },
  ],
  command: (target: string, opts?: Record<string, string>) => {
    const service = opts?.service ?? "ssh";
    return `hydra -L user.txt -P pass.txt ${target} ${service}`;
  },
};

export default hydraBrute;
