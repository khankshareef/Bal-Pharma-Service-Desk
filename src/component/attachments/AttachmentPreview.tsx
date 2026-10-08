import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiDownload,
  FiExternalLink,
  FiFile,
  FiMaximize2,
  FiPaperclip,
  FiX,
} from "react-icons/fi";

import { fileExtension } from "../../utils/fileExtension";
import CsvViewer from "./CsvViewer";
import ExcelViewer from "./ExcelViewer";
import WordViewer from "./WordViewer";

const IMAGE_EXT   = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
const VIDEO_EXT   = ["mp4", "webm", "mov", "avi", "mkv"];
const AUDIO_EXT   = ["mp3", "wav", "ogg", "m4a", "aac"];
const PDF_EXT     = ["pdf"];
const TEXT_EXT    = ["txt", "log", "md", "json", "xml", "html", "htm"];
const CSV_EXT     = ["csv"];
const XLSX_EXT    = ["xlsx", "xls"];
const WORD_EXT    = ["docx"];
const PPTX_EXT    = ["pptx"];
const OFFICE_LEGACY_EXT = ["doc", "ppt"];

const isPublicUrl = (u: string) =>
  !u.includes("localhost") && !u.includes("127.0.0.1");

const officeEmbedUrl = (publicUrl: string) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`;

const openAttachment = (url: string, ext: string) => {
  const office = ["docx", "doc", "pptx", "ppt", "xlsx", "xls"];
  if (office.includes(ext) && isPublicUrl(url)) {
    window.open(
      `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
};

interface Props {
  url: string;
  name: string;
}

