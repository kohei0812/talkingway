// src/app/page.tsx
import { fetchSheetRowsRaw } from "@/lib/sheets";
import { rowsToShopObjects } from "@/lib/shops";
import ShopListClient from "@/app/components/ShopListClient";
import AboutLinkWithScroll from "@/app/components/AboutLinkWithScroll";
import Image from "next/image";

export default async function Home() {
  const rows = await fetchSheetRowsRaw();
  const { items } = rowsToShopObjects(rows);

  // トップページ表示対象：営業列が「-」のみ
  const topItems = items.filter((shop) => (shop["営業"] ?? "").trim() === "-");

  return (
    <>
      <main id="front">
        <Image
          className="main-bg"
          src="/main-bg.png"
          alt="背景"
          width={1175}
          height={453}
        />
        {/* hero */}
        <section id="hero">
          <div className="hero-container">
            <h1 className="hero-lead"><span>トーキングウェイの</span><br />
              <span>有料対話店Navi</span></h1>
          </div>
          <Image
            className="hero-ttl"
            src="/hero-eng.png"
            alt="Talkingway's RP conversation venue Navi"
            width={821}
            height={229}
          />
        </section>
        {/* 検索UI + 一覧 + 結果件数（Client側で動かす） */}
        <ShopListClient items={topItems} />
        <AboutLinkWithScroll />
      </main>
    </>
  );
}
