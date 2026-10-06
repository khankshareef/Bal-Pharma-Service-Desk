import { useMemo } from "react";
import { FiPaperclip } from "react-icons/fi";
import type { Ticket } from "../../store/user/slice/TicketsSlice";
import { fileUrl } from "../../utils/fileUrl";
import AttachmentPreview from "./AttachmentPreview";

interface Props {
  ticket: Pick<Ticket, "attachmentUrl" | "attachmentName" | "attachmentUrls" | "attachmentNames">;
  title?: string;
  hideWhenEmpty?: boolean;
}

const AttachmentsCard = ({
  ticket,
  title = "Attachments",
  hideWhenEmpty = false,
}: Props) => {
  const attachments = useMemo(() => {
    if (ticket.attachmentUrls && ticket.attachmentUrls.trim().length > 0) {
      const urls = ticket.attachmentUrls.split(",").map((u) => u.trim()).filter(Boolean);
      const names = (ticket.attachmentNames ?? "").split(",").map((n) => n.trim());
      return urls.map((u, i) => ({ url: u, name: names[i] || `File ${i + 1}` }));
    }
    if (ticket.attachmentUrl) {
      return [{ url: ticket.attachmentUrl, name: ticket.attachmentName ?? "Attachment" }];
    }
    return [];
  }, [ticket]);

  if (hideWhenEmpty && attachments.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
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
            No files were attached to this ticket.
          </p>
        ) : (
          attachments.map((a, i) => (
            <AttachmentPreview key={i} url={fileUrl(a.url)} name={a.name} />
          ))
        )}
      </div>
    </div>
  );
};

export default AttachmentsCard;