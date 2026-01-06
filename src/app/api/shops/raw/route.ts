// src/app/api/shops/raw/route.ts
import { NextResponse } from "next/server";
import { fetchSheetRowsRaw } from "@/lib/sheets";

export async function GET() {
  const rows = await fetchSheetRowsRaw();

  return NextResponse.json({
    totalRows: rows.length,
    preview: rows.slice(0, 15), // 先頭だけプレビュー
  });
}