const AttachmentPreview = ({ url, name }: Props) => {
  const ext = (fileExtension(url) || fileExtension(name) || "").toLowerCase();

  const isImage  = IMAGE_EXT.includes(ext);
  const isVideo  = VIDEO_EXT.includes(ext);
  const isAudio  = AUDIO_EXT.includes(ext);
  const isPdf    = PDF_EXT.includes(ext);
  const isText   = TEXT_EXT.includes(ext);
  const isCsv    = CSV_EXT.includes(ext);
  const isXlsx   = XLSX_EXT.includes(ext);
  const isWord   = WORD_EXT.includes(ext);
  const isPptx   = PPTX_EXT.includes(ext);
  const isLegacy = OFFICE_LEGACY_EXT.includes(ext);

  const [expanded, setExpanded] = useState(false);

  const pptxOk   = isPptx && isPublicUrl(url);
  const legacyOk = isLegacy && isPublicUrl(url);

  const canPreview =
    isImage || isVideo || isAudio || isPdf || isText || isCsv ||
    isXlsx || isWord || pptxOk || legacyOk;

  const renderInline = () => {
    if (isImage) {
      return (
        <img
          src={url}
          alt={name}
          onClick={() => setExpanded(true)}
          className="max-h-72 rounded-lg border border-gray-200 object-contain bg-white cursor-zoom-in"
        />
      );
    }

    if (isVideo) {
      return (
        <video controls src={url} className="max-h-72 rounded-lg border border-gray-200 bg-black">
          Your browser does not support video playback.
        </video>
      );
    }

    if (isAudio) {
      return (
        <audio controls src={url} className="w-full">
          Your browser does not support audio playback.
        </audio>
      );
    }

    if (isPdf || isText) {
      return (
        <div
          onClick={() => setExpanded(true)}
          className="w-full h-80 rounded-lg border border-gray-200 bg-white overflow-hidden cursor-zoom-in"
        >
          <iframe
            src={url}
            title={name}
            className="w-full h-full pointer-events-none"
          />
        </div>
      );
    }

    if (isCsv) {
      return (
        <div onClick={() => setExpanded(true)} className="cursor-zoom-in">
          <CsvViewer url={url} name={name} />
        </div>
      );
    }

    if (isXlsx) {
      return (
        <div onClick={() => setExpanded(true)} className="cursor-zoom-in">
          <ExcelViewer url={url} name={name} />
        </div>
      );
    }

    if (isWord) {
      return (
        <div onClick={() => setExpanded(true)} className="cursor-zoom-in">
          <WordViewer url={url} name={name} />
        </div>
      );
    }

    if (pptxOk || legacyOk) {
      return (
        <div
          onClick={() => setExpanded(true)}
          className="w-full h-80 rounded-lg border border-gray-200 bg-white overflow-hidden cursor-zoom-in"
        >
          <iframe
            src={officeEmbedUrl(url)}
            title={name}
            className="w-full h-full pointer-events-none"
            frameBorder={0}
          />
        </div>
      );
    }

    if ((isPptx || isLegacy) && !isPublicUrl(url)) {
      return (
        <div className="text-sm text-gray-600 italic bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <FiFile size={14} className="inline mr-1" />
          PowerPoint preview needs a public URL. On <b>localhost</b> use
          <b> Download</b> and open it locally.
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 italic">
        <FiFile size={14} />
        Preview not available — use Download to view the file.
      </div>
    );
  };

  return (
    <>
      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800 truncate">
            <FiPaperclip size={14} className="text-blue-600 shrink-0" />
            <span className="truncate">{name}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-3">
            {canPreview && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-xs text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
              >
                <FiMaximize2 size={12} /> Full view
              </button>
            )}

            <button
              type="button"
              onClick={() => openAttachment(url, ext)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <FiExternalLink size={12} /> Open
            </button>

          </div>
        </div>

        {renderInline()}
      </div>

      {expanded && canPreview && (
        <FullViewer
          url={url}
          name={name}
          ext={ext}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
};

const FullViewer = ({
  url,
  name,
  ext,
  onClose,
}: {
  url: string;
  name: string;
  ext: string;
  onClose: () => void;
}) => {
  const isImage  = IMAGE_EXT.includes(ext);
  const isVideo  = VIDEO_EXT.includes(ext);
  const isAudio  = AUDIO_EXT.includes(ext);
  const isPdf    = PDF_EXT.includes(ext);
  const isText   = TEXT_EXT.includes(ext);
  const isCsv    = CSV_EXT.includes(ext);
  const isXlsx   = XLSX_EXT.includes(ext);
  const isWord   = WORD_EXT.includes(ext);
  const isPptx   = PPTX_EXT.includes(ext);
  const isLegacy = OFFICE_LEGACY_EXT.includes(ext);

  const pptxOk   = (isPptx || isLegacy) && isPublicUrl(url);
  const embedUrl = pptxOk ? officeEmbedUrl(url) : url;

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800 truncate">
            <FiPaperclip size={14} className="text-blue-600" />
            <span className="truncate">{name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openAttachment(url, ext)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <FiExternalLink size={12} /> Open in new tab
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
          {isImage && (
            <img src={url} alt={name} className="max-w-full max-h-full object-contain" />
          )}

          {isVideo && (
            <video controls autoPlay src={url} className="max-w-full max-h-full bg-black">
              Your browser does not support video playback.
            </video>
          )}

          {isAudio && (
            <div className="p-8 w-full max-w-lg">
              <audio controls autoPlay src={url} className="w-full">
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {(isPdf || isText || pptxOk) && (
            <iframe
              src={embedUrl}
              title={name}
              className="w-full h-full border-0 bg-white"
              frameBorder={0}
            />
          )}

          {isCsv && <div className="w-full h-full overflow-auto p-4"><CsvViewer url={url} name={name} /></div>}
          {isXlsx && <div className="w-full h-full overflow-auto p-4"><ExcelViewer url={url} name={name} /></div>}
          {isWord && <div className="w-full h-full overflow-auto p-4"><WordViewer url={url} name={name} /></div>}

          {!isImage && !isVideo && !isAudio && !isPdf && !isText &&
           !isCsv && !isXlsx && !isWord && !pptxOk && (
            <div className="text-center text-gray-500 p-8">
              <FiFile size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Preview not available in the browser.</p>
              <a
                href={url}
                download
                className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <FiDownload size={14} /> Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AttachmentPreview;