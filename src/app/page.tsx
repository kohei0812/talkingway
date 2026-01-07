// src/app/page.tsx
import { fetchSheetRowsRaw } from "@/lib/sheets";
import { rowsToShopObjects } from "@/lib/shops";
import ShopListClient from "@/app/components/ShopListClient";
import Header from "./components/Header";
import Link from "next/link";

export default async function Home() {
  const rows = await fetchSheetRowsRaw();
  const { items } = rowsToShopObjects(rows);

  // トップページ表示対象：営業列が「-」のみ
  const topItems = items.filter((shop) => (shop["営業"] ?? "").trim() === "-");

  return (
    <>
    <Header />
    <main id="front">
      {/* hero */}
      <section className="hero">
        <p className="hero-lead">テキストテキストテキストテキスト</p>
        <p className="hero-ttl">Site Title</p>
      </section>
      {/* 検索UI + 一覧 + 結果件数（Client側で動かす） */}
      <ShopListClient items={topItems} />
      <Link href="/about">このサイトについて</Link>
    </main>
    </>
  );
}
