import React, { useEffect, useMemo, useState } from "react";
import {
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoToggleOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import Reusable_Button from "../../../component/button/Reusable_Button";
import Reusable_Field from "../../../component/fields/Reusable_Field";

import {
  createTemplate,
  deleteTemplate,
  fetchTemplates,
  toggleTemplateStatus,
  updateTemplate,
  type Template,
  type TemplatePayload,
} from "../../../store/super_admin/slice/templatesSlice";

import {
  clearCategories,
  fetchCategoriesByDepartment,
} from "../../../store/super_admin/slice/CategorySlice";
import { fetchDepartments } from "../../../store/super_admin/slice/DepartmentSlice";

import Loader from "../../../component/loader/Loader";
import type { AppDispatch, RootState } from "../../../store/store/Store";

const priorityOptions = [
  { label: "High",   value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low",    value: "LOW" },
];

interface FormState {
  templateName: string;
  departmentId: string | number;
  categoryId: string | number;
  subCategoryId: string | number;
  priority: string;
}

const emptyForm: FormState = {
  templateName: "",
  departmentId: "",
  categoryId: "",
  subCategoryId: "",
  priority: "LOW",
};

const Template_Management = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { templates, loading, saving } = useSelector(
    (s: RootState) => s.templates
  );
  const { departments, loading: depLoading } = useSelector(
    (s: RootState) => s.departments
  );
  const { categories, loading: catLoading } = useSelector(
    (s: RootState) => s.categories
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTemplates());
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (!formData.departmentId) {
      dispatch(clearCategories());
      return;
    }

    const depId = Number(formData.departmentId);
    if (Number.isNaN(depId)) return;

    dispatch(fetchCategoriesByDepartment(depId));
  }, [dispatch, formData.departmentId]);

  const departmentOptions = useMemo(
    () => [
      { label: "Select Department", value: "" },
      ...departments.map((d: any) => ({
        label: d.name,
        value: String(d.id),
      })),
    ],
    [departments]
  );

  const categoryOptions = useMemo(() => {
    const list = categories.filter((c: any) => {
      if (!formData.departmentId) return false;
      if (c.departmentId === undefined || c.departmentId === null) return true;
      return String(c.departmentId) === String(formData.departmentId);
    });

    return [
      { label: "Select Category", value: "" },
      ...list.map((c: any) => ({
        label: c.name,
        value: String(c.id),
      })),
    ];
  }, [categories, formData.departmentId]);

  const subCategoryOptions = useMemo(() => {
    if (!formData.categoryId) {
      return [{ label: "Select Sub Category", value: "" }];
    }

    const selected = categories.find(
      (c: any) => String(c.id) === String(formData.categoryId)
    );

    const subs: any[] = selected?.subCategories ?? [];

    return [
      { label: "Select Sub Category", value: "" },
      ...subs.map((s: any) =>
        typeof s === "string"
          ? { label: s, value: s }
          : { label: s.name, value: String(s.id) }
      ),
    ];
  }, [categories, formData.categoryId]);

  const handleOpenModal = (template?: Template) => {
    setError(null);

    if (template) {
      setEditingTemplate(template);
      setFormData({
        templateName: template.templateName,
        departmentId: template.departmentId ?? "",
        categoryId: template.categoryId ?? "",
        subCategoryId: template.subCategoryId ?? "",
        priority: template.priority,
      });
    } else {
      setEditingTemplate(null);
      setFormData(emptyForm);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setError(null);
    dispatch(clearCategories());
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "departmentId"
        ? { categoryId: "", subCategoryId: "" }
        : {}),
      ...(name === "categoryId" ? { subCategoryId: "" } : {}),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.templateName.trim()) return setError("Template name is required.");
    if (!formData.departmentId)        return setError("Department is required.");
    if (!formData.categoryId)          return setError("Category is required.");
    if (!formData.priority)            return setError("Priority is required.");

    const payload: TemplatePayload = {
      templateName: formData.templateName.trim(),
      departmentId: Number(formData.departmentId),
      categoryId: Number(formData.categoryId),
      subCategoryId: formData.subCategoryId
        ? Number(formData.subCategoryId)
        : null,
      priority: String(formData.priority).toUpperCase(),
    };

    try {
      setError(null);

      if (editingTemplate?.id) {
        await dispatch(
          updateTemplate({ id: editingTemplate.id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createTemplate(payload)).unwrap();
      }

      handleCloseModal();
    } catch (err: any) {
      setError(
        err?.error ||
          err?.message ||
          `Failed to ${editingTemplate ? "update" : "create"} template.`
      );
    }
  };

  const handleToggleStatus = async (id?: number) => {
    if (!id) return;
    try {
      await dispatch(toggleTemplateStatus(id)).unwrap();
    } catch (err: any) {
      alert(err?.error || err?.message || "Failed to toggle template.");
    }
  };

  const handleDelete = async (id?: number, name?: string) => {
    if (!id) return;
    if (!confirm(`Delete template "${name}"?`)) return;

    try {
      await dispatch(deleteTemplate(id)).unwrap();
    } catch (err: any) {
      alert(err?.error || err?.message || "Failed to delete template.");
    }
  };

  if (loading && templates.length === 0) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center">
      <Loader />
    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="mx-auto max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Template Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Create and manage quick-select ticket templates for employees.
            </p>
          </div>

          <Reusable_Button
            variant="primary"
            leftIcon={<IoAddOutline size={20} />}
            onClick={() => handleOpenModal()}
          >
            Create Template
          </Reusable_Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Template Name</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && templates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Loading templates…
                    </td>
                  </tr>
                ) : templates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No templates found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr
                      key={template.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {template.templateName}
                      </td>
                      <td className="px-6 py-4">
                        {template.departmentName ?? `#${template.departmentId}`}
                      </td>
                      <td className="px-6 py-4">
                        {template.categoryName ?? `#${template.categoryId}`}
                        {template.subCategoryName && (
                          <span className="text-slate-400 text-xs block">
                            {template.subCategoryName}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            template.priority === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : template.priority === "MEDIUM"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {template.priority?.charAt(0) +
                            template.priority?.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {template.active !== false ? (
                          <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold bg-green-50 px-2.5 py-1 rounded-full w-fit">
                            <IoCheckmarkCircleOutline size={16} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-full w-fit">
                            <IoCloseCircleOutline size={16} /> Closed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenModal(template)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Template"
                          >
                            <IoCreateOutline size={20} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(template.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              template.active !== false
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={
                              template.active !== false ? "Deactivate" : "Activate"
                            }
                          >
                            <IoToggleOutline
                              size={20}
                              className={template.active !== false ? "" : "rotate-180"}
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(template.id, template.templateName)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Template"
                          >
                            <IoTrashOutline size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 mt-16">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editingTemplate ? "Edit Template" : "Create Ticket Template"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-3">
              <Reusable_Field
                label="Template Display Name *"
                type="text"
                name="templateName"
                value={formData.templateName}
                onChange={handleChange}
                placeholder="e.g. Printer Issue"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-2">
                <Reusable_Field
                  label="Department *"
                  type="select"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                  disabled={depLoading && departments.length === 0}
                  options={departmentOptions}
                />

                <Reusable_Field
                  label="Category *"
                  type="select"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  disabled={
                    !formData.departmentId ||
                    (catLoading && categoryOptions.length <= 1)
                  }
                  options={categoryOptions}
                />

                <Reusable_Field
                  label="Sub Category"
                  type="select"
                  name="subCategoryId"
                  value={formData.subCategoryId}
                  onChange={handleChange}
                  disabled={!formData.categoryId}
                  options={subCategoryOptions}
                />

                {/* Priority */}
                <Reusable_Field
                  label="Priority *"
                  type="select"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  options={priorityOptions}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <Reusable_Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </Reusable_Button>
                <Reusable_Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editingTemplate
                    ? "Update Template"
                    : "Save Template"}
                </Reusable_Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Template_Management;