export interface ReportData {
  id: string;
  scriptName: string;
  scriptIcon: string;
  scriptCategory: string;
  target: string;
  status: "running" | "completed" | "failed";
  startTime: string;
  endTime?: string;
  findings: { type: string; message: string; timestamp: string }[];
  logs: string[];
}

export function generateHtmlReport(report: ReportData): string {
  const startDate = new Date(report.startTime);
  const endDate = report.endTime ? new Date(report.endTime) : null;

  const durationMs = endDate
    ? endDate.getTime() - startDate.getTime()
    : 0;
  const durationSecs = Math.floor(durationMs / 1000);
  const durationStr =
    durationSecs < 60
      ? `${durationSecs}s`
      : `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s`;

  const statusLabel =
    report.status === "completed"
      ? "Terminé"
      : report.status === "failed"
        ? "Échoué"
        : "En cours";

  const statusColor =
    report.status === "completed"
      ? "#00ff88"
      : report.status === "failed"
        ? "#ff4444"
        : "#ffaa00";

  const criticalCount = report.findings.filter(
    (f) => f.type === "critical"
  ).length;
  const warningCount = report.findings.filter(
    (f) => f.type === "warning"
  ).length;
  const infoCount = report.findings.filter((f) => f.type === "info").length;

  const findingTypeIcon = (type: string) => {
    switch (type) {
      case "critical":
        return "🔴";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  const findingTypeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "#ff4444";
      case "warning":
        return "#ffaa00";
      default:
        return "#4488ff";
    }
  };

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport — ${escapeHtml(report.scriptName)} | Review</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #0a0a0f;
      color: #e0e0e8;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, #12121a 0%, #0a0a0f 100%);
      border-bottom: 1px solid #2a2a3a;
      padding: 32px 40px;
    }

    .header-top {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .logo {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #00ff88, #00aa55);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #000;
      font-size: 16px;
      box-shadow: 0 0 20px #00ff8830;
    }

    .brand { font-size: 14px; font-weight: 700; letter-spacing: 2px; color: #e0e0e8; }
    .brand-sub { font-size: 10px; color: #555570; letter-spacing: 3px; font-family: monospace; }

    .scan-title {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .scan-icon { font-size: 32px; }

    .scan-name { font-size: 24px; font-weight: 700; color: #e0e0e8; }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      font-family: monospace;
    }

    .status-badge {
      background: ${statusColor}15;
      color: ${statusColor};
      border: 1px solid ${statusColor}30;
    }

    .container { max-width: 1000px; margin: 0 auto; padding: 32px 40px; }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .meta-card {
      background: #12121a;
      border: 1px solid #2a2a3a;
      border-radius: 12px;
      padding: 16px 20px;
    }

    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #555570;
      margin-bottom: 6px;
    }

    .meta-value {
      font-size: 16px;
      font-weight: 600;
      color: #e0e0e8;
      font-family: monospace;
    }

    .section { margin-bottom: 32px; }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #00ff88;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00ff88;
    }

    .findings-summary {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .finding-count {
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      font-family: monospace;
    }

    .finding-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      background: #12121a;
      border: 1px solid #2a2a3a;
      border-radius: 10px;
      margin-bottom: 8px;
    }

    .finding-icon { font-size: 14px; margin-top: 2px; }

    .finding-msg { font-size: 13px; line-height: 1.5; }

    .finding-time {
      margin-left: auto;
      font-size: 10px;
      color: #555570;
      font-family: monospace;
      white-space: nowrap;
    }

    .terminal {
      background: #0d0d14;
      border: 1px solid #2a2a3a;
      border-radius: 12px;
      overflow: hidden;
    }

    .terminal-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-bottom: 1px solid #2a2a3a;
    }

    .terminal-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .terminal-body {
      padding: 16px;
      max-height: 600px;
      overflow-y: auto;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.8;
    }

    .log-line {
      display: flex;
      gap: 12px;
    }

    .log-num {
      color: #555570;
      user-select: none;
      min-width: 28px;
      text-align: right;
    }

    .log-text { color: #8888a0; }
    .log-text.critical { color: #ff4444; }
    .log-text.warning { color: #ffaa00; }
    .log-text.highlight { color: #00ff88; }

    .footer {
      text-align: center;
      padding: 32px;
      color: #555570;
      font-size: 11px;
      border-top: 1px solid #2a2a3a;
      margin-top: 40px;
    }

    @media print {
      body { background: #fff; color: #111; }
      .header { background: #f5f5f5; border-bottom: 2px solid #ddd; }
      .meta-card { background: #f9f9f9; border-color: #ddd; }
      .terminal { background: #f5f5f5; border-color: #ddd; }
      .log-text { color: #333; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <div class="logo">R</div>
      <div>
        <div class="brand">REVIEW</div>
        <div class="brand-sub">OFFENSIVE SECURITY TOOLBOX</div>
      </div>
    </div>
    <div class="scan-title">
      <span class="scan-icon">${report.scriptIcon}</span>
      <span class="scan-name">${escapeHtml(report.scriptName)}</span>
      <span class="badge status-badge">${statusLabel}</span>
    </div>
  </div>

  <div class="container">
    <!-- Meta info -->
    <div class="meta-grid">
      <div class="meta-card">
        <div class="meta-label">Cible</div>
        <div class="meta-value">${escapeHtml(report.target)}</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Catégorie</div>
        <div class="meta-value">${escapeHtml(report.scriptCategory)}</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Début</div>
        <div class="meta-value">${startDate.toLocaleString("fr-FR")}</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Durée</div>
        <div class="meta-value">${endDate ? durationStr : "—"}</div>
      </div>
    </div>

    <!-- Findings -->
    ${report.findings.length > 0
      ? `
    <div class="section">
      <div class="section-title">Résultats (${report.findings.length})</div>
      <div class="findings-summary">
        ${criticalCount > 0 ? `<span class="finding-count" style="background:#ff444418;color:#ff4444">🔴 ${criticalCount} critique${criticalCount > 1 ? "s" : ""}</span>` : ""}
        ${warningCount > 0 ? `<span class="finding-count" style="background:#ffaa0018;color:#ffaa00">⚠️ ${warningCount} avertissement${warningCount > 1 ? "s" : ""}</span>` : ""}
        ${infoCount > 0 ? `<span class="finding-count" style="background:#4488ff18;color:#4488ff">ℹ️ ${infoCount} info${infoCount > 1 ? "s" : ""}</span>` : ""}
      </div>
      ${report.findings
        .map(
          (f) => `
      <div class="finding-item">
        <span class="finding-icon">${findingTypeIcon(f.type)}</span>
        <span class="finding-msg" style="color:${findingTypeColor(f.type)}">${escapeHtml(f.message)}</span>
        <span class="finding-time">${new Date(f.timestamp).toLocaleTimeString("fr-FR")}</span>
      </div>`
        )
        .join("")}
    </div>`
      : ""
    }

    <!-- Logs -->
    <div class="section">
      <div class="section-title">Logs du terminal (${report.logs.length} lignes)</div>
      <div class="terminal">
        <div class="terminal-header">
          <span class="terminal-dot" style="background:#ff5f56"></span>
          <span class="terminal-dot" style="background:#ffbd2e"></span>
          <span class="terminal-dot" style="background:#27c93f"></span>
          <span style="font-size:11px;color:#555570;font-family:monospace;margin-left:8px">terminal — review</span>
        </div>
        <div class="terminal-body">
          ${report.logs
            .map((line, i) => {
              let cls = "";
              if (line.indexOf("CRITICAL") !== -1) cls = "critical";
              else if (line.indexOf("WARNING") !== -1) cls = "warning";
              else if (
                line.indexOf("Discovered") !== -1 ||
                line.indexOf("found") !== -1
              )
                cls = "highlight";
              return `<div class="log-line"><span class="log-num">${String(i + 1).padStart(3, " ")}</span><span class="log-text ${cls}">${escapeHtml(line)}</span></div>`;
            })
            .join("")}
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    Rapport généré par Review — ${new Date().toLocaleString("fr-FR")} — ID: ${report.id}
  </div>
</body>
</html>`;
}
