import { configureStore } from "@reduxjs/toolkit";
import channelReducer from "./slices/channelSlice";

export const store = configureStore({
  reducer: {
    channel: channelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ["channel/setSelectedChannel", "channel/setChannels"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
