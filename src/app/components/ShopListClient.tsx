"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
type Shop = Record<string, string>;

const dayKeys = ["月", "火", "水", "木", "金", "土", "日", "不定期"] as const;

/** shop の DC が単一値なら返す / 複数値なら null */
function getSingleDc(shop: Shop): string | null {
  const raw = (shop["dc"] ?? shop["DC"] ?? "") as string;

  const normalized = (raw ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[\n\r\t]/g, " ")
    .replace(/　/g, " ")
    .trim();

  if (!normalized || normalized === "-" || normalized === "なし" || normalized === "非公開") return null;

  const tokens = normalized.split(/[ ,/]+/).filter(Boolean);
  if (tokens.length !== 1) return null;

  const token = tokens[0].trim();
  if (!token || token === "-" || token === "なし" || token === "非公開") return null;

  return token;
}

// "HH:MM" -> minutes
function parseTimeToMinutes(raw: string): number | null {
  const s = (raw ?? "").trim();
  if (!s) return null;

  const m = s.match(/^(\d{1,2})[:：](\d{2})$/);
  if (!m) return null;

  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  if (mm < 0 || mm > 59) return null;

  // 24:00 を許容（=1440）
  if (hh === 24 && mm === 0) return 24 * 60;
  if (hh < 0 || hh > 23) return null;

  return hh * 60 + mm;
}

function getTodayKeyJa(d: Date): (typeof dayKeys)[number] {
  // getDay(): 0=Sun..6=Sat
  const map: (typeof dayKeys)[number][] = ["日", "月", "火", "水", "木", "金", "土", "日"];
  return map[d.getDay()] ?? "日";
}

function isOpenNow(shop: Shop, now: Date): boolean {
  const todayKey = getTodayKeyJa(now);

  const todayFlag = (shop[todayKey] ?? "").toUpperCase() === "TRUE";
  const irregularFlag = (shop["不定期"] ?? "").toUpperCase() === "TRUE";

  // 曜日が当てはまらないなら営業中扱いにしない
  if (!todayFlag && !irregularFlag) return false;

  const startRaw = shop["開始"] ?? "";
  const endRaw = shop["終了"] ?? "";
  const start = parseTimeToMinutes(startRaw);
  const end = parseTimeToMinutes(endRaw);

  // 時間が取れない店は「営業中判定できない」ので false
  if (start == null || end == null) return false;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // 通常: start < end
  if (start < end) {
    return nowMinutes >= start && nowMinutes < end;
  }

  // 日跨ぎ: 20:00〜02:00
  if (start > end) {
    return nowMinutes >= start || nowMinutes < end;
  }

  // start === end は解釈不能（必要なら 24h 扱いに変えられる）
  return false;
}

