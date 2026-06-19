"use client";

import { useEffect, useRef, useState } from "react";

type UpdateStatus = "idle" | "running" | "success" | "error";

interface UpdateModalProps {
  onClose: () => void;
}

export default function UpdateModal({ onClose }: UpdateModalProps) {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  async function runUpdate() {
    setStatus("running");
    setLogs([]);

    try {
      const res = await fetch("/api/update", { method: "POST" });
      if (!res.body) throw new Error("Pas de stream reçu");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let exitCode: number | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        const newLines = lines.filter(Boolean);
        setLogs((prev) => [...prev, ...newLines]);

        for (const line of newLines) {
          const match = line.match(/\[EXIT\] code (\d+)/);
          if (match) exitCode = parseInt(match[1], 10);
        }
      }

      setStatus(exitCode === 0 ? "success" : "error");
    } catch (err) {
      setLogs((prev) => [...prev, `Erreur : ${err}`]);
      setStatus("error");
    }
  }

  const statusConfig = {
    idle: { label: "Prêt", dot: "bg-[var(--text-muted)]" },
    running: { label: "Mise à jour en cours…", dot: "bg-[var(--accent)] animate-pulse" },
    success: { label: "Mise à jour réussie", dot: "bg-[var(--accent)]" },
    error: { label: "Échec de la mise à jour", dot: "bg-[var(--danger)]" },
  };

  const cfg = statusConfig[status];

  function lineColor(line: string): string {
    if (line.includes("ERROR") || line.includes("échoué") || line.includes("[EXIT] code") && !line.includes("code 0"))
      return "text-[var(--danger)]";
    if (line.includes("✓") || line.includes("réussie") || line.includes("[EXIT] code 0"))
      return "text-[var(--accent)]";
    if (line.includes("⚡") || line.includes("Mise à jour") || line.includes("═"))
      return "text-[var(--warning)]";
    return "text-[var(--text-secondary)]";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[680px] max-h-[80vh] flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Auto-update
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">
                {cfg.label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={status === "running"}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Terminal */}
        <div className="flex-1 min-h-0 overflow-hidden bg-[#0d0d14]">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            <span className="text-[10px] text-[var(--text-muted)] font-mono ml-2">
              terminal — review / auto-update.sh
            </span>
          </div>
          <div className="h-[360px] overflow-y-auto p-4 font-mono text-[11px] leading-relaxed">
            {logs.length === 0 && status === "idle" && (
              <p className="text-[var(--text-muted)]">
                Lance la mise à jour pour voir les logs ici.
              </p>
            )}
            {logs.map((line, i) => (
              <div key={i} className={`${lineColor(line)}`}>
                {line}
              </div>
            ))}
            {status === "running" && (
              <div className="flex items-center gap-1 mt-1 text-[var(--accent)]">
                <span className="typing-dot">●</span>
                <span className="typing-dot">●</span>
                <span className="typing-dot">●</span>
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-muted)] font-mono">
            {logs.length > 0 ? `${logs.length} ligne${logs.length > 1 ? "s" : ""}` : ""}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={status === "running"}
              className="px-4 py-2 text-xs font-medium rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Fermer
            </button>
            <button
              onClick={runUpdate}
              disabled={status === "running"}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {status === "running" ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  En cours…
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {status === "idle" ? "Lancer la mise à jour" : "Relancer"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
