"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    return <div id="loading">
      <Image
        src="/loading.gif"
        alt="loading"
        width={1000}
        height={850}
      />
      <p>Loading...</p>
    </div>;
  }

  if (!shop) {
    return (
      <main id="single">
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

  const xId = pick(shop, "x id") || pick(shop, "Twitter ID");
  const xUrl = pick(shop, "x url");
  const xTag = pick(shop, "Xタグ") || pick(shop, "xタグ");
  const tagUrl = pick(shop, "ﾀｸﾞURL");

  const hp = pick(shop, "hp");
  const advanceBooking = shop["事前予約"] ?? "";
  const note = pick(shop, "備考");
  const checkedAt = pick(shop, "最終確認日");

  // ---- 追加（後で整理する用）----
  const mon = shop["月"] ?? "";
  const tue = shop["火"] ?? "";
  const wed = shop["水"] ?? "";
  const thu = shop["木"] ?? "";
  const fri = shop["金"] ?? "";
  const sat = shop["土"] ?? "";
  const sun = shop["日"] ?? "";
  const irregular = shop["不定期"] ?? "";
  return (
    <>
      <main id="single">
        {/* page-header */}
        <section id="page-header">
          <div className="hero-container">
            <h1 className="hero-ttl">{name || "(店名なし)"} </h1>
          </div>
        </section>
        {/* content */}
        <section id="shop">
          <div className="container shop-container">
            <div className="shop-card">
              <div className="shop-card__ttl">
                {name || "(店名なし)"}
                <div className="shop-card__status">
                  {openNow ? <span className="shop-card__openLabel">
                    <Image
                      src="/shop-card__openLabel.svg"
                      alt="OPEN"
                      width={15}
                      height={11}
                    />
                    営業中
                  </span> : null}
                </div>
              </div>
              <div className="shop-card__locate">
                {dc && (
                  <span className="shop-card__dc">{dc}</span>
                )}
                {server && (
                  <span className="shop-card__server">{server}</span>
                )}
              </div>
              {xTag && (
                <div className="shop-card__tag">
                  {xUrl ? (
                    <Link target="_blank" href={xUrl}>{xTag}</Link>
                  ) : (
                    <span>{xTag}</span>
                  )}
                </div>
              )}
              {race && (
                <div className="shop-card__race">
                  <Image
                    src="/race.svg"
                    alt="race"
                    width={15}
                    height={11}
                  />
                  <span>{race}</span>
                </div>
              )}
              {xId && (
                <div className="shop-card__x">
                  <div className="shop-card__icon">
                    <Image
                      src="/x.svg"
                      alt="x"
                      width={6}
                      height={6}
                    />
                  </div>

                  {xUrl ? (
                    <Link target="_blank" href={xUrl}>{xId}</Link>
                  ) : (
                    <span>{xId}</span>
                  )}
                </div>
              )}
              {price && (
                <div className="shop-card__price">
                  <Image
                    src="/price.svg"
                    alt="price"
                    width={10}
                    height={11}
                  />
                  <div className="shop-card__fee">
                    <div className="item">
                      <span>通常</span>
                      {price}
                    </div>
                    <div className="item">
                      <span>詳細</span>
                      {priceDetail && (priceDetail)}
                    </div>
                  </div>
                </div>
              )
              }
              {hp && (
                <div className="shop-card__hp">
                  <Image
                    src="/hp.svg"
                    alt="hp"
                    width={10}
                    height={11}
                  />
                  <Link target="_blank" href={hp}>{hp}</Link>
                </div>
              )}
              <div className="shop-card__youbi">
                <Image
                  src="/youbi.svg"
                  alt="youbi"
                  width={10}
                  height={10}
                />
                {mon === "TRUE" && <span>月</span>}
                {tue === "TRUE" && <span>火</span>}
                {wed === "TRUE" && <span>水</span>}
                {thu === "TRUE" && <span>木</span>}
                {fri === "TRUE" && <span>金</span>}
                {sat === "TRUE" && <span className="orange">土</span>}
                {sun === "TRUE" && <span className="orange">日</span>}
                {irregular === "TRUE" && <span className="irregular">不定期</span>}
              </div>
              <div className="shop-card__time">
                <Image
                  src="/time.svg"
                  alt="time"
                  width={10}
                  height={10}
                />
                <span> {start || "-"}</span>〜<span>{end || "-"}</span>
              </div>
              <div className="shop-card__reserve">事前予約: <span>{advanceBooking || "なし"}</span></div>
              <div className="shop-card__desc">備考: {note || "-"}</div>
              {checkedAt && (
                <div className="shop-card__check">最終確認日: {checkedAt}</div>
              )}
            </div>
          </div>
        </section>

        <Link className="totop" href="/">一覧へ戻る</Link>
      </main>
    </>
  );
}
