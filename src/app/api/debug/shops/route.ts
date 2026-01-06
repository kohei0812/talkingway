import { NextResponse } from "next/server";
import { fetchSheetRowsRaw } from "@/lib/sheets";
import { rowsToShopObjects } from "@/lib/shops";

export async function GET() {
  const rows = await fetchSheetRowsRaw();
  const parsed = rowsToShopObjects(rows);

  // ブラウザが重い場合に備えて、ヘッダーや行番号も含めて渡す
  return NextResponse.json(
    {
      meta: {
        totalRawRows: rows.length,
        headerRowIndex: parsed.headerRowIndex,
        headers: parsed.headers,
        totalItems: parsed.items.length,
      },
      items: parsed.items,
    },
    {
      // JSONとして扱いやすくする（大きいのでキャッシュ無効が無難）
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
