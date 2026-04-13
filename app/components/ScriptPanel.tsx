"use client";

import { useState } from "react";
import { SCRIPTS, CATEGORIES } from "../scripts";
import type { Script } from "../scripts";

export type { Script };

const riskColors = {
  low: { bg: "#00ff8818", text: "#00ff88", label: "Low" },
  medium: { bg: "#ffaa0018", text: "#ffaa00", label: "Med" },
  high: { bg: "#ff444418", text: "#ff4444", label: "High" },
};

interface ScriptPanelProps {
  onLaunchScript: (script: Script) => void;
  isScanning: boolean;
}

export default function ScriptPanel({
  onLaunchScript,
  isScanning,
}: ScriptPanelProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    CATEGORIES.map((c) => c.name)
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredScripts = SCRIPTS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--accent)] tracking-wider uppercase flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          Scripts disponibles
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {SCRIPTS.length} outils chargés
        </p>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="script-search"
            type="text"
            placeholder="Rechercher un script..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
      </div>

      {/* Script list */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {CATEGORIES.map((cat) => {
          const catScripts = filteredScripts.filter(
            (s) => s.category === cat.name
          );
          if (catScripts.length === 0) return null;
          const isExpanded = expandedCategories.includes(cat.name);

          return (
            <div key={cat.name} className="mb-1">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat.name)}
                className="w-full flex items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                style={{ color: cat.color }}
              >
                <svg
                  className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="ml-auto text-[var(--text-muted)] font-normal text-[10px]">
                  {catScripts.length}
                </span>
              </button>

              {/* Scripts */}
              {isExpanded && (
                <div className="ml-2 space-y-0.5">
                  {catScripts.map((script, index) => {
                    const risk = riskColors[script.risk];
                    return (
                      <div
                        key={script.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <button
                          id={`script-${script.id}`}
                          onClick={() => !isScanning && onLaunchScript(script)}
                          disabled={isScanning}
                          className={`w-full group flex flex-col gap-1 px-3 py-2.5 rounded-lg border border-transparent text-left transition-all duration-200 ${
                            isScanning
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-[var(--surface-2)] hover:border-[var(--border)] cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{script.icon}</span>
                            <span className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                              {script.name}
                            </span>
                            <span
                              className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: risk.bg,
                                color: risk.text,
                              }}
                            >
                              {risk.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] leading-snug pl-6">
                            {script.description}
                          </p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
