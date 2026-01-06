// src/app/api/shops/route.ts
import { NextResponse } from "next/server";
import { fetchSheetRowsRaw } from "@/lib/sheets";
import { rowsToShopObjects } from "@/lib/shops";

function uniqSorted(values: string[]) {
  return Array.from(
    new Set(values.map((v) => (v ?? "").trim()).filter((v) => v !== "" && v !== "-" && v !== "なし"))
  ).sort((a, b) => a.localeCompare(b, "ja"));
}

function extractSingleDcOptions(rawValues: string[]) {
  const out = new Set<string>();

  for (const raw of rawValues) {
    const v = (raw ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/[\n\r\t]/g, " ")
      .replace(/　/g, " ")
      .trim();

    if (!v || v === "-" || v === "なし" || v === "非公開") continue;

    const tokens = v.split(/[ ,/]+/).filter(Boolean);
    if (tokens.length !== 1) continue; // ←複数値は除外

    const token = tokens[0].trim();
    if (!token || token === "-" || token === "なし" || token === "非公開") continue;

    out.add(token);
  }

  return Array.from(out).sort((a, b) => a.localeCompare(b, "ja"));
}

export async function GET() {
  const rows = await fetchSheetRowsRaw();
  const { items } = rowsToShopObjects(rows);

  const dcs = extractSingleDcOptions(items.map((x) => (x["dc"] ?? x["DC"] ?? "") as string));
  const servers = uniqSorted(items.map((x) => (x["サーバー"] ?? "") as string));
  const races = uniqSorted(items.map((x) => (x["種族・性別"] ?? "") as string));

  const dayKeys = ["月", "火", "水", "木", "金", "土", "日", "不定期"];
  const days = uniqSorted(dayKeys.filter((k) => items.some((x) => (x[k] ?? "").toUpperCase() === "TRUE")));

  return NextResponse.json({
    total: items.length,
    items,
    options: { dcs, servers, races, days },
  });
}
