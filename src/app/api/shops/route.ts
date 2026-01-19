// src/app/api/shops/route.ts
import { NextResponse } from "next/server";
import { fetchSheetRowsRaw } from "@/lib/sheets";
import { rowsToShopObjects } from "@/lib/shops";

function uniqSorted(values: string[]) {
  return Array.from(
    new Set(values.map((v) => (v ?? "").trim()).filter((v) => v !== "" && v !== "-" && v !== "なし"))
  ).sort((a, b) => a.localeCompare(b, "ja"));
}

function extractDcOptions(rawValues: string[]) {
  const out = new Set<string>();

  for (const raw of rawValues) {
    const v = (raw ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/[\n\r]/g, "/")
      .replace(/[\t]/g, " ")
      .replace(/　/g, " ")
      .trim();

    if (!v || v === "-" || v === "なし" || v === "非公開") continue;

    // スペース・カンマを/に統一して整形
    const normalized = v
      .split(/[ ,/]+/)
      .filter((t) => t && t !== "-" && t !== "なし" && t !== "非公開")
      .join("/");

    if (!normalized) continue;

    out.add(normalized);
  }

  return Array.from(out).sort((a, b) => a.localeCompare(b, "ja"));
}

export async function GET() {
  const rows = await fetchSheetRowsRaw();
  const { items } = rowsToShopObjects(rows);

  const dcs = extractDcOptions(items.map((x) => (x["dc"] ?? x["DC"] ?? "") as string));
  const servers = uniqSorted(items.map((x) => (x["サーバー"] ?? "") as string));
  const races = uniqSorted(items.map((x) => (x["種族・性別"] ?? "") as string));

  const dayKeys = ["月", "火", "水", "木", "金", "土", "日"];
  const days = dayKeys.filter((k) => items.some((x) => (x[k] ?? "").toUpperCase() === "TRUE"));

  return NextResponse.json({
    total: items.length,
    items,
    options: { dcs, servers, races, days },
  });
}
