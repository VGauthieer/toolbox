"use client";

import { useState, useCallback, useEffect } from "react";
import ScriptPanel from "./components/ScriptPanel";
import type { Script } from "./components/ScriptPanel";
import ScanStatus from "./components/ScanStatus";
import type { ScanResult } from "./components/ScanStatus";
import ScanHistory from "./components/ScanHistory";
import TargetModal from "./components/TargetModal";
import UpdateModal from "./components/UpdateModal";
import { saveScan, loadAllScans } from "./lib/scan-storage";

export default function Home() {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const isScanning = currentScan?.status === "running";

  // Load persisted scan history on mount
  useEffect(() => {
    loadAllScans()
      .then((scans) => setScanHistory(scans))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleLaunchScript = useCallback((script: Script) => {
    setSelectedScript(script);
  }, []);

  const handleConfirmLaunch = useCallback(
    (target: string, options?: Record<string, string>) => {
      if (!selectedScript) return;

      const scan: ScanResult = {
        id: `scan-${Date.now()}`,
        script: selectedScript,
        target,
        scriptOptions: options,
        startTime: new Date(),
        status: "running",
        progress: 0,
        findings: [],
      };

      setCurrentScan(scan);
      setSelectedScript(null);
    },
    [selectedScript]
  );

  const handleScanComplete = useCallback(async (completedScan: ScanResult, logs: string[]) => {
    setCurrentScan(completedScan);
    setScanHistory((prev) => [...prev, completedScan]);
    await saveScan(completedScan, logs);
  }, []);

  const handleCancelScan = useCallback(() => {
    if (currentScan) {
      const cancelled: ScanResult = {
        ...currentScan,
        status: "failed",
        endTime: new Date(),
        findings: [],
      };
      setCurrentScan(cancelled);
      setScanHistory((prev) => [...prev, cancelled]);
    }
  }, [currentScan]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#00aa55] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
            <span className="text-black text-sm font-bold">R</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
              REVIEW
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] font-mono tracking-wider">
              OFFENSIVE SECURITY TOOLBOX
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Update button */}
          <button
            onClick={() => setShowUpdateModal(true)}
            title="Mise à jour"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[10px] font-mono">UPDATE</span>
          </button>

          {/* Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isScanning
                ? "bg-[var(--accent)] animate-pulse"
                : "bg-[var(--text-muted)]"
                }`}
            />
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {isScanning ? "SCANNING" : "IDLE"}
            </span>
          </div>

          {/* Scan count */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)]">
            <svg
              className="w-3 h-3 text-[var(--text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {scanHistory.length} SCANS
            </span>
          </div>
        </div>
      </header>

      {/* Main 3-panel layout */}
      <main className="flex flex-1 min-h-0">
        {/* Left panel — Scripts */}
        <aside className="w-[300px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <ScriptPanel
            onLaunchScript={handleLaunchScript}
            isScanning={isScanning}
          />
        </aside>

        {/* Center panel — Scan Status */}
        <section className="flex-1 min-w-0 bg-[var(--background)] overflow-hidden">
          <ScanStatus
            currentScan={currentScan}
            onScanComplete={handleScanComplete}
            onCancel={handleCancelScan}
          />
        </section>

        {/* Right panel — History */}
        <aside className="w-[320px] shrink-0 border-l border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <ScanHistory history={scanHistory} />
        </aside>
      </main>

      {/* Update modal */}
      {showUpdateModal && (
        <UpdateModal onClose={() => setShowUpdateModal(false)} />
      )}

      {/* Target input modal */}
      {selectedScript && (
        <TargetModal
          script={selectedScript}
          onConfirm={handleConfirmLaunch}
          onCancel={() => setSelectedScript(null)}
        />
      )}
    </div>
  );
}