function formatNowJa(d: Date) {
  const youbi = getTodayKeyJa(d);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}（${youbi}）`;
}

function getShopNo(shop: Shop) {
  return (shop["No."] ?? shop["no."] ?? shop["No"] ?? shop["no"] ?? "").trim();
}

export default function ShopListClient({ items }: { items: Shop[] }) {
  // APIからoptionsを取得
  const [options, setOptions] = useState<{ dcs: string[], races: string[], days: string[] }>({ dcs: [], races: [], days: [] });

  useEffect(() => {
    fetch('/api/shops')
      .then(res => res.json())
      .then(data => setOptions(data.options))
      .catch(console.error);
  }, []);
  // 「営業列が '-' のものだけ」を母集団に固定
  const baseItems = useMemo(() => {
    return items.filter((shop) => (shop["営業"] ?? "").trim() === "-");
  }, [items]);

  // 現在時刻（営業中判定用）: 1分ごとに更新
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // タブ
  const [tab, setTab] = useState<"all" | "open">("all");

  // 入力中の値（フォームの見た目）
  const [dcInput, setDcInput] = useState("");
  const [raceInput, setRaceInput] = useState("");
  const [dayInput, setDayInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  // 検索ボタンを押した時に確定する値（実フィルタに使う）
  const [query, setQuery] = useState({
    dc: "",
    race: "",
    day: "",
    name: "",
  });

  // セレクト候補（APIから取得）
  const { dcs, races, days } = options;

  // タブで母集団を切り替え
  const tabbedItems = useMemo(() => {
    if (tab === "all") return baseItems;
    return baseItems.filter((shop) => isOpenNow(shop, now));
  }, [baseItems, tab, now]);

  // フィルタ結果（タブ適用後に検索条件を適用）
  const filtered = useMemo(() => {
    const qName = query.name.trim().toLowerCase();

    return tabbedItems.filter((shop) => {
      const shopDcSingle = getSingleDc(shop);
      const shopRace = (shop["種族・性別"] ?? "").trim();
      const shopName = (shop["店名"] ?? "").trim().toLowerCase();

      if (query.dc) {
        if (!shopDcSingle) return false;
        if (shopDcSingle !== query.dc) return false;
      }

      if (query.race && shopRace !== query.race) return false;

      if (query.day) {
        const v = (shop[query.day] ?? "").toUpperCase();
        if (v !== "TRUE") return false;
      }

      if (qName && !shopName.includes(qName)) return false;

      return true;
    });
  }, [tabbedItems, query]);

  const onSearch = () => {
    setQuery({
      dc: dcInput,
      race: raceInput,
      day: dayInput,
      name: nameInput,
    });
  };
  return (
    <>
      {/* 検索バー */}
      <section id="search">
        <div className="search-field">
          <label className="search-label">DC</label>
          <select
            className="search-control"
            name="dc"
            value={dcInput}
            onChange={(e) => setDcInput(e.target.value)}
          >
            <option value="">指定なし</option>
            {dcs.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label className="search-label">種族・性別</label>
          <select
            className="search-control"
            name="race"
            value={raceInput}
            onChange={(e) => setRaceInput(e.target.value)}
          >
            <option value="">指定なし</option>
            {races.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label className="search-label">営業曜日</label>
          <select
            className="search-control"
            name="day"
            value={dayInput}
            onChange={(e) => setDayInput(e.target.value)}
          >
            <option value="">指定なし</option>
            {days.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label className="search-label">店名</label>
          <input
            className="search-control"
            type="text"
            name="name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="例：20minutes"
          />
        </div>

        <div className="search-actions">
          <button className="search-button" type="button" onClick={onSearch}>
            検索
          </button>
        </div>
      </section>
      {/* タブ（検索バーと一覧の間） */}
      <section id="tab" aria-label="表示切り替え">
        <div className="container">
          <div className="tab-buttons">
            <button
              type="button"
              className={`tab-buttons__item ${tab === "all" ? "is-active" : ""}`}
              onClick={() => setTab("all")}
            >
              全ての店舗
            </button>
            <button
              type="button"
              className={`tab-buttons__item ${tab === "open" ? "is-active" : ""}`}
              onClick={() => setTab("open")}
            >
              営業中の店舗
            </button>
            <div className="tab-note">現在時刻: {formatNowJa(now)}</div>
            <p className="tab-count">全 {filtered.length} 件</p>
          </div>
        </div>
      </section>
      {/* 一覧 */}
      <section id="shop">
        <div className="container">
          <div className="shop-list">
            {filtered.map((shop, idx) => {
              // ---- 基本 ----
              const no = getShopNo(shop);
              const name = (shop["店名"] ?? "").trim();
              const status = shop["営業"] ?? "";
              const dc = shop["DC"] ?? shop["dc"] ?? "";
              const server = shop["サーバー"] ?? "";
              const start = shop["開始"] ?? "";
              const end = shop["終了"] ?? "";
              const price = shop["金額"] ?? "";
              const race = shop["種族・性別"] ?? "";
              const xtag = shop["Xタグ"] ?? shop["xタグ"] ?? "";
              const note = shop["備考"] ?? "";
              const checkedAt = shop["最終確認日"] ?? "";

              // ---- 追加（後で整理する用）----
              const mon = shop["月"] ?? "";
              const tue = shop["火"] ?? "";
              const wed = shop["水"] ?? "";
              const thu = shop["木"] ?? "";
              const fri = shop["金"] ?? "";
              const sat = shop["土"] ?? "";
              const sun = shop["日"] ?? "";
              const irregular = shop["不定期"] ?? "";

              const priceDetail = shop["金額詳細"] ?? "";

              const xId = shop["x id"] ?? "";
              const xUrl = shop["x url"] ?? "";
              const tagUrl = shop["ﾀｸﾞurl"] ?? "";

              const hp = shop["hp"] ?? "";
              const advanceBooking = shop["事前予約"] ?? "";

              const youbi = shop["曜日"] ?? "";
              const businessStatus = shop["営業ステータス"] ?? "";
              const timeText = shop["時間"] ?? "";

              const twitterId = shop["twitter id"] ?? "";
              const tagText = shop["タグ"] ?? "";

              const duplicateCheck = shop["重複確認"] ?? "";
              const nameCheck = shop["店名(確認用)"] ?? "";

              const openNow = isOpenNow(shop, now);

              // no が空なら detail へ飛べないのでリンク無効化（とりあえず）
              const href = no ? `/shops/${encodeURIComponent(no)}` : undefined;

              const CardInner = (
                <article className="shop-card">
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
                  <h2 className="shop-card__title">
                    <span className="shop-card__name">{name || "(店名なし)"}</span>
                  </h2>
                  <div className="shop-card__dc">DC: {dc || "-"}</div>
                  <div className="shop-card__server">サーバー: {server || "-"}</div>
                  {xtag && (
                    <div className="shop-card__tag">
                      <span>{xtag}</span>
                    </div>
                  )
                  }
                  <div className="shop-card__flex">
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
                    )

                    }
                    {xId && (
                      <div className="shop-card__x">
                        <div className="shop-card__icon">
                          <Image
                            src="/x.svg"
                            alt="x"
                            width={15}
                            height={11}
                          />
                        </div>
                        <span>{xId}</span>
                      </div>
                    )
                    }
                  </div>
                  {price && (
                    <div className="shop-card__price">
                      <Image
                        src="/price.svg"
                        alt="price"
                        width={10}
                        height={11}
                      />
                      <span>通常</span>
                      {price}
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
                      <span>{hp}</span>
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
                </article>
              );
              return href ? (
                <Link key={`${no}-${idx}`} href={href} className="shop-card__link">
                  {CardInner}
                </Link>
              ) : (
                <div key={`no-missing-${idx}`} className="shop-card__link is-disabled" aria-disabled="true">
                  {CardInner}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
