import { FiFile, FiPaperclip } from "react-icons/fi";

interface Props {
  url: string;
  name: string;
}

const AttachmentPreview = ({ url, name }: Props) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext);
  const isVideo = ["mp4", "webm", "mov", "avi", "mkv"].includes(ext);
  const isAudio = ["mp3", "wav", "ogg", "m4a", "aac"].includes(ext);
  const isPdf = ext === "pdf";

  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800 truncate">
          <FiPaperclip size={14} className="text-blue-600 shrink-0" />
          <span className="truncate">{name}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          download
          className="text-xs text-blue-600 hover:underline shrink-0 ml-3"
        >
          Download
        </a>
      </div>

      {isImage && (
        <img
          src={url}
          alt={name}
          className="max-h-72 rounded-lg border border-gray-200 object-contain bg-white"
        />
      )}

      {isVideo && (
        <video controls src={url} className="max-h-72 rounded-lg border border-gray-200 bg-black">
          Your browser does not support video playback.
        </video>
      )}

      {isAudio && (
        <audio controls src={url} className="w-full">
          Your browser does not support audio playback.
        </audio>
      )}

      {isPdf && (
        <iframe
          src={url}
          title={name}
          className="w-full h-72 rounded-lg border border-gray-200 bg-white"
        />
      )}

      {!isImage && !isVideo && !isAudio && !isPdf && (
        <div className="flex items-center gap-2 text-sm text-gray-600 italic">
          <FiFile size={14} />
          Preview not available — use Download to view the file.
        </div>
      )}
    </div>
  );
};

export default AttachmentPreview;