import { useEffect, useState } from "react";
import Loader from "../loader/Loader";

interface Props {
  url: string;
  name: string;
}

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let cur: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        cur.push(cell);
        cell = "";
      } else if (ch === "\n") {
        cur.push(cell);
        rows.push(cur);
        cur = [];
        cell = "";
      } else if (ch === "\r") {
        // skip
      } else {
        cell += ch;
      }
    }
  }
  if (cell.length || cur.length) {
    cur.push(cell);
    rows.push(cur);
  }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
};

const CsvViewer = ({ url, name }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<string[][]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (!cancelled) setRows(parseCsv(text));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load CSV.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-white rounded-lg border border-gray-200">
        <Loader text="Loading CSV" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
        {error}
      </div>
    );
  }

  const header = rows[0] ?? [];
  const body = rows.slice(1);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-auto max-h-[520px]">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 sticky top-0">
              {header.map((h, i) => (
                <th
                  key={i}
                  className="border border-gray-100 px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td
                    key={j}
                    className="border border-gray-100 px-3 py-1.5 text-gray-700 whitespace-nowrap align-top"
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100">
        {name} · {body.length} rows
      </div>
    </div>
  );
};

export default CsvViewer;