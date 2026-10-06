import { useEffect, useMemo, useRef, useState } from "react";
import { FiPaperclip, FiUploadCloud } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Reusable_Button from "../../../component/button/Reusable_Button";
import Reusable_Field from "../../../component/fields/Reusable_Field";
import Loader from "../../../component/loader/Loader";
import ReusablePopup from "../../../component/popups/Reusable_Popup";

import type { AppDispatch, RootState } from "../../../store/store/Store";
import { fetchUnits } from "../../../store/super_admin/slice/Add_User";
import { fetchCategories } from "../../../store/super_admin/slice/CategorySlice";
import { fetchDepartments } from "../../../store/super_admin/slice/DepartmentSlice";
import { fetchTemplates } from "../../../store/super_admin/slice/templatesSlice";
import {
  createTicket,
  fetchTicketById,
  updateTicket,
  uploadTicketFile,
  type CreateTicketPayload,
} from "../../../store/user/slice/TicketsSlice";

const priorityOptions = [
  { label: "High",   value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low",    value: "LOW" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface UnitLike {
  unitName?: string;
  address?: string;
}

const fullUnitName = (u?: UnitLike): string => {
  if (!u || !u.unitName) return "";
  return u.address ? `${u.unitName} - ${u.address}` : u.unitName;
};

interface FormState {
  unitName: string;        
  departmentId: string;
  categoryId: string;
  subCategoryId: string;
  templateId: string;
  priority: string;
  subject: string;
  description: string;

  files: File[];            
  attachmentUrl?: string;   
  attachmentName?: string;
  attachmentUrls?: string;  
  attachmentNames?: string; 
}

const emptyForm: FormState = {
  unitName: "",
  departmentId: "",
  categoryId: "",
  subCategoryId: "",
  templateId: "",
  priority: "HIGH",
  subject: "",
  description: "",
  files: [],
};

const Create_Ticket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [popup, setPopup] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useSelector((s: any) => s.auth?.user ?? s.loginRoute?.user);
  const employeeId = user?.employeeId ?? "";

  const { departments } = useSelector((s: RootState) => s.departments);
  const { categories }  = useSelector((s: RootState) => s.categories);
  const { templates }   = useSelector((s: RootState) => s.templates);
  const { saving, tickets } = useSelector((s: RootState) => s.tickets);

  const apiUnits = useSelector((s: RootState) => s.addUser.units);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const role: string = (user?.role ?? "").toUpperCase();
  const isWideAccess =
    role === "SUPER_MANAGER" || role === "ADMIN" || role === "DEPUTY_MANAGER";

 const userLocations: UnitLike[] = Array.isArray(user?.assignedUnits)
  ? user.assignedUnits
  : Array.isArray(user?.allowedLocations)
  ? user.allowedLocations
  : [];

  
  const assignedUnits: UnitLike[] =
    userLocations.length > 0 ? userLocations : (apiUnits as UnitLike[]) ?? [];

  const showAllUnitsFallback =
    isWideAccess && userLocations.length === 0 && apiUnits.length === 0;

  const existingAttachments: { url: string; name: string }[] = useMemo(() => {
    if (!form.attachmentUrls) return [];
    const urls  = form.attachmentUrls.split(",").map((s) => s.trim()).filter(Boolean);
    const names = (form.attachmentNames ?? "").split(",").map((s) => s.trim());
    return urls.map((u, i) => ({ url: u, name: names[i] || `File ${i + 1}` }));
  }, [form.attachmentUrls, form.attachmentNames]);

  useEffect(() => {
    if (userLocations.length === 0) {
      dispatch(fetchUnits());
    }
  }, [dispatch, userLocations.length]);

  useEffect(() => {
    if (!isEditMode && !form.unitName && assignedUnits.length > 0) {
      setForm((prev) => ({
        ...prev,
        unitName: fullUnitName(assignedUnits[0]),
      }));
    }
  }, [assignedUnits, isEditMode, form.unitName]);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchCategories());
    dispatch(fetchTemplates());
  }, [dispatch]);

  useEffect(() => {
    if (!isEditMode || !id) {
      setForm(emptyForm);
      return;
    }

    setLoading(true);

    const cached = tickets.find((t) => t.id === Number(id));
    const load = cached
      ? Promise.resolve(cached)
      : dispatch(fetchTicketById(Number(id))).unwrap();

    load
      .then((t: any) => {
        setForm({
          unitName: t.unitName ?? fullUnitName(assignedUnits[0]) ?? "",
          departmentId: String(t.departmentId ?? ""),
          categoryId: String(t.categoryId ?? ""),
          subCategoryId: t.subCategoryId ? String(t.subCategoryId) : "",
          templateId: t.templateId ? String(t.templateId) : "",
          priority: t.priority,
          subject: t.subject ?? "",
          description: t.description ?? "",
          files: [],
          attachmentUrl: t.attachmentUrl ?? undefined,
          attachmentName: t.attachmentName ?? undefined,
          attachmentUrls: t.attachmentUrls ?? undefined,
          attachmentNames: t.attachmentNames ?? undefined,
        });
      })
      .catch((err) => alert(err?.error || "Failed to load ticket"))
      .finally(() => setLoading(false));
  }, [dispatch, id, isEditMode, tickets, assignedUnits]);

  const departmentOptions = [
    { label: "Select Department", value: "" },
    ...departments.map((d: any) => ({ label: d.name, value: String(d.id) })),
  ];

  const categoryOptions = useMemo(() => {
  const list = categories.filter((c: any) => {
    if (!form.departmentId) return false;
    if (c.departmentId === undefined || c.departmentId === null) return true;
    return String(c.departmentId) === String(form.departmentId);
  });

  return [
    { label: "Select Category", value: "" },
    ...list.map((c: any) => ({ label: c.name, value: String(c.id) })),
  ];
}, [categories, form.departmentId]);

  const subCategoryOptions = (() => {
    if (!form.categoryId) return [{ label: "Select Sub Category", value: "" }];
    const selected = categories.find((c: any) => String(c.id) === form.categoryId);
    const subs = selected?.subCategories ?? [];
    return [
      { label: "Select Sub Category", value: "" },
      ...subs.map((s: any, i: number) =>
        typeof s === "string"
          ? { label: s, value: String(i + 1) }
          : { label: s.name, value: String(s.id) }
      ),
    ];
  })();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "departmentId" ? { categoryId: "", subCategoryId: "" } : {}),
      ...(name === "categoryId" ? { subCategoryId: "" } : {}),
    }));
  };

  const handleTemplateClick = (template: any) => {
    setForm((prev) => ({
      ...prev,
      templateId: String(template.id),
      departmentId: String(template.departmentId ?? ""),
      categoryId: String(template.categoryId ?? ""),
      subCategoryId: template.subCategoryId ? String(template.subCategoryId) : "",
      priority: template.priority ?? prev.priority,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;

    const tooBig = picked.find((f) => f.size > MAX_FILE_SIZE);
    if (tooBig) {
      setError(`File "${tooBig.name}" exceeds 5MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError(null);
    setForm((prev) => ({
      ...prev,
      files: [...prev.files, ...picked],
    }));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePickedFile = (index: number) => {
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handlePopupConfirm = () => {
    setPopup((prev) => ({ ...prev, isOpen: false }));
    if (popup.type === "success") {
      navigate("../my-tickets");
    }
  };

  const handleSubmit = async () => {
    if (!form.subject.trim()) return setError("Subject is required.");
    if (!form.departmentId)   return setError("Department is required.");
    if (!form.categoryId)     return setError("Category is required.");
    if (!form.priority)       return setError("Priority is required.");

    if (assignedUnits.length === 0) {
      return setError(
        "No units are available. Please contact your administrator."
      );
    }

    const effectiveUnitName =
      form.unitName || fullUnitName(assignedUnits[0]);

    let selectedUnit =
      assignedUnits.find((u) => fullUnitName(u) === effectiveUnitName) ??
      assignedUnits.find((u) => u.unitName === effectiveUnitName) ??
      assignedUnits.find((u) => u.unitName === form.unitName);

    if (!selectedUnit) {
      selectedUnit = assignedUnits[0];
    }

    const address  = selectedUnit?.address ?? "";
    const unitName = fullUnitName(selectedUnit);

    let attachmentUrl  = form.attachmentUrl;
    let attachmentName = form.attachmentName;
    let attachmentUrls  = form.attachmentUrls;
    let attachmentNames = form.attachmentNames;

    try {
      setError(null);
      setLoading(true);

      if (form.files.length > 0) {
        const uploaded: { url: string; name: string }[] = [];

        for (const f of form.files) {
          const r = await dispatch(uploadTicketFile(f)).unwrap();
          uploaded.push({ url: r.url, name: r.name });
        }

        const newUrls  = uploaded.map((u) => u.url).join(",");
        const newNames = uploaded.map((u) => u.name).join(",");

        attachmentUrls  = attachmentUrls ? `${attachmentUrls},${newUrls}`   : newUrls;
        attachmentNames = attachmentNames ? `${attachmentNames},${newNames}` : newNames;

        if (!attachmentUrl) {
          attachmentUrl  = uploaded[0]?.url;
          attachmentName = uploaded[0]?.name;
        }
      }

      const payload: CreateTicketPayload = {
        unitName,
        address,
        departmentId: Number(form.departmentId),
        categoryId: Number(form.categoryId),
        subCategoryId: form.subCategoryId ? Number(form.subCategoryId) : null,
        templateId: form.templateId ? Number(form.templateId) : null,
        priority: form.priority,
        subject: form.subject.trim(),
        description: form.description,

        attachmentUrl,
        attachmentName,
        attachmentUrls,
        attachmentNames,
      };

      if (isEditMode && id) {
        const updatedTicket = await dispatch(
          updateTicket({ id: Number(id), data: payload, employeeId })
        ).unwrap();

        setPopup({
          isOpen: true,
          type: "success",
          title: "Ticket Updated",
          message: `Ticket ${updatedTicket.ticketCode ?? ""} updated successfully.`,
        });
      } else {
        const createdTicket = await dispatch(
          createTicket({ data: payload, employeeId })
        ).unwrap();

        setPopup({
          isOpen: true,
          type: "success",
          title: "Ticket Created",
          message: `Ticket ${createdTicket.ticketCode ?? ""} created successfully.`,
        });
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      setPopup({
        isOpen: true,
        type: "error",
        title: isEditMode ? "Update Failed" : "Creation Failed",
        message:
          err?.response?.data?.error ||
          err?.error ||
          err?.message ||
          `Failed to ${isEditMode ? "update" : "create"} ticket.`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <Loader />;

  return (
    <div className="max-w-full mx-auto space-y-6">
      {loading && <Loader />}

      <div className="flex items-center gap-4 bg-[#f4f7f9] border border-[#e2e8f0] rounded-xl p-4">
        <label className="font-semibold text-gray-800 shrink-0">
          Your Unit:
        </label>

        <div className="w-[320px]">
          <div className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800">
            {assignedUnits.length > 0
              ? assignedUnits.map((u) => fullUnitName(u)).join(", ")
              : showAllUnitsFallback
              ? "All Units"
              : "Loading units…"}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Ticket Templates</h2>
        <div className="flex flex-wrap gap-3">
          {templates.length === 0 ? (
            <p className="text-sm text-gray-500">No templates available.</p>
          ) : (
            templates.map((t: any) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTemplateClick(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm border transition ${
                  form.templateId === String(t.id)
                    ? "bg-[#003D8C] text-white border-[#003D8C]"
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                📌 {t.templateName}
              </button>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Ticket Details</h2>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reusable_Field
              label="Department *"
              type="select"
              name="departmentId"
              options={departmentOptions}
              value={form.departmentId}
              onChange={handleChange}
            />
            <Reusable_Field
              label="Category *"
              type="select"
              name="categoryId"
              options={categoryOptions}
              value={form.categoryId}
              onChange={handleChange}
              disabled={!form.departmentId}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reusable_Field
              label="Sub Category"
              type="select"
              name="subCategoryId"
              options={subCategoryOptions}
              value={form.subCategoryId}
              onChange={handleChange}
              disabled={!form.categoryId}
            />
            <Reusable_Field
              label="Priority *"
              type="select"
              name="priority"
              options={priorityOptions}
              value={form.priority}
              onChange={handleChange}
            />
          </div>

          <Reusable_Field
            label="Subject *"
            type="text"
            name="subject"
            placeholder="Printer not working"
            value={form.subject}
            onChange={handleChange}
          />

          <Reusable_Field
            label="Description"
            type="textarea"
            name="description"
            placeholder="Describe your issue..."
            value={form.description}
            onChange={handleChange}
          />

          {/* Upload zone */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              multiple
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.mp4,.webm,.mov,.avi,.mkv,.mp3,.wav,.ogg,.m4a,.aac,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
            />
            <div className="bg-[#1e3a5f] p-3 rounded-full mb-3 shadow-md">
              <FiUploadCloud size={24} className="text-white" />
            </div>
            <p className="text-lg font-medium text-gray-800">
              {form.files.length > 0
                ? `${form.files.length} file${form.files.length > 1 ? "s" : ""} selected`
                : existingAttachments.length > 0
                ? `${existingAttachments.length} existing attachment${existingAttachments.length > 1 ? "s" : ""}`
                : "Drop files here or click to upload"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Images, video, audio, PDF, docs — up to 5MB each
            </p>
          </div>

          {/* Existing attachments */}
          {existingAttachments.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Already attached
              </p>
              <ul className="space-y-2">
                {existingAttachments.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between border border-gray-100 bg-gray-50 rounded-xl px-4 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 text-gray-800 truncate">
                      <FiPaperclip size={14} className="text-blue-600 shrink-0" />
                      <span className="truncate">{a.name}</span>
                    </span>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Open
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {form.files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {form.files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-gray-800 truncate">
                    <FiPaperclip size={14} className="text-blue-600 shrink-0" />
                    <span className="truncate">{f.name}</span>
                    <span className="text-gray-500 text-xs">
                      ({(f.size / 1024).toFixed(0)} KB)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePickedFile(i);
                    }}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mt-3">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 justify-end mt-6">
          <Reusable_Button
            variant="secondary"
            onClick={() => window.history.back()}
            disabled={saving || loading}
          >
            Cancel
          </Reusable_Button>
          <Reusable_Button
            variant="primary"
            onClick={handleSubmit}
            disabled={saving || loading}
          >
            {saving ? "Saving…" : isEditMode ? "Update Ticket" : "Create Ticket"}
          </Reusable_Button>
        </div>
      </div>

      <ReusablePopup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handlePopupConfirm}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.type === "success" ? "View My Tickets" : "OK"}
      />
    </div>
  );
};

export default Create_Ticket;