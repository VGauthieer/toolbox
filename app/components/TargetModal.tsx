"use client";

import { useState } from "react";
import type { Script } from "./ScriptPanel";

interface TargetModalProps {
  script: Script;
  onConfirm: (target: string) => void;
  onCancel: () => void;
}

export default function TargetModal({
  script,
  onConfirm,
  onCancel,
}: TargetModalProps) {
  const [target, setTarget] = useState("");

  const riskColors = {
    low: { text: "#00ff88", label: "Risque faible" },
    medium: { text: "#ffaa00", label: "Risque moyen" },
    high: { text: "#ff4444", label: "Risque élevé" },
  };

  const risk = riskColors[script.risk];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{script.icon}</span>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {script.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {script.description}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-1 rounded-md bg-[var(--surface-2)] text-[var(--text-secondary)]">
              {script.category}
            </span>
            <span
              className="text-xs font-mono px-2 py-1 rounded-md"
              style={{
                color: risk.text,
                backgroundColor: `${risk.text}15`,
              }}
            >
              {risk.label}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <label
            htmlFor="target-input"
            className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider"
          >
            Cible
          </label>
          <input
            id="target-input"
            type="text"
            placeholder="ex: 192.168.1.0/24, example.com, ..."
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && target.trim()) onConfirm(target.trim());
            }}
            autoFocus
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
          />

          {script.risk === "high" && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20">
              <span className="text-xs mt-0.5">⚠️</span>
              <p className="text-[11px] text-[var(--danger)] leading-snug">
                Ce script est classé à risque élevé. Assurez-vous d&apos;avoir
                l&apos;autorisation explicite de tester cette cible.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            id="modal-cancel-btn"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            id="modal-confirm-btn"
            onClick={() => target.trim() && onConfirm(target.trim())}
            disabled={!target.trim()}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              target.trim()
                ? "bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] shadow-lg shadow-[var(--accent)]/20"
                : "bg-[var(--surface-3)] text-[var(--text-muted)] cursor-not-allowed"
            }`}
          >
            🚀 Lancer le scan
          </button>
        </div>
      </div>
    </div>
  );
}
