// src/app/page.tsx
import { fetchSheetRowsRaw } from "@/lib/sheets";
import { rowsToShopObjects } from "@/lib/shops";
import { SITE_TITLE } from "@/lib/constants";
import ShopListClient from "@/app/components/ShopListClient";
import Link from "next/link";

export default async function Home() {
  const rows = await fetchSheetRowsRaw();
  const { items } = rowsToShopObjects(rows);

  // トップページ表示対象：営業列が「-」のみ
  const topItems = items.filter((shop) => (shop["営業"] ?? "").trim() === "-");

  return (
    <>
      <main id="front">
        {/* hero */}
        <section id="hero">
          <div className="hero-container">
            <p className="hero-lead"><span>{ SITE_TITLE }</span></p>
          </div>
          <p className="hero-ttl">Final Fantasy XIV</p>
        </section>
        {/* 検索UI + 一覧 + 結果件数（Client側で動かす） */}
        <ShopListClient items={topItems} />
        <Link href="/about">このサイトについて</Link>
      </main>
       
    </>
  );
}
