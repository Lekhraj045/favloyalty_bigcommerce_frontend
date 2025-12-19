"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchChannels,
  setChannels,
  setSelectedChannel,
} from "@/store/slices/channelSlice";
import { getStoreId } from "@/utils/api";
import { Select, SelectItem } from "@heroui/select";
import { useEffect } from "react";

export default function ChannelSelector() {
  const dispatch = useAppDispatch();
  const { channels, selectedChannel, loading } = useAppSelector(
    (state) => state.channel
  );

  // Initialize channels on mount
  useEffect(() => {
    const storeId = getStoreId();

    // First, try to load channels from localStorage (from login)
    if (channels.length === 0 && !loading) {
      const storedChannels = localStorage.getItem("bc_channels");
      if (storedChannels) {
        try {
          const parsedChannels = JSON.parse(storedChannels);
          if (parsedChannels && parsedChannels.length > 0) {
            dispatch(setChannels(parsedChannels));
            // Select first channel if none selected
            const storedSelected = localStorage.getItem(
              "redux_selected_channel"
            );
            if (!storedSelected && parsedChannels.length > 0) {
              dispatch(setSelectedChannel(parsedChannels[0]));
            }
            return;
          }
        } catch (e) {
          console.error("Error parsing stored channels:", e);
        }
      }

      // If no channels in localStorage, fetch from API
      if (storeId) {
        dispatch(fetchChannels(storeId));
      }
    }
  }, [dispatch, channels.length, loading]);

  // Handle channel selection
  const handleChannelChange = (value: string) => {
    const channel = channels.find((ch) => ch.id === value);
    if (channel) {
      dispatch(setSelectedChannel(channel));
    }
  };

  // If no channels available, show message
  if (!loading && channels.length === 0) {
    return (
      <div className="text-sm text-gray-500 px-3 py-2">
        No channels available
      </div>
    );
  }

  // Get display name for channel
  const getChannelDisplayName = (channel: typeof selectedChannel) => {
    if (!channel) return "Select Channel";
    return channel.channel_name || `Channel ${channel.channel_id}`;
  };

  return (
    <Select
      selectedKeys={selectedChannel?.id ? [selectedChannel.id] : []}
      onSelectionChange={(keys) => {
        const selectedKey = Array.from(keys)[0] as string;
        if (selectedKey) {
          handleChannelChange(selectedKey);
        }
      }}
      placeholder="Select Channel"
      isLoading={loading}
      size="sm"
      className="w-[140px] max-w-[140px]"
      classNames={{
        trigger: "bg-white border border-gray-300",
        value: "truncate",
      }}
      aria-label="Select Channel"
    >
      {channels.map((channel) => (
        <SelectItem key={channel.id || ""} value={channel.id || ""}>
          {channel.channel_name || `Channel ${channel.channel_id}`}
        </SelectItem>
      ))}
    </Select>
  );
}
