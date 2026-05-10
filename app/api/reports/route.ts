import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateHtmlReport } from "@/app/lib/html-template";
import type { ReportData } from "@/app/lib/html-template";

const REPORTS_DIR = path.join(process.cwd(), "data", "reports");

async function ensureReportsDir() {
  await fs.mkdir(REPORTS_DIR, { recursive: true });
}

// GET /api/reports — List all saved reports
export async function GET() {
  try {
    await ensureReportsDir();
    const files = await fs.readdir(REPORTS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const reports: ReportData[] = [];
    for (const file of jsonFiles) {
      const content = await fs.readFile(path.join(REPORTS_DIR, file), "utf-8");
      try {
        reports.push(JSON.parse(content));
      } catch {
        // Skip malformed files
      }
    }

    // Sort by startTime descending (most recent first)
    reports.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error listing reports:", error);
    return NextResponse.json(
      { error: "Failed to list reports" },
      { status: 500 }
    );
  }
}

// POST /api/reports — Save a new report (JSON + HTML)
export async function POST(req: NextRequest) {
  try {
    await ensureReportsDir();
    const report: ReportData = await req.json();

    if (!report.id) {
      return NextResponse.json(
        { error: "Missing report ID" },
        { status: 400 }
      );
    }

    // Write JSON
    const jsonPath = path.join(REPORTS_DIR, `${report.id}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

    // Generate and write HTML
    const html = generateHtmlReport(report);
    const htmlPath = path.join(REPORTS_DIR, `${report.id}.html`);
    await fs.writeFile(htmlPath, html, "utf-8");

    return NextResponse.json({
      success: true,
      id: report.id,
      files: {
        json: `data/reports/${report.id}.json`,
        html: `data/reports/${report.id}.html`,
      },
    });
  } catch (error) {
    console.error("Error saving report:", error);
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 }
    );
  }
}
