"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadScan } from "@/app/lib/scan-storage";
import type { ScanResult } from "@/app/components/ScanStatus";

type FullScan = ScanResult & { logs: string[] };

export default function ReportPage() {
    const params = useParams();
    const id = params.id as string;
    const [scanData, setScanData] = useState<FullScan | null>(null);

    useEffect(() => {
        const data = loadScan(id);
        setScanData(data);
    }, [id]);

    if (!scanData) return <p>Rapport introuvable</p>

    return (
        <div>
            <h1>{scanData.script.name}</h1>
            <p>Cible : {scanData.target}</p>
            <p>Status : {scanData.status}</p>
            <p>Début : {scanData.startTime.toLocaleString("fr-FR")}</p>

            <h2>Logs</h2>
            {scanData.logs.map((log, i) => (
                <p key={i}>{log}</p>
            ))}

            <h2>Résultats ({scanData.findings.length})</h2>
            {scanData.findings.map((f, i) => (
                <p key={i}>[{f.type}] {f.message}</p>
            ))}
        </div>
    );
}