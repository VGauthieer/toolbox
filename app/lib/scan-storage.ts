import type { ScanResult } from "../components/ScanStatus";
import type { ReportData } from "./html-template";

function scanToReport(scan: ScanResult, logs: string[]): ReportData {
  return {
    id: scan.id,
    scriptName: scan.script.name,
    scriptIcon: scan.script.icon,
    scriptCategory: scan.script.category,
    target: scan.target,
    status: scan.status,
    startTime: scan.startTime.toISOString(),
    endTime: scan.endTime?.toISOString(),
    findings: scan.findings.map((f) => ({
      ...f,
      timestamp: f.timestamp.toISOString(),
    })),
    logs,
  };
}

function reportToScanResult(
  report: ReportData
): ScanResult & { logs: string[] } {
  return {
    id: report.id,
    script: {
      id: report.id,
      name: report.scriptName,
      icon: report.scriptIcon,
      category: report.scriptCategory,
      description: "",
      risk: "low",
      command: () => "",
    },
    target: report.target,
    status: report.status,
    progress: report.status === "completed" ? 100 : 0,
    startTime: new Date(report.startTime),
    endTime: report.endTime ? new Date(report.endTime) : undefined,
    findings: report.findings.map((f) => ({
      ...f,
      type: f.type as "info" | "warning" | "critical",
      timestamp: new Date(f.timestamp),
    })),
    logs: report.logs,
  };
}

/**
 * Save a scan result to the server (persisted as JSON + HTML files)
 */
export async function saveScan(
  scan: ScanResult,
  logs: string[]
): Promise<void> {
  const report = scanToReport(scan, logs);
  try {
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });
  } catch (err) {
    console.error("Failed to save report:", err);
  }
}

/**
 * Load a single scan from the server by ID
 */
export async function loadScan(
  id: string
): Promise<(ScanResult & { logs: string[] }) | null> {
  try {
    const res = await fetch(`/api/reports/${id}`);
    if (!res.ok) return null;
    const report: ReportData = await res.json();
    return reportToScanResult(report);
  } catch (err) {
    console.error("Failed to load report:", err);
    return null;
  }
}

/**
 * Load all saved scans from the server
 */
export async function loadAllScans(): Promise<ScanResult[]> {
  try {
    const res = await fetch("/api/reports");
    if (!res.ok) return [];
    const reports: ReportData[] = await res.json();
    return reports.map((r) => reportToScanResult(r));
  } catch (err) {
    console.error("Failed to load reports:", err);
    return [];
  }
}
