import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../service/reusable_service/api";

export interface Ticket {
  id: number;
  ticketCode: string;
  subject: string;
  description?: string;
  priority: string;
  status: string;
  slaStatus: string;
  closedAt?: string; 

  unitName?: string;
  address?: string;

  departmentId?: number;
  departmentName?: string;

  categoryId?: number;
  categoryName?: string;

  subCategoryId?: number;
  subCategoryName?: string;

  templateId?: number;
  templateName?: string;

  createdById?: number;
  createdByName?: string;
  createdByEmployeeId?: string;

  assignedToId?: number;
  assignedToName?: string;
  assignedToEmployeeId?: string;
  assignedAt?: string;
  autoAssigned?: boolean;

  attachmentUrl?: string;
  attachmentName?: string;

  attachmentUrls?: string;
  attachmentNames?: string;

  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;

  resolutionNotes?: string;
  resolutionType?: string;

  reopenId?: number;
  reopenStatus?: string;
  reopenReason?: string;
  reopenRequestedByName?: string;
  reopenRequestedAt?: string;
  reopenReviewComments?: string;
  reopenReviewedByName?: string;
}

export interface CreateTicketPayload {
  unitName: string;
  address: string;
  departmentId: number;
  categoryId: number;
  subCategoryId?: number | null;
  templateId?: number | null;
  priority: string;
  subject: string;
  description?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentUrls?: string;
  attachmentNames?: string;
}

export interface UpdateTicketPayload {
  departmentId?: number;
  categoryId?: number;
  subCategoryId?: number | null;
  priority?: string;
  subject?: string;
  description?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface UpdateTicketStatusPayload {
  status?: string;
  slaStatus?: string;
}

export interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  onTrack: number;
  breached: number;
  atRisk: number;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  authorId?: number;
  authorName?: string;
  authorInitials?: string;
  message: string;
  createdAt?: string;
  attachmentUrl?: string | null;
}

export interface RatingPayload {
  ticketId: number;
  rating: number;         
  comment?: string;
}

interface TicketsState {
  tickets: Ticket[];         
  myTickets: Ticket[];      
  selectedTicket: Ticket | null;
  comments: TicketComment[];
  stats: TicketStats | null;
  loading: boolean;
  saving: boolean;
  uploading: boolean;
  error: any;
   allTickets: Ticket[];
  unassignedTickets: Ticket[];
  assignedTickets: Ticket[];
}

const initialState: TicketsState = {
  tickets: [],
  myTickets: [],
  selectedTicket: null,
  comments: [],
  stats: null,
  loading: false,
  saving: false,
  uploading: false,
  error: null,
  allTickets:[],
  unassignedTickets: [],
  assignedTickets: [],
};

