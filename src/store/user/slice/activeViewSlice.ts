import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ActiveViewState {
  activeTicketId: number | null;
  muteChatSoundInView: boolean;
}

const initialState: ActiveViewState = {
  activeTicketId: null,
  muteChatSoundInView: false,
};

const slice = createSlice({
  name: "activeView",
  initialState,
  reducers: {
    setActiveTicketId(state, action: PayloadAction<number | null>) {
      state.activeTicketId = action.payload;
    },
    clearActiveTicketId(state) {
      state.activeTicketId = null;
    },
  },
});

export const { setActiveTicketId, clearActiveTicketId } = slice.actions;
export default slice.reducer;