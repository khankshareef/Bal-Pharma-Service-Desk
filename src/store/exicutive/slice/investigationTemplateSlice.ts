import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface InvestigationTemplate {
  id: number;
  title: string;
  icon: string;
  color: string;
  type: "INVESTIGATION" | "RESPONSE";
  content: string;
  displayOrder: number;
}

interface State {
  investigation: InvestigationTemplate[];
  response: InvestigationTemplate[];
  loading: boolean;
  error: any;
}

const initialState: State = {
  investigation: [],
  response: [],
  loading: false,
  error: null,
};

export const fetchInvestigationTemplates = createAsyncThunk<
  InvestigationTemplate[],
  void,
  { rejectValue: any }
>("investigationTemplates/investigation", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<InvestigationTemplate[]>(
      "/investigation-templates/type/INVESTIGATION"
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchResponseTemplates = createAsyncThunk<
  InvestigationTemplate[],
  void,
  { rejectValue: any }
>("investigationTemplates/response", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<InvestigationTemplate[]>(
      "/investigation-templates/type/RESPONSE"
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const investigationTemplateSlice = createSlice({
  name: "investigationTemplates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestigationTemplates.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchInvestigationTemplates.fulfilled, (s, a) => { s.loading = false; s.investigation = a.payload; })
      .addCase(fetchInvestigationTemplates.rejected, (s, a: any) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchResponseTemplates.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchResponseTemplates.fulfilled, (s, a) => { s.loading = false; s.response = a.payload; })
      .addCase(fetchResponseTemplates.rejected, (s, a: any) => { s.loading = false; s.error = a.payload; });
  },
});

export default investigationTemplateSlice.reducer;