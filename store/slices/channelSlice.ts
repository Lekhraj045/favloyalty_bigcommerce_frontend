import { Channel, getChannels } from "@/utils/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChannelState {
  selectedChannel: Channel | null;
  channels: Channel[];
  loading: boolean;
  error: string | null;
}

const initialState: ChannelState = {
  selectedChannel: null,
  channels: [],
  loading: false,
  error: null,
};

// Load selected channel from localStorage on initialization
const loadSelectedChannelFromStorage = (): Channel | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("redux_selected_channel");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

// Initialize with persisted channel if available
const persistedChannel = loadSelectedChannelFromStorage();

if (persistedChannel) {
  initialState.selectedChannel = persistedChannel;
}

// Async thunk to fetch channels from API
export const fetchChannels = createAsyncThunk(
  "channel/fetchChannels",
  async (storeId: string, { rejectWithValue }) => {
    try {
      const channels = await getChannels(storeId);
      return channels;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch channels");
    }
  }
);

const channelSlice = createSlice({
  name: "channel",
  initialState,
  reducers: {
    setSelectedChannel: (state, action: PayloadAction<Channel | null>) => {
      state.selectedChannel = action.payload;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem(
            "redux_selected_channel",
            JSON.stringify(action.payload)
          );
        } else {
          localStorage.removeItem("redux_selected_channel");
        }
      }
    },
    setChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
      // Auto-select first channel if none selected and channels available
      if (!state.selectedChannel && action.payload.length > 0) {
        state.selectedChannel = action.payload[0];
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "redux_selected_channel",
            JSON.stringify(action.payload[0])
          );
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = action.payload;
        // Auto-select first channel if none selected
        if (!state.selectedChannel && action.payload.length > 0) {
          state.selectedChannel = action.payload[0];
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "redux_selected_channel",
              JSON.stringify(action.payload[0])
            );
          }
        }
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedChannel,
  setChannels,
  setLoading,
  setError,
  clearError,
} = channelSlice.actions;

export default channelSlice.reducer;
