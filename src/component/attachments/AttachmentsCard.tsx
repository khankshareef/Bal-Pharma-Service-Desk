import { useMemo } from "react";
import { FiPaperclip } from "react-icons/fi";
import type { Ticket } from "../../store/user/slice/TicketsSlice";
import { fileUrl } from "../../utils/fileUrl";
import AttachmentPreview from "./AttachmentPreview";

interface Props {
  ticket: Ticket;
  title?: string;
}

const AttachmentsCard = ({ ticket, title = "Attachments" }: Props) => {
  const attachments: { url: string; name: string }[] = useMemo(() => {
    if (!ticket) return [];

    if (ticket.attachmentUrls && ticket.attachmentUrls.trim().length > 0) {
      const urls = ticket.attachmentUrls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
      const names = (ticket.attachmentNames ?? "")
        .split(",")
        .map((n) => n.trim());
      return urls.map((u, i) => ({
        url: fileUrl(u),
        name: names[i] || `File ${i + 1}`,
      }));
    }

    if (ticket.attachmentUrl) {
      return [
        {
          url: fileUrl(ticket.attachmentUrl),
          name: ticket.attachmentName ?? "Attachment",
        },
      ];
    }

    return [];
  }, [ticket]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
          <FiPaperclip className="text-blue-600" />
          {title}
          {attachments.length > 0 && (
            <span className="text-xs font-normal text-gray-400">
              ({attachments.length})
            </span>
          )}
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {attachments.length === 0 ? (
          <p className="text-sm text-gray-500">
            No files attached to this ticket.
          </p>
        ) : (
          attachments.map((a, i) => (
            <AttachmentPreview key={i} url={a.url} name={a.name} />
          ))
        )}
      </div>
    </div>
  );
};

export default AttachmentsCard;