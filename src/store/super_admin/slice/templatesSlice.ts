import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface Template {
  id?: number;
  templateName: string;
  departmentId: number;
  categoryId: number;
  subCategoryId?: number | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  active?: boolean;

  departmentName?: string;
  categoryName?: string;
  subCategoryName?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface TemplatePayload {
  templateName: string;
  departmentId: number;
  categoryId: number;
  subCategoryId?: number | null;
  priority: string;
  active?: boolean;
}

interface TemplatesState {
  templates: Template[];
  loading: boolean;
  saving: boolean;
  error: any;
}

const initialState: TemplatesState = {
  templates: [],
  loading: false,
  saving: false,
  error: null,
};


export const fetchTemplates = createAsyncThunk<Template[], void, { rejectValue: any }>(
  "templates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<Template[]>("/templates");
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const createTemplate = createAsyncThunk<Template, TemplatePayload, { rejectValue: any }>(
  "templates/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post<Template>("/templates", payload);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const updateTemplate = createAsyncThunk<
  Template,
  { id: number; data: Partial<TemplatePayload> },
  { rejectValue: any }
>("templates/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put<Template>(`/templates/${id}`, data);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const toggleTemplateStatus = createAsyncThunk<Template, number, { rejectValue: any }>(
  "templates/toggle",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch<Template>(`/templates/${id}/toggle`);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const deleteTemplate = createAsyncThunk<number, number, { rejectValue: any }>(
  "templates/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/templates/${id}`);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    clearTemplatesError: (s) => {
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchTemplates.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (s, a) => {
        s.loading = false;
        s.templates = a.payload;
      })
      .addCase(fetchTemplates.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(createTemplate.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(createTemplate.fulfilled, (s, a) => {
        s.saving = false;
        s.templates.push(a.payload);
      })
      .addCase(createTemplate.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      })

      .addCase(updateTemplate.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(updateTemplate.fulfilled, (s, a) => {
        s.saving = false;
        const i = s.templates.findIndex((t) => t.id === a.payload.id);
        if (i >= 0) s.templates[i] = a.payload;
      })
      .addCase(updateTemplate.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      })

      .addCase(toggleTemplateStatus.fulfilled, (s, a) => {
        const i = s.templates.findIndex((t) => t.id === a.payload.id);
        if (i >= 0) s.templates[i] = a.payload;
      })

      .addCase(deleteTemplate.fulfilled, (s, a) => {
        s.templates = s.templates.filter((t) => t.id !== a.payload);
      });
  },
});

export const { clearTemplatesError } = templatesSlice.actions;
export default templatesSlice.reducer;