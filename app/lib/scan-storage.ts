import type { ScanResult } from "../components/ScanStatus";

interface SerializedScan {
    id: string;
    script: ScanResult["script"];
    target: string;
    startTime: string;
    endTime?: string;
    status: ScanResult["status"];
    progress: number;
    findings: { type: string; message: string; timestamp: string }[];
    logs: string[];
}

export function saveScan(scan: ScanResult, logs: string[]): void {
    if (typeof window === "undefined") return;
    const scans = loadAllScans();
    const serialized: SerializedScan = {
        ...scan,
        startTime: scan.startTime.toISOString(),
        endTime: scan.endTime?.toISOString(),
        findings: scan.findings.map(f => ({
            ...f,
            timestamp: f.timestamp.toISOString(),
        })),
        logs,
    };
    scans[scan.id] = serialized;
    localStorage.setItem("himalia-scans", JSON.stringify(scans));
}

export function loadScan(id: string): (ScanResult & { logs: string[] }) | null {
    const scans = loadAllScans();
    const s = scans[id];
    if (!s) return null;
    return {
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined,
        findings: s.findings.map(f => ({
            ...f,
            type: f.type as "info" | "warning" | "critical",
            timestamp: new Date(f.timestamp),
        })),
    };
}

function loadAllScans(): Record<string, SerializedScan> {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem("himalia-scans");
    return raw ? JSON.parse(raw) : {};
}
