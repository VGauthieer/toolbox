import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const REPORTS_DIR = path.join(process.cwd(), "data", "reports");

// GET /api/reports/:id/html — Serve the generated HTML report file
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const htmlPath = path.join(REPORTS_DIR, `${id}.html`);

    try {
      await fs.access(htmlPath);
    } catch {
      return NextResponse.json(
        { error: "HTML report not found" },
        { status: 404 }
      );
    }

    const html = await fs.readFile(htmlPath, "utf-8");

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${id}.html"`,
      },
    });
  } catch (error) {
    console.error("Error serving HTML report:", error);
    return NextResponse.json(
      { error: "Failed to serve HTML report" },
      { status: 500 }
    );
  }
}
