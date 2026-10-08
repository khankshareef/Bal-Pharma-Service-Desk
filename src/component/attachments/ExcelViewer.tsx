import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Loader from "../loader/Loader";

interface Props {
  url: string;
  name: string;
}

interface Sheet {
  name: string;
  rows: any[][];
}

const ExcelViewer = ({ url, name }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buf) => {
        if (cancelled) return;
        const wb = XLSX.read(buf, { type: "array" });
        const out: Sheet[] = wb.SheetNames.map((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const rows: any[][] = XLSX.utils.sheet_to_json(ws, {
            header: 1,
            defval: "",
            raw: false,
          });
          return { name: sheetName, rows };
        });
        setSheets(out);
        setActive(0);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load spreadsheet.");
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
        <Loader text="Loading spreadsheet" />
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

  const current = sheets[active];
  if (!current) return null;

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden">
      {sheets.length > 1 && (
        <div className="flex gap-1 border-b border-gray-100 bg-gray-50 px-3 pt-2 overflow-x-auto">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActive(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-md whitespace-nowrap ${
                i === active
                  ? "bg-white border border-b-0 border-gray-200 text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-auto max-h-[520px]">
        <table className="min-w-full text-xs border-collapse">
          <tbody>
            {current.rows.map((row, r) => (
              <tr
                key={r}
                className={
                  r === 0 ? "bg-gray-50 font-semibold text-gray-800 sticky top-0" : ""
                }
              >
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className="border border-gray-100 px-3 py-1.5 text-gray-700 whitespace-nowrap align-top"
                  >
                    {String(cell ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100">
        {name} · {current.rows.length} rows · {sheets.length} sheet
        {sheets.length > 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default ExcelViewer;