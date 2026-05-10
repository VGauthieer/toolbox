import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { ReportData } from "@/app/lib/html-template";

const REPORTS_DIR = path.join(process.cwd(), "data", "reports");

// GET /api/reports/:id — Get a single report by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jsonPath = path.join(REPORTS_DIR, `${id}.json`);

    try {
      await fs.access(jsonPath);
    } catch {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const content = await fs.readFile(jsonPath, "utf-8");
    const report: ReportData = JSON.parse(content);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error reading report:", error);
    return NextResponse.json(
      { error: "Failed to read report" },
      { status: 500 }
    );
  }
}
