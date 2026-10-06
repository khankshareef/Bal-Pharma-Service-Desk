import { useEffect } from "react";
import { FiClipboard, FiMessageSquare } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchInvestigationTemplates,
    fetchResponseTemplates,
} from "../../store/exicutive/slice/investigationTemplateSlice";
import type { AppDispatch, RootState } from "../../store/store/Store";
import TemplateChip from "./TemplateChip";

interface Props {
  onPickInvestigation?: (content: string) => void;
  onPickResponse?: (content: string) => void;
}

const TemplatesSection = ({ onPickInvestigation, onPickResponse }: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const inv = useSelector((s: RootState) => s.investigationTemplates.investigation);
  const res = useSelector((s: RootState) => s.investigationTemplates.response);

  useEffect(() => {
    dispatch(fetchInvestigationTemplates());
    dispatch(fetchResponseTemplates());
  }, [dispatch]);

  return (
    <>
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2 mb-3">
          <FiClipboard className="text-black" /> Investigation Templates
        </h3>
        <div className="flex flex-wrap gap-2">
          {inv.length === 0 ? (
            <p className="text-sm text-gray-500">No templates available.</p>
          ) : (
            inv.map((t) => (
              <TemplateChip
                key={t.id}
                icon={t.icon}
                color={t.color}
                label={t.title}
                onClick={() => onPickInvestigation?.(t.content)}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-bold text-gray-800 mr-1 flex items-center gap-2">
          <FiMessageSquare size={14} /> Response Templates:
        </span>
        {res.map((t) => (
          <TemplateChip
            key={t.id}
            icon={t.icon}
            color={t.color}
            label={t.title}
            onClick={() => onPickResponse?.(t.content)}
          />
        ))}
      </div>
    </>
  );
};

export default TemplatesSection;