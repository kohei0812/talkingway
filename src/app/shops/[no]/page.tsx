"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getShopNo,
  buildOpenDays,
  isShopOpenAt,
  formatNowJa,
  ShopRecord,
} from "@/lib/shops";

function pick(shop: ShopRecord, key: string) {
  return String(shop[key] ?? "").trim();
}

export default function ShopDetailPage({ params }: { params: { no: string } }) {
  const [shop, setShop] = useState<ShopRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [noParam, setNoParam] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await Promise.resolve(params);
      const no = decodeURIComponent(resolvedParams.no).trim();
      setNoParam(no);

      try {
        const response = await fetch('/api/debug/shops');
        const data = await response.json();
        const foundShop = data.items.find((x: ShopRecord) => getShopNo(x) === no);
        
        setShop(foundShop || null);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
        setShop(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const openNow = useMemo(() => shop ? isShopOpenAt(shop, now) : false, [shop, now]);
  const openDays = useMemo(() => shop ? buildOpenDays(shop) : [], [shop]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!shop) {
    return (
      <main className="single">
        <h1 className="single-ttl">店舗が見つかりません</h1>
        <p>No: {noParam}</p>
        <p>
          <Link href="/">一覧へ戻る</Link>
        </p>
      </main>
    );
  }

  // 主要カラム
  const no = getShopNo(shop);
  const name = pick(shop, "店名");
  const status = pick(shop, "営業");

  const start = pick(shop, "開始");
  const end = pick(shop, "終了");
  const dc = pick(shop, "DC") || pick(shop, "dc");
  const server = pick(shop, "サーバー");
  const price = pick(shop, "金額");
  const priceDetail = pick(shop, "金額詳細");
  const race = pick(shop, "種族・性別");

  const xId = pick(shop, "X ID") || pick(shop, "Twitter ID");
  const xUrl = pick(shop, "X URL");
  const xTag = pick(shop, "Xタグ") || pick(shop, "xタグ");
  const tagUrl = pick(shop, "ﾀｸﾞURL");

  const hp = pick(shop, "HP");
  const reserve = pick(shop, "事前予約");
  const note = pick(shop, "備考");
  const checkedAt = pick(shop, "最終確認日");

  return (
    <main className="index">
      <p style={{ marginBottom: 12 }}>
        <Link href="/">← 一覧へ戻る</Link>
      </p>

      <h1 className="index-title">
        {name || "(店名なし)"} {no ? <span style={{ fontSize: 14 }}>#{no}</span> : null}
      </h1>

      <div style={{ marginBottom: 12 }}>
        <span>現在時刻: {formatNowJa(now)}</span>
        {openNow ? <span style={{ marginLeft: 12 }}>【営業中】</span> : null}
      </div>

      <section className="shop-detail">
        <div className="shop-detail__row">営業: {status || "-"}</div>

        <div className="shop-detail__row">
          営業曜日:{" "}
          {openDays.length ? (
            <span>
              {openDays.map((d) => (
                <span key={d} style={{ marginRight: 8 }}>
                  {d}
                </span>
              ))}
            </span>
          ) : (
            "-"
          )}
        </div>

        <div className="shop-detail__row">時間: {start || "-"}〜{end || "-"}</div>
        <div className="shop-detail__row">DC: {dc || "-"}</div>
        <div className="shop-detail__row">サーバー: {server || "-"}</div>

        <div className="shop-detail__row">金額: {price || "-"}</div>
        {priceDetail ? <div className="shop-detail__row">金額詳細: {priceDetail}</div> : null}

        <div className="shop-detail__row">種族・性別: {race || "-"}</div>

        {xId ? <div className="shop-detail__row">X ID: {xId}</div> : null}
        {xUrl ? (
          <div className="shop-detail__row">
            X URL:{" "}
            <a href={xUrl} target="_blank" rel="noreferrer">
              {xUrl}
            </a>
          </div>
        ) : null}
        {xTag ? <div className="shop-detail__row">Xタグ: {xTag}</div> : null}
        {tagUrl ? (
          <div className="shop-detail__row">
            ﾀｸﾞURL:{" "}
            <a href={tagUrl} target="_blank" rel="noreferrer">
              {tagUrl}
            </a>
          </div>
        ) : null}

        {hp ? (
          <div className="shop-detail__row">
            HP:{" "}
            <a href={hp} target="_blank" rel="noreferrer">
              {hp}
            </a>
          </div>
        ) : null}

        {reserve ? <div className="shop-detail__row">事前予約: {reserve}</div> : null}
        {note ? <div className="shop-detail__row">備考: {note}</div> : null}
        {checkedAt ? <div className="shop-detail__row">最終確認日: {checkedAt}</div> : null}
      </section>
    </main>
  );
}
