import { exec } from "child_process";
import path from "path";

const UPDATE_SCRIPT = path.join(process.cwd(), "auto-update.sh");

export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const proc = exec(`bash "${UPDATE_SCRIPT}"`);

      proc.stdout?.on("data", (data: string) => {
        controller.enqueue(encoder.encode(data));
      });

      proc.stderr?.on("data", (data: string) => {
        controller.enqueue(encoder.encode(data));
      });

      proc.on("close", (code: number | null) => {
        controller.enqueue(
          encoder.encode(`\n[EXIT] code ${code ?? "?"}`)
        );
        controller.close();
      });

      proc.on("error", (err: Error) => {
        controller.enqueue(encoder.encode(`Erreur: ${err.message}`));
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
