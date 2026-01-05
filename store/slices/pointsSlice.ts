import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Tier } from "@/utils/api";

interface PointsState {
  tierStatus: boolean;
  tiers: Tier[];
  channelId: string | null;
}

// Load from localStorage on initialization
const loadPointsFromStorage = (): Partial<PointsState> => {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem("redux_points_data");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading points from localStorage:", error);
  }
  
  return {};
};

const initialState: PointsState = {
  tierStatus: false,
  tiers: [],
  channelId: null,
  ...loadPointsFromStorage(),
};

const pointsSlice = createSlice({
  name: "points",
  initialState,
  reducers: {
    setTierStatus: (state, action: PayloadAction<boolean>) => {
      state.tierStatus = action.payload;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        const dataToStore = {
          tierStatus: state.tierStatus,
          tiers: state.tiers,
          channelId: state.channelId,
        };
        localStorage.setItem("redux_points_data", JSON.stringify(dataToStore));
      }
    },
    setTiers: (state, action: PayloadAction<Tier[]>) => {
      state.tiers = action.payload;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        const dataToStore = {
          tierStatus: state.tierStatus,
          tiers: state.tiers,
          channelId: state.channelId,
        };
        localStorage.setItem("redux_points_data", JSON.stringify(dataToStore));
      }
    },
    setPointsData: (
      state,
      action: PayloadAction<{ tierStatus: boolean; tiers: Tier[]; channelId: string | null }>
    ) => {
      state.tierStatus = action.payload.tierStatus;
      state.tiers = action.payload.tiers;
      state.channelId = action.payload.channelId;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        const dataToStore = {
          tierStatus: state.tierStatus,
          tiers: state.tiers,
          channelId: state.channelId,
        };
        localStorage.setItem("redux_points_data", JSON.stringify(dataToStore));
      }
    },
    clearPointsData: (state) => {
      state.tierStatus = false;
      state.tiers = [];
      state.channelId = null;
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("redux_points_data");
      }
    },
  },
});

export const { setTierStatus, setTiers, setPointsData, clearPointsData } =
  pointsSlice.actions;

export default pointsSlice.reducer;