export const fetchTickets = createAsyncThunk<Ticket[], void, { rejectValue: any }>(
  "tickets/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<Ticket[]>("/tickets");
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const fetchAllTickets = createAsyncThunk<
  Ticket[],
  void,
  { rejectValue: any }
>("tickets/fetchAllTickets", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<Ticket[]>("/tickets");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchMyTickets = createAsyncThunk<Ticket[], string, { rejectValue: any }>(
  "tickets/fetchMine",
  async (employeeId, { rejectWithValue }) => {
    try {
      const res = await api.get<Ticket[]>(
        `/tickets/employee/${encodeURIComponent(employeeId)}`
      );
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const fetchTicketById = createAsyncThunk<Ticket, number, { rejectValue: any }>(
  "tickets/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get<Ticket>(`/tickets/${id}`);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const fetchTicketStats = createAsyncThunk<TicketStats, void, { rejectValue: any }>(
  "tickets/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<TicketStats>("/tickets/stats");
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const createTicket = createAsyncThunk<
  Ticket,
  { data: CreateTicketPayload; employeeId: string },
  { rejectValue: any }
>("tickets/create", async ({ data, employeeId }, { rejectWithValue }) => {
  try {
    const res = await api.post<Ticket>(
      `/tickets?employeeId=${encodeURIComponent(employeeId)}`,
      data
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const updateTicket = createAsyncThunk<
  Ticket,
  { id: number; data: UpdateTicketPayload; employeeId: string },
  { rejectValue: any }
>("tickets/update", async ({ id, data, employeeId }, { rejectWithValue }) => {
  try {
    const res = await api.put<Ticket>(
      `/tickets/${id}?employeeId=${encodeURIComponent(employeeId)}`,
      data
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});


export const updateTicketStatus = createAsyncThunk<
  Ticket,
  { id: number; employeeId: string } & UpdateTicketStatusPayload,
  { rejectValue: any }
>(
  "tickets/updateStatus",
  async ({ id, status, slaStatus, employeeId }, { rejectWithValue }) => {
    try {
      const res = await api.patch<Ticket>(
        `/tickets/${id}/status?employeeId=${encodeURIComponent(employeeId)}`,
        { status, slaStatus }
      );
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);

export const deleteTicket = createAsyncThunk<number, number, { rejectValue: any }>(
  "tickets/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tickets/${id}`);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);


export const uploadTicketFile = createAsyncThunk<
  { url: string; name: string },
  File,
  { rejectValue: any }
>("tickets/uploadFile", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<{ url: string; name: string }>(
      "/files/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});


export const fetchComments = createAsyncThunk<
  TicketComment[],
  number,
  { rejectValue: any }
>("tickets/fetchComments", async (ticketId, { rejectWithValue }) => {
  try {
    const res = await api.get<TicketComment[]>(`/tickets/${ticketId}/comments`);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const addComment = createAsyncThunk<
  TicketComment,
  { ticketId: number; message: string; authorId?: number; attachmentUrl?: string },
  { rejectValue: any }
>(
  "tickets/addComment",
  async ({ ticketId, message, authorId, attachmentUrl }, { rejectWithValue }) => {
    try {
      const res = await api.post<TicketComment>(`/tickets/${ticketId}/comments`, {
        message,
        authorId,
        attachmentUrl,
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? e.message);
    }
  }
);


export const rateTicket = createAsyncThunk<
  { success: boolean },
  RatingPayload,
  { rejectValue: any}
>("tickets/rate", async ({ ticketId, rating, comment }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/tickets/${ticketId}/rate`, { rating, comment });
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});


export const fetchUnassignedTickets = createAsyncThunk<
  Ticket[],
  void,
  { rejectValue: any }
>("tickets/fetchUnassigned", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<Ticket[]>("/tickets/unassigned");
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const fetchAssignedToExecutive = createAsyncThunk<
  Ticket[],
  string,
  { rejectValue: any }
>("tickets/fetchAssignedToExecutive", async (employeeId, { rejectWithValue }) => {
  try {
    const res = await api.get<Ticket[]>(
      `/tickets/assigned/executive/${encodeURIComponent(employeeId)}`
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

export const assignTicket = createAsyncThunk<
  Ticket,
  { id: number; data: { executiveId?: number | null }; assignedBy: string },
  { rejectValue: any }
>("tickets/assign", async ({ id, data, assignedBy }, { rejectWithValue }) => {
  try {
    const res = await api.post<Ticket>(
      `/tickets/${id}/assign?assignedBy=${encodeURIComponent(assignedBy)}`,
      data
    );
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data ?? e.message);
  }
});

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    clearTicketsError: (state) => {
      state.error = null;
    },
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
      state.comments = [];
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchTickets.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchTickets.fulfilled, (s, a) => {
        s.loading = false;
        s.tickets = a.payload;
      })
      .addCase(fetchTickets.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchAllTickets.pending, (s) => {
  s.loading = true;
  s.error = null;
})
.addCase(fetchAllTickets.fulfilled, (s, a) => {
  s.loading = false;
  s.tickets = a.payload;       
})
.addCase(fetchAllTickets.rejected, (s, a: any) => {
  s.loading = false;
  s.error = a.payload;
})

      .addCase(fetchMyTickets.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchMyTickets.fulfilled, (s, a) => {
        s.loading = false;
        s.myTickets = a.payload;
      })
      .addCase(fetchMyTickets.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchTicketById.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchTicketById.fulfilled, (s, a) => {
        s.loading = false;
        s.selectedTicket = a.payload;
        const i = s.tickets.findIndex((t) => t.id === a.payload.id);
        if (i >= 0) s.tickets[i] = a.payload;
        else s.tickets.push(a.payload);
      })
      .addCase(fetchTicketById.rejected, (s, a: any) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchTicketStats.fulfilled, (s, a) => {
        s.stats = a.payload;
      })

      .addCase(createTicket.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(createTicket.fulfilled, (s, a) => {
        s.saving = false;
        s.tickets.unshift(a.payload);
        s.myTickets.unshift(a.payload);
      })
      .addCase(createTicket.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      })

      .addCase(updateTicket.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(updateTicket.fulfilled, (s, a) => {
        s.saving = false;
        const i = s.tickets.findIndex((t) => t.id === a.payload.id);
        if (i >= 0) s.tickets[i] = a.payload;
        const j = s.myTickets.findIndex((t) => t.id === a.payload.id);
        if (j >= 0) s.myTickets[j] = a.payload;
        if (s.selectedTicket?.id === a.payload.id) s.selectedTicket = a.payload;
      })
      .addCase(updateTicket.rejected, (s, a: any) => {
        s.saving = false;
        s.error = a.payload;
      })

      .addCase(updateTicketStatus.fulfilled, (s, a) => {
        const i = s.tickets.findIndex((t) => t.id === a.payload.id);
        if (i >= 0) s.tickets[i] = a.payload;
        const j = s.myTickets.findIndex((t) => t.id === a.payload.id);
        if (j >= 0) s.myTickets[j] = a.payload;
        if (s.selectedTicket?.id === a.payload.id) s.selectedTicket = a.payload;
      })

      .addCase(deleteTicket.fulfilled, (s, a) => {
        s.tickets = s.tickets.filter((t) => t.id !== a.payload);
        s.myTickets = s.myTickets.filter((t) => t.id !== a.payload);
        if (s.selectedTicket?.id === a.payload) s.selectedTicket = null;
      })

      .addCase(uploadTicketFile.pending, (s) => {
        s.uploading = true;
        s.error = null;
      })
      .addCase(uploadTicketFile.fulfilled, (s) => {
        s.uploading = false;
      })
      .addCase(uploadTicketFile.rejected, (s, a: any) => {
        s.uploading = false;
        s.error = a.payload;
      })

      .addCase(fetchComments.fulfilled, (s, a) => {
        s.comments = a.payload;
      })
      .addCase(addComment.fulfilled, (s, a) => {
        s.comments.push(a.payload);
      })

      .addCase(rateTicket.rejected, (s, a: any) => {
        s.error = a.payload;
      })

.addCase(fetchUnassignedTickets.fulfilled, (s, a) => {
  s.unassignedTickets = a.payload;
})
.addCase(fetchAssignedToExecutive.fulfilled, (s, a) => {
  s.assignedTickets = a.payload;
})
.addCase(assignTicket.fulfilled, (s, a) => {
  s.unassignedTickets = s.unassignedTickets.filter((t) => t.id !== a.payload.id);
  s.assignedTickets.unshift(a.payload);
  const i = s.tickets.findIndex((t) => t.id === a.payload.id);
  if (i >= 0) s.tickets[i] = a.payload;
});
  },
});

export const { clearTicketsError, clearSelectedTicket } = ticketsSlice.actions;
export default ticketsSlice.reducer;