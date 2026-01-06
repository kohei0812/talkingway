// src/lib/sheets.ts
import { parse } from "csv-parse/sync";

type CacheEntry = {
  at: number; // Date.now()
  rows: string[][];
};

declare global {
  // eslint-disable-next-line no-var
  var __sheetCache: CacheEntry | undefined;
}

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/**
 * 公開Google SheetsをCSV exportで取得するURLを組み立て
 * 例: https://docs.google.com/spreadsheets/d/{ID}/export?format=csv&gid={GID}
 */
function buildCsvExportUrl(): string {
  const id = getEnv("SHEETS_ID");
  const gid = getEnv("SHEETS_GID");
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

/**
 * 公開スプシを全件取得して、CSVを rows(string[][]) にして返す
 * - まずは「全行・全列」を取って中身を確認
 * - 将来的に A:AA に絞るなら gviz か Sheets API(要認証) へ移行、または整形時に列カット
 */
export async function fetchSheetRowsRaw(): Promise<string[][]> {
  const ttlSec = Number(process.env.SHEETS_CACHE_TTL_SECONDS ?? "120");
  const now = Date.now();

  // メモリキャッシュ（開発/単一プロセス想定。Vercel等は別途キャッシュが必要）
  if (global.__sheetCache && now - global.__sheetCache.at < ttlSec * 1000) {
    return global.__sheetCache.rows;
  }

  const url = buildCsvExportUrl();

  // 公開シートなので認証なし
  const res = await fetch(url, {
    // Next.js の fetch キャッシュは環境により挙動が変わるので、
    // ここではメモリキャッシュで統一
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}\n${text}`);
  }

  const csvText = await res.text();

  // CSVを2次元配列へ
  const records = parse(csvText, {
    columns: false,
    skip_empty_lines: false,
    relax_quotes: true,
    relax_column_count: true,
  }) as string[][];

  global.__sheetCache = { at: now, rows: records };
  return records;
}
