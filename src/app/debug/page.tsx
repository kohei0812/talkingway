// src/app/debug/page.tsx
import { fetchSheetRowsRaw } from "@/lib/sheets";
import { rowsToShopObjects } from "@/lib/shops";

export default async function DebugPage() {
  const rows = await fetchSheetRowsRaw();
  const parsed = rowsToShopObjects(rows);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Sheets Debug</h1>

      <p style={{ marginTop: 8 }}>
        totalRows(raw): {rows.length} / headerRowIndex: {parsed.headerRowIndex} / totalItems:{" "}
        {parsed.items.length}
      </p>

      <details style={{ marginTop: 16 }} open>
        <summary>Detected headers (A..AA)</summary>
        <pre style={{ fontSize: 12, background: "#fafafa", padding: 12, overflowX: "auto" }}>
          {JSON.stringify(parsed.headers, null, 2)}
        </pre>
      </details>

      <details style={{ marginTop: 16 }} open>
        <summary>Parsed items preview (first 5)</summary>
        <pre style={{ fontSize: 12, background: "#fafafa", padding: 12, overflowX: "auto" }}>
          {JSON.stringify(parsed.items.slice(0, 5), null, 2)}
        </pre>
      </details>

      <details style={{ marginTop: 16 }}>
        <summary>Raw preview (first 10 rows)</summary>
        <pre style={{ fontSize: 12, background: "#fafafa", padding: 12, overflowX: "auto" }}>
          {JSON.stringify(rows.slice(0, 10), null, 2)}
        </pre>
      </details>
    </main>
  );
}
