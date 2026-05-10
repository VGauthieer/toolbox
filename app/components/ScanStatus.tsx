"use client";

import { useEffect, useState, useRef } from "react";
import type { Script } from "./ScriptPanel";

export interface ScanResult {
  id: string;
  script: Script;
  target: string;
  startTime: Date;
  endTime?: Date;
  status: "running" | "completed" | "failed";
  progress: number;
  findings: Finding[];
}

export interface Finding {
  type: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
}

interface ScanStatusProps {
  currentScan: ScanResult | null;
  onScanComplete: (scan: ScanResult, logs: string[]) => void;
  onCancel: () => void;
}

export default function ScanStatus({
  currentScan,
  onScanComplete,
  onCancel,
}: ScanStatusProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!currentScan || currentScan.status !== "running") return;
    setLogs([]);
    setProgress(0);

    const fetchstream = async () => {
      try {
        const response = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command: currentScan.script.command(currentScan.target),
          }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let linebuffer = "";

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          linebuffer += decoder.decode(value, { stream: true });
          const lines = linebuffer.split("\n");
          linebuffer = lines.pop() ?? "";

          const newLines = lines.filter(Boolean);
          setLogs((prev) => {
            const updated = [...prev, ...newLines];
            logsRef.current = updated;
            return updated;
          });

          setProgress((prev) => Math.min(prev + 2, 95));
        }

        setProgress(100);
        onScanComplete({
          ...currentScan,
          status: "completed",
          endTime: new Date(),
          progress: 100,
          findings: [],
        }, logsRef.current);

      } catch (err) {
        setLogs((prev) => {
          const updated = [...prev, `Erreur : ${err}`];
          logsRef.current = updated;
          return updated;
        });
        onScanComplete({
          ...currentScan,
          status: "failed",
          endTime: new Date(),
          progress: 0,
          findings: []
        }, logsRef.current);
      }
    };

    fetchstream();
  }, [currentScan?.id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Idle state
  if (!currentScan) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-wider uppercase flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--text-muted)]" />
            Status du scan
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-[var(--text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            Aucun scan en cours
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-xs">
            Sélectionnez un script dans le panneau de gauche pour lancer un
            scan sur votre cible
          </p>
        </div>
      </div>
    );
  }

  const findingIcons = {
    info: { icon: "ℹ️", color: "#4488ff" },
    warning: { icon: "⚠️", color: "#ffaa00" },
    critical: { icon: "🔴", color: "#ff4444" },
  };

  const isRunning = currentScan.status === "running";
  const isCompleted = currentScan.status === "completed";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-wider uppercase flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${isRunning
              ? "bg-[var(--accent)] animate-pulse"
              : isCompleted
                ? "bg-[var(--accent)]"
                : "bg-[var(--danger)]"
              }`}
          />
          {isRunning ? "Scan en cours" : isCompleted ? "Scan terminé" : "Scan échoué"}
        </h2>
      </div>

      {/* Scan info card */}
      <div className="px-4 py-3">
        <div
          className={`rounded-xl border p-4 ${isRunning
            ? "border-[var(--accent)]/30 bg-[var(--accent)]/5 animate-border-glow"
            : isCompleted
              ? "border-[var(--accent)]/20 bg-[var(--accent)]/5"
              : "border-[var(--danger)]/20 bg-[var(--danger)]/5"
            }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">{currentScan.script.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {currentScan.script.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                Cible: {currentScan.target}
              </p>
            </div>
            {isRunning && (
              <button
                id="cancel-scan-btn"
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 hover:bg-[var(--danger)]/20 transition-colors cursor-pointer"
              >
                Annuler
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Progression
              </span>
              <span className="text-xs font-mono text-[var(--accent)]">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: isCompleted
                    ? "var(--accent)"
                    : "linear-gradient(90deg, var(--accent-dim), var(--accent))",
                  boxShadow: isRunning
                    ? "0 0 10px var(--accent)"
                    : "none",
                }}
              />
            </div>
          </div>

          {/* Timing */}
          <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
            <span>
              Début:{" "}
              {currentScan.startTime.toLocaleTimeString("fr-FR")}
            </span>
            {currentScan.endTime && (
              <span>
                Fin:{" "}
                {currentScan.endTime.toLocaleTimeString("fr-FR")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Terminal / Logs */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            terminal — himalia
          </span>
        </div>
        <div className="flex-1 bg-[#0d0d14] rounded-lg border border-[var(--border)] overflow-hidden scan-line-effect">
          <div className="h-full overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
            {logs.map((log, i) => {
              if (log == null) return null;
              const line = typeof log === "string" ? log : String(log);
              let colorClass = "text-[var(--text-secondary)]";
              if (line.indexOf("CRITICAL") !== -1) {
                colorClass = "text-[var(--danger)]";
              } else if (line.indexOf("WARNING") !== -1) {
                colorClass = "text-[var(--warning)]";
              } else if (
                line.indexOf("Discovered") !== -1 ||
                line.indexOf("found") !== -1
              ) {
                colorClass = "text-[var(--accent)]";
              }
              return (
                <div
                  key={i}
                  className="animate-fade-in-up flex gap-2"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="text-[var(--text-muted)] select-none shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={colorClass}>{line}</span>
                </div>
              );
            })}
            {isRunning && (
              <div className="flex items-center gap-1 mt-1 text-[var(--accent)]">
                <span className="typing-dot">●</span>
                <span className="typing-dot">●</span>
                <span className="typing-dot">●</span>
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* Findings summary */}
      {isCompleted && currentScan.findings.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Résultats ({currentScan.findings.length})
          </p>
          <div className="space-y-1.5">
            {currentScan.findings.map((f, i) => {
              const fi = findingIcons[f.type];
              return (
                <div
                  key={i}
                  className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="text-xs mt-0.5">{fi.icon}</span>
                  <span
                    className="text-xs leading-snug"
                    style={{ color: fi.color }}
                  >
                    {f.message}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
