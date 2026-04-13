"use client";

import type { ScanResult } from "./ScanStatus";

interface ScanHistoryProps {
  history: ScanResult[];
}

const statusConfig = {
  completed: {
    icon: "✅",
    label: "Terminé",
    color: "#00ff88",
    bg: "#00ff8810",
  },
  failed: {
    icon: "❌",
    label: "Échoué",
    color: "#ff4444",
    bg: "#ff444410",
  },
  running: {
    icon: "⏳",
    label: "En cours",
    color: "#ffaa00",
    bg: "#ffaa0010",
  },
};

function formatDuration(start: Date, end?: Date): string {
  if (!end) return "—";
  const diff = end.getTime() - start.getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  return `${mins}m ${remSecs}s`;
}

function countFindings(scan: ScanResult) {
  const counts = { info: 0, warning: 0, critical: 0 };
  scan.findings.forEach((f) => counts[f.type]++);
  return counts;
}

export default function ScanHistory({ history }: ScanHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-wider uppercase flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--text-muted)]" />
            Historique des scans
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            0 rapports
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-[var(--text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            Aucun scan effectué
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-[180px]">
            Les résultats de vos scans apparaîtront ici
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-wider uppercase flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--info)]" />
          Historique des scans
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {history.length} rapport{history.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2 border-b border-[var(--border)]">
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] text-[var(--text-muted)]">
              {history.filter((s) => s.status === "completed").length} réussis
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
            <span className="text-[10px] text-[var(--text-muted)]">
              {history.filter((s) => s.status === "failed").length} échoués
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
            <span className="text-[10px] text-[var(--text-muted)]">
              {history.reduce((acc, s) => acc + s.findings.filter((f) => f.type === "critical").length, 0)} critiques
            </span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {[...history].reverse().map((scan, index) => {
          const status = statusConfig[scan.status];
          const findings = countFindings(scan);

          return (
            <div
              key={scan.id}
              id={`history-${scan.id}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden glow-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Card header */}
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{scan.script.icon}</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] truncate flex-1">
                    {scan.script.name}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: status.bg,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] mb-2">
                  <span className="font-mono">{scan.target}</span>
                  <span>·</span>
                  <span>
                    {scan.startTime.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>·</span>
                  <span>
                    {formatDuration(scan.startTime, scan.endTime)}
                  </span>
                </div>

                {/* Findings badges */}
                {scan.findings.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {findings.critical > 0 && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#ff444418] text-[#ff4444]">
                        🔴 {findings.critical}
                      </span>
                    )}
                    {findings.warning > 0 && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#ffaa0018] text-[#ffaa00]">
                        ⚠️ {findings.warning}
                      </span>
                    )}
                    {findings.info > 0 && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#4488ff18] text-[#4488ff]">
                        ℹ️ {findings.info}
                      </span>
                    )}
                  </div>
                )}

                {/* Report link */}
                {scan.status === "completed" && (
                  <a
                    href={`/reports/${scan.id}`}
                    id={`report-link-${scan.id}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-dim)] transition-colors group"
                  >
                    <svg
                      className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Voir le rapport HTML
                    <svg
                      className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
