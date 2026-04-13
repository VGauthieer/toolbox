import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";


export async function POST(req: NextRequest) {
    const { command } = await req.json();


    if (/[;&|'$(){}]/.test(command)) {
        return new Response("Command invalide", { status: 400 });

    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const process = exec(command);
            process.stdout?.on("data", (data) => {
                controller.enqueue(encoder.encode(data));
            });

            process.stderr?.on("data", (data) => {
                controller.enqueue(encoder.encode(data))
            });

            process.on("close", () => {
                controller.close();
            });

            process.on("error", (err) => {
                controller.enqueue(encoder.encode('Erreur: ${err.message'));
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}