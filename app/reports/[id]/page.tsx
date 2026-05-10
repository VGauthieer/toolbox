"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ReportData } from "@/app/lib/html-template";

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: ReportData) => setReport(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-muted)] font-mono">
            Chargement du rapport...
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--danger)] flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-sm text-[var(--text-primary)]">
            Rapport introuvable
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            ID : {id}
          </p>
          <a
            href="/"
            className="mt-2 px-4 py-2 text-xs font-medium rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--surface-3)] transition-colors"
          >
            ← Retour au dashboard
          </a>
        </div>
      </div>
    );
  }

  const startDate = new Date(report.startTime);
  const endDate = report.endTime ? new Date(report.endTime) : null;
  const durationMs = endDate ? endDate.getTime() - startDate.getTime() : 0;
  const durationSecs = Math.floor(durationMs / 1000);
  const durationStr =
    durationSecs < 60
      ? `${durationSecs}s`
      : `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s`;

  const statusConfig = {
    completed: { label: "Terminé", color: "#00ff88" },
    failed: { label: "Échoué", color: "#ff4444" },
    running: { label: "En cours", color: "#ffaa00" },
  };

  const status = statusConfig[report.status];

  const criticalCount = report.findings.filter(
    (f) => f.type === "critical"
  ).length;
  const warningCount = report.findings.filter(
    (f) => f.type === "warning"
  ).length;
  const infoCount = report.findings.filter((f) => f.type === "info").length;

  const findingConfig: Record<string, { icon: string; color: string }> = {
    critical: { icon: "🔴", color: "#ff4444" },
    warning: { icon: "⚠️", color: "#ffaa00" },
    info: { icon: "ℹ️", color: "#4488ff" },
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <a
              href="/"
              className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Dashboard
            </a>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {report.id}
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-3xl">{report.scriptIcon}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                {report.scriptName}
              </h1>
              <p className="text-sm text-[var(--text-muted)] font-mono mt-1">
                Cible : {report.target}
              </p>
            </div>
            <span
              className="text-xs font-semibold font-mono px-3 py-1.5 rounded-full border"
              style={{
                backgroundColor: `${status.color}15`,
                color: status.color,
                borderColor: `${status.color}30`,
              }}
            >
              {status.label}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Catégorie",
              value: report.scriptCategory,
            },
            {
              label: "Début",
              value: startDate.toLocaleString("fr-FR"),
            },
            {
              label: "Fin",
              value: endDate
                ? endDate.toLocaleString("fr-FR")
                : "—",
            },
            { label: "Durée", value: endDate ? durationStr : "—" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)] font-mono">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Download HTML button */}
        <div className="mb-8">
          <a
            href={`/api/reports/${report.id}/html`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Télécharger le rapport HTML
          </a>
        </div>

        {/* Findings */}
        {report.findings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              Résultats ({report.findings.length})
            </h2>

            <div className="flex gap-3 mb-4">
              {criticalCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#ff444418] text-[#ff4444]">
                  🔴 {criticalCount} critique
                  {criticalCount > 1 ? "s" : ""}
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#ffaa0018] text-[#ffaa00]">
                  ⚠️ {warningCount} avertissement
                  {warningCount > 1 ? "s" : ""}
                </span>
              )}
              {infoCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#4488ff18] text-[#4488ff]">
                  ℹ️ {infoCount} info{infoCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {report.findings.map((f, i) => {
                const cfg = findingConfig[f.type] || findingConfig.info;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="text-sm mt-0.5">{cfg.icon}</span>
                    <span
                      className="text-sm flex-1"
                      style={{ color: cfg.color }}
                    >
                      {f.message}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono whitespace-nowrap">
                      {new Date(f.timestamp).toLocaleTimeString("fr-FR")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Logs terminal */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            Logs du terminal ({report.logs.length} lignes)
          </h2>

          <div className="rounded-xl border border-[var(--border)] bg-[#0d0d14] overflow-hidden">
            {/* Terminal chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              <span className="text-[10px] text-[var(--text-muted)] font-mono ml-2">
                terminal — himalia
              </span>
            </div>

            {/* Logs */}
            <div className="max-h-[500px] overflow-y-auto p-4 font-mono text-[11px] leading-relaxed">
              {report.logs.map((line, i) => {
                let colorClass = "text-[var(--text-secondary)]";
                if (line.indexOf("CRITICAL") !== -1)
                  colorClass = "text-[var(--danger)]";
                else if (line.indexOf("WARNING") !== -1)
                  colorClass = "text-[var(--warning)]";
                else if (
                  line.indexOf("Discovered") !== -1 ||
                  line.indexOf("found") !== -1
                )
                  colorClass = "text-[var(--accent)]";

                return (
                  <div key={i} className="flex gap-3">
                    <span className="text-[var(--text-muted)] select-none shrink-0 w-7 text-right">
                      {String(i + 1).padStart(3, " ")}
                    </span>
                    <span className={colorClass}>{line}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] text-center py-6">
        <p className="text-[11px] text-[var(--text-muted)]">
          Rapport généré par Himalia — ID : {report.id}
        </p>
      </footer>
    </div>
  );
}