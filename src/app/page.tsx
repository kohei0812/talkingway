// src/app/page.tsx
import { fetchSheetRowsRaw } from "@/lib/sheets";
import { rowsToShopObjects } from "@/lib/shops";
import ShopListClient from "@/app/components/ShopListClient";

export default async function Home() {
  const rows = await fetchSheetRowsRaw();
  const { items } = rowsToShopObjects(rows);

  // トップページ表示対象：営業列が「-」のみ
  const topItems = items.filter((shop) => (shop["営業"] ?? "").trim() === "-");

  return (
    <main className="page">
      <h1 className="page__title">お店一覧</h1>

      {/* 検索UI + 一覧 + 結果件数（Client側で動かす） */}
      <ShopListClient items={topItems} />
    </main>
  );
}
