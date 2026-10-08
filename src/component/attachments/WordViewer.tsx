import mammoth from "mammoth";
import { useEffect, useState } from "react";
import Loader from "../loader/Loader";

interface Props {
  url: string;
  name: string;
}

const WordViewer = ({ url, name }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buf) => mammoth.convertToHtml({ arrayBuffer: buf }))
      .then((result) => {
        if (!cancelled) setHtml(result.value || "<p>(empty document)</p>");
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load document.");
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
        <Loader text="Loading document" />
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

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-auto max-h-[520px] p-6">
        <div
          className="prose prose-sm max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100">
        {name}
      </div>
    </div>
  );
};

export default WordViewer;