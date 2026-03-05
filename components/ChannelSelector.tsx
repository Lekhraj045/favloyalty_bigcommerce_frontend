"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchChannels,
  setChannels,
  setSelectedChannel,
} from "@/store/slices/channelSlice";
import { getStoreId } from "@/utils/api";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useRef, useState } from "react";

export default function ChannelSelector() {
  const dispatch = useAppDispatch();
  const { channels, selectedChannel, loading } = useAppSelector(
    (state) => state.channel,
  );

  const hasFetchedChannelsRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize channels on mount
  useEffect(() => {
    const storeId = getStoreId();

    // When Redux has no channels, try localStorage first (from login)
    if (channels.length === 0 && !loading) {
      const storedChannels = localStorage.getItem("bc_channels");
      if (storedChannels) {
        try {
          const parsedChannels = JSON.parse(storedChannels);
          const filteredChannels = parsedChannels?.filter(
            (ch: any) =>
              ch.status === "active" && ch.platform === "bigcommerce",
          );
          if (filteredChannels && filteredChannels.length > 0) {
            dispatch(setChannels(filteredChannels));
            const storedSelected = localStorage.getItem(
              "redux_selected_channel",
            );
            if (!storedSelected && filteredChannels.length > 0) {
              dispatch(setSelectedChannel(filteredChannels[0]));
            }
            return;
          }
        } catch (e) {
          console.error("Error parsing stored channels:", e);
        }
      }
    }

    // Always fetch from API when we have storeId (at least once) so storeCurrency
    // and channel list are up to date, even when channels were restored from localStorage
    if (storeId && !hasFetchedChannelsRef.current) {
      hasFetchedChannelsRef.current = true;
      dispatch(fetchChannels(storeId));
    }
  }, [dispatch, channels.length, loading]);

  // Handle channel selection
  const handleChannelChange = (value: string) => {
    const channel = channels.find((ch) => ch.id === value);
    if (channel) {
      dispatch(setSelectedChannel(channel));
    }
  };

  // During the very first render (server + initial client), render a stable placeholder
  // to avoid hydration mismatches with the Select component.
  if (!mounted) {
    return (
      <div className="text-sm text-gray-500 px-3 py-2">
        Loading channels…
      </div>
    );
  }

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

  const effectiveSelectedKeys =
    mounted && selectedChannel?.id ? [selectedChannel.id] : [];

  return (
    <Select
      selectedKeys={effectiveSelectedKeys}
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
