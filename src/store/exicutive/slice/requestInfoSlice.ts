import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export type RequestStatus = "PENDING" | "RESPONDED" | "CLOSED";

export interface TicketInfoRequest {
  id: number;
  ticketId: number;
  ticketCode?: string;
  requestedById: number;
  requestedByName?: string;
  respondedById?: number;
  respondedByName?: string;
  message: string;
  attachments?: string;
  attachmentNames?: string;
  status: RequestStatus;
  response?: string;
  createdAt: string;
  respondedAt?: string;
  updatedAt?: string;
}

interface State {
  list: TicketInfoRequest[];
  loading: boolean;
  error: any;
}

const initialState: State = { list: [], loading: false, error: null };

export const createTicketInfoRequest = createAsyncThunk<
  TicketInfoRequest,
  { ticketId: number; message: string; attachments?: string; attachmentNames?: string; requestedBy: string },
  { rejectValue: any }
>("requestInfo/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<TicketInfoRequest>(
      `/ticket-requests?requestedBy=${encodeURIComponent(payload.requestedBy)}`,
      {
        ticketId: payload.ticketId,
        message: payload.message,
        attachments: payload.attachments,
        attachmentNames: payload.attachmentNames,
      }
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchRequestsByTicket = createAsyncThunk<
  TicketInfoRequest[],
  number,
  { rejectValue: any }
>("requestInfo/fetchByTicket", async (ticketId, { rejectWithValue }) => {
  try {
    const res = await api.get<TicketInfoRequest[]>(`/ticket-requests/ticket/${ticketId}`);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchRequestsByRequester = createAsyncThunk<
  TicketInfoRequest[],
  string,
  { rejectValue: any }
>("requestInfo/fetchByRequester", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<TicketInfoRequest[]>(
      `/ticket-requests/requester/${encodeURIComponent(employeeId)}`
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const respondToRequest = createAsyncThunk<
  TicketInfoRequest,
  { id: number; response: string; attachments?: string; attachmentNames?: string; respondedBy: string },
  { rejectValue: any }
>("requestInfo/respond", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post<TicketInfoRequest>(
      `/ticket-requests/${payload.id}/respond?respondedBy=${encodeURIComponent(payload.respondedBy)}`,
      {
        response: payload.response,
        attachments: payload.attachments,
        attachmentNames: payload.attachmentNames,
      }
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const closeRequest = createAsyncThunk<
  TicketInfoRequest,
  { id: number; employeeId: string },
  { rejectValue: any }
>("requestInfo/close", async ({ id, employeeId }, { rejectWithValue }) => {
  try {
    const res = await api.post<TicketInfoRequest>(
      `/ticket-requests/${id}/close?employeeId=${encodeURIComponent(employeeId)}`
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const requestInfoSlice = createSlice({
  name: "requestInfo",
  initialState,
  reducers: {
    clearRequests: (s) => {
      s.list = [];
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTicketInfoRequest.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createTicketInfoRequest.fulfilled, (s, a) => {
        s.loading = false;
        if (!s.list.some((r) => r.id === a.payload.id)) {
          s.list.unshift(a.payload);    
        }
      })
      .addCase(createTicketInfoRequest.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchRequestsByTicket.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchRequestsByTicket.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchRequestsByTicket.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchRequestsByRequester.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchRequestsByRequester.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchRequestsByRequester.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(respondToRequest.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(respondToRequest.fulfilled, (s, a) => {
        s.loading = false;
        s.list = s.list.map((r) => (r.id === a.payload.id ? a.payload : r));
      })
      .addCase(respondToRequest.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(closeRequest.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(closeRequest.fulfilled, (s, a) => {
        s.loading = false;
        s.list = s.list.map((r) => (r.id === a.payload.id ? a.payload : r));
      })
      .addCase(closeRequest.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const { clearRequests } = requestInfoSlice.actions;
export default requestInfoSlice.reducer;