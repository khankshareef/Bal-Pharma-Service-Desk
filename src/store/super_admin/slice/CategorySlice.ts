import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface SubCategory {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  categoryCode: string;
  departmentId?: number;
  departmentName?: string;
  name: string;
  scope?: string;
  active: boolean;
  subCategories: (SubCategory | string)[];
  ticketCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryPayload {
  name: string;
  departmentId: number;
  scope?: string;
  active?: boolean;
  subCategories?: string[];
}

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  totalSubCategories: number;
}

interface CategoriesState {
  categories: Category[];
  stats: CategoryStats | null;
  loading: boolean;
  saving: boolean;
  error: any;
  loadedDepartmentId: number | null;
}

const initialState: CategoriesState = {
  categories: [],
  stats: null,
  loading: false,
  saving: false,
  error: null,
  loadedDepartmentId: null,
};


export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: any }
>("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<Category[]>("/categories");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchCategoriesByDepartment = createAsyncThunk<
  Category[],
  number,
  { rejectValue: any }
>(
  "categories/fetchByDepartment",
  async (departmentId, { rejectWithValue }) => {
    try {
      const res = await api.get<Category[]>(
        `/categories/by-department/${departmentId}`
      );
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const fetchCategoryStats = createAsyncThunk<
  CategoryStats,
  void,
  { rejectValue: any }
>("categories/stats", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<CategoryStats>("/categories/stats");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const createCategory = createAsyncThunk<
  Category,
  CategoryPayload,
  { rejectValue: any }
>("categories/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<Category>("/categories", payload);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  { id: number; data: Partial<CategoryPayload> },
  { rejectValue: any }
>("categories/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put<Category>(`/categories/${id}`, data);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const deleteCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: any }
>("categories/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/categories/${id}`);
    return id;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});


const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoriesError: (s) => {
      s.error = null;
    },
    clearCategories: (s) => {
      s.categories = [];
      s.loadedDepartmentId = null;
      s.loading = false;
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchCategories.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCategories.fulfilled, (s, a) => {
        s.loading = false;
        s.categories = a.payload;
        s.loadedDepartmentId = null; 
      })
      .addCase(fetchCategories.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchCategoriesByDepartment.pending, (s, a) => {
        s.loading = true;
        s.error = null;
        s.categories = [];
        s.loadedDepartmentId = a.meta.arg;
      })
      .addCase(fetchCategoriesByDepartment.fulfilled, (s, a) => {
        const requestedDept = a.meta.arg;
        if (
          s.loadedDepartmentId !== null &&
          s.loadedDepartmentId !== requestedDept
        ) {
          return;
        }
        s.loading = false;
        s.categories = a.payload;
        s.loadedDepartmentId = requestedDept;
      })
      .addCase(fetchCategoriesByDepartment.rejected, (s, a: any) => {
        if (
          s.loadedDepartmentId !== null &&
          s.loadedDepartmentId !== a.meta.arg
        ) {
          return;
        }
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchCategoryStats.fulfilled, (s, a) => {
        s.stats = a.payload;
      })

      .addCase(createCategory.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(createCategory.fulfilled, (s, a) => {
        s.saving = false;
        if (
          s.loadedDepartmentId === null ||
          a.payload.departmentId === s.loadedDepartmentId
        ) {
          s.categories.push(a.payload);
        }
      })
      .addCase(createCategory.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      })

      .addCase(updateCategory.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(updateCategory.fulfilled, (s, a) => {
        s.saving = false;
        const i = s.categories.findIndex((c) => c.id === a.payload.id);

        const belongsToCurrent =
          s.loadedDepartmentId === null ||
          a.payload.departmentId === s.loadedDepartmentId;

        if (i >= 0 && !belongsToCurrent) {
          s.categories.splice(i, 1);
        } else if (i >= 0) {
          s.categories[i] = a.payload;
        } else if (belongsToCurrent) {
          s.categories.push(a.payload);
        }
      })
      .addCase(updateCategory.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      })

      .addCase(deleteCategory.fulfilled, (s, a) => {
        s.categories = s.categories.filter((c) => c.id !== a.payload);
      });
  },
});

export const { clearCategoriesError, clearCategories } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;