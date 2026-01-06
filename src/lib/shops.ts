// src/lib/shops.ts
export const MAX_COLS_A_TO_AA = 27; // A..AA = 27 columns

function norm(s: string) {
  return (s ?? "")
    .toString()
    .trim()
    .replace(/\u3000/g, " ") // 全角スペース
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function isAllEmpty(row: string[]) {
  return row.every((c) => norm(c) === "");
}

/**
 * ヘッダー行を自動検出する
 * - 「店名」「営業」など、ありそうなキーが一定数含まれる行をヘッダーとみなす
 */
export function detectHeaderRow(rows: string[][]) {
  const mustLike = [
    "店名",
    "営業",
    "曜日",
    "タグ",
    "備考",
    "dc",
    "サーバー",
    "営業時間",
    "開始",
    "終了",
    "no",
  ].map(norm);

  let bestIdx = -1;
  let bestScore = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].slice(0, MAX_COLS_A_TO_AA);
    if (isAllEmpty(row)) continue;

    const cells = row.map(norm).filter(Boolean);

    const score = mustLike.reduce((acc, key) => {
      if (cells.some((c) => c.includes(key))) return acc + 1;
      return acc;
    }, 0);

    const avgLen =
      cells.length > 0
        ? cells.reduce((a, c) => a + c.length, 0) / cells.length
        : 999;
    const headerLikeBonus = avgLen <= 12 ? 1 : 0;

    const finalScore = score * 10 + headerLikeBonus;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestIdx = i;
    }
  }

  if (bestIdx === -1) {
    throw new Error("Header row not found. Please set it manually or adjust detection keys.");
  }

  const rawHeaders = rows[bestIdx].slice(0, MAX_COLS_A_TO_AA);

  // ヘッダーの重複/空欄に対応（空欄は col_??、重複は _2,_3 を付与）
  const seen = new Map<string, number>();
  const headers = rawHeaders.map((h, idx) => {
    const base = norm(h) || `col_${idx + 1}`; // 1-based
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}_${n}`;
  });

  return { headerRowIndex: bestIdx, headers };
}

export type ShopRecord = Record<string, string>;

/**
 * rows(string[][]) -> items(ShopRecord[])
 * - AA列まで（先頭27列）だけ使う
 * - 空行はスキップ
 * - 店名が空ならスキップ
 */
export function rowsToShopObjects(rows: string[][]): {
  headerRowIndex: number;
  headers: string[];
  items: ShopRecord[];
} {
  const { headerRowIndex, headers } = detectHeaderRow(rows);

  const items: ShopRecord[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i].slice(0, MAX_COLS_A_TO_AA);
    if (isAllEmpty(row)) continue;

    const obj: ShopRecord = {};
    headers.forEach((key, idx) => {
      obj[key] = (row[idx] ?? "").toString().trim();
    });

    if (norm(obj["店名"] ?? "") === "") continue;

    items.push(obj);
  }

  return { headerRowIndex, headers, items };
}

/* ============================
 * 営業中判定（共通関数）
 * ============================ */

export const dayKeys = ["月", "火", "水", "木", "金", "土", "日", "不定期"] as const;
export type DayKey = (typeof dayKeys)[number];

export function isTrue(v: unknown) {
  return String(v ?? "").trim().toUpperCase() === "TRUE";
}

// "22:00" / "22" / "22時" / "22時30分" / "22：30" 等を分に変換
export function parseTimeToMinutes(input: unknown): number | null {
  const s = String(input ?? "")
    .trim()
    .replace(/：/g, ":");
  if (!s) return null;

  // HH:MM
  const m1 = s.match(/^(\d{1,2})\s*:\s*(\d{1,2})$/);
  if (m1) {
    const h = Number(m1[1]);
    const min = Number(m1[2]);
    if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
    if (min < 0 || min > 59) return null;
    // 24:00 だけ許容（=1440）。それ以外の 24:* は不可。
    if (h === 24 && min === 0) return 24 * 60;
    if (h < 0 || h > 23) return null;
    return h * 60 + min;
  }

  // "22時30分" / "22時"
  const m2 = s.match(/^(\d{1,2})\s*時\s*(\d{1,2})?\s*(分)?$/);
  if (m2) {
    const h = Number(m2[1]);
    const min = m2[2] ? Number(m2[2]) : 0;
    if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
    if (h < 0 || h > 23) return null;
    if (min < 0 || min > 59) return null;
    return h * 60 + min;
  }

  // "22"
  const m3 = s.match(/^(\d{1,2})$/);
  if (m3) {
    const h = Number(m3[1]);
    if (!Number.isFinite(h)) return null;
    if (h < 0 || h > 23) return null;
    return h * 60;
  }

  return null;
}

export function getJpDayKeyFromDate(now: Date): Exclude<DayKey, "不定期"> {
  // 0=Sun ... 6=Sat
  const map: Exclude<DayKey, "不定期">[] = ["日", "月", "火", "水", "木", "金", "土"];
  return map[now.getDay()];
}

export function getYesterdayDayKey(
  today: Exclude<DayKey, "不定期">
): Exclude<DayKey, "不定期"> {
  const order: Exclude<DayKey, "不定期">[] = ["月", "火", "水", "木", "金", "土", "日"];
  const idx = order.indexOf(today);
  return order[(idx + 6) % 7];
}

/**
 * No を統一取得（一覧/詳細で同じ）
 */
export function getShopNo(shop: ShopRecord): string {
  return String(shop["No."] ?? shop["no."] ?? shop["No"] ?? shop["no"] ?? "").trim();
}

/**
 * 営業曜日ラベル（TRUEだけ）
 */
export function buildOpenDays(shop: ShopRecord): string[] {
  return dayKeys.filter((k) => isTrue(shop[k])).map((k) => k);
}

/**
 * 表示用 現在時刻（日本語）
 */
export function formatNowJa(now: Date): string {
  const youbi = getJpDayKeyFromDate(now);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}（${youbi}）`;
}

/**
 * 営業中判定
 * - 曜日フラグ（"月"..."日" or "不定期"）が TRUE
 * - 現在時刻が 開始〜終了 の範囲
 * - 日跨ぎ（開始>終了）も対応（例 22:00〜05:00）
 *
 * 期待するキー:
 * - "開始", "終了", "月"... "日", "不定期"
 */
export function isShopOpenAt(shop: ShopRecord, now: Date = new Date()): boolean {
  const startMin = parseTimeToMinutes(shop["開始"]);
  const endMin = parseTimeToMinutes(shop["終了"]);
  if (startMin == null || endMin == null) return false;

  const nowMin = now.getHours() * 60 + now.getMinutes();

  const today = getJpDayKeyFromDate(now);
  const yesterday = getYesterdayDayKey(today);

  // 「不定期」がTRUEなら曜日は全部OK扱い（必要なら後で変更可）
  const todayOn = isTrue(shop[today]) || isTrue(shop["不定期"]);
  const yesterdayOn = isTrue(shop[yesterday]) || isTrue(shop["不定期"]);

  // 開始==終了 は 24h扱い（曜日がONなら常に営業中）
  if (startMin === endMin) return todayOn;

  // 通常 (例 18:00〜23:00)
  if (startMin < endMin) {
    if (!todayOn) return false;
    return nowMin >= startMin && nowMin < endMin;
  }

  // 日跨ぎ (例 22:00〜05:00)
  // - 今日ONかつ now>=start → 今日の夜帯
  // - 昨日ONかつ now<end → 深夜の続き（昨日の営業）
  const openAsToday = todayOn && nowMin >= startMin;
  const openAsYesterday = yesterdayOn && nowMin < endMin;
  return openAsToday || openAsYesterday;
}
