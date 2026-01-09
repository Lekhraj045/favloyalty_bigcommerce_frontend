"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Announcement {
  _id?: string;
  enable: boolean;
  image: string | null;
  link: string | null;
}

export interface WidgetCustomizationState {
  // Brand colors
  widgetBgColor: string;
  headingColor: string;
  widgetIconColor: string | null;
  
  // Widget Icon
  selectedLauncher: string; // "icon-only" | "label-only" | "icon-label"
  selectedWidgetIcon: string; // widget icon ID
  label: string; // Label text when launcher is label-only or icon-label
  
  // Background Pattern
  selectedPattern: string | null; // "none" | "pattern1" | "pattern2" | "pattern3" | "pattern4"
  
  // Widget Button Position
  widgetButton: string; // "Top-Left" | "Top-Right" | "Bottom-Left" | "Bottom-Right"
  
  // Announcements
  announcements: Announcement[];
  
  // Display Options
  displayOption: Array<{
    label: string;
    enable: boolean;
  }>;
}

interface WidgetCustomizationContextType {
  state: WidgetCustomizationState;
  updateState: (updates: Partial<WidgetCustomizationState>) => void;
  resetState: () => void;
  loadData: (data: any) => void; // Load data from backend
  // Announcement management functions
  addAnnouncement: (announcement: Omit<Announcement, "_id">) => void;
  updateAnnouncement: (index: number, announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (index: number) => void;
  toggleAnnouncement: (index: number) => void;
}

const defaultState: WidgetCustomizationState = {
  widgetBgColor: "#62a63f",
  headingColor: "#ffffff",
  widgetIconColor: null,
  selectedLauncher: "icon-only",
  selectedWidgetIcon: "widget-icon1",
  label: "Reward",
  selectedPattern: "none",
  widgetButton: "bottom-right",
  announcements: [],
  displayOption: [],
};

const WidgetCustomizationContext = createContext<WidgetCustomizationContextType | undefined>(undefined);

// Map backend format to frontend format (pure functions, moved outside component)
const mapLauncherTypeFromBackend = (launcherType: string): string => {
  switch (launcherType) {
    case "IconOnly":
      return "icon-only";
    case "LabelOnly":
      return "label-only";
    case "Icon&Label":
      return "icon-label";
    default:
      return "icon-only";
  }
};

// Map widget button from backend format to frontend format
const mapWidgetButtonFromBackend = (widgetButton: string): string => {
  const mapping: Record<string, string> = {
    "Bottom-Left": "bottom-left",
    "Bottom-Right": "bottom-right",
    "Top-Left": "top-left",
    "Top-Right": "top-right",
  };
  return mapping[widgetButton] || "bottom-right";
};

export function WidgetCustomizationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WidgetCustomizationState>(defaultState);

  const updateState = (updates: Partial<WidgetCustomizationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(defaultState);
  };

  // Generate a temporary ID for new announcements
  const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addAnnouncement = (announcement: Omit<Announcement, "_id">) => {
    setState((prev) => ({
      ...prev,
      announcements: [
        ...prev.announcements,
        {
          ...announcement,
          _id: generateTempId(),
        },
      ],
    }));
  };

  const updateAnnouncement = (index: number, announcement: Partial<Announcement>) => {
    setState((prev) => {
      const updated = [...prev.announcements];
      updated[index] = { ...updated[index], ...announcement };
      return { ...prev, announcements: updated };
    });
  };

  const deleteAnnouncement = (index: number) => {
    setState((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((_, i) => i !== index),
    }));
  };

  const toggleAnnouncement = (index: number) => {
    setState((prev) => {
      const updated = [...prev.announcements];
      updated[index] = { ...updated[index], enable: !updated[index].enable };
      return { ...prev, announcements: updated };
    });
  };

  const loadData = useCallback((backendData: any) => {
    if (!backendData) {
      return; // Keep default state if no data
    }

    setState({
      widgetBgColor: backendData.widgetBgColor || defaultState.widgetBgColor,
      headingColor: backendData.headingColor || defaultState.headingColor,
      widgetIconColor: backendData.widgetIconColor || null,
      selectedLauncher: mapLauncherTypeFromBackend(backendData.LauncherType || "IconOnly"),
      selectedWidgetIcon: backendData.widgetIconUrlId || defaultState.selectedWidgetIcon,
      label: backendData.Label || defaultState.label,
      selectedPattern: backendData.backgroundPatternEnabled && backendData.backgroundPatternUrlId
        ? backendData.backgroundPatternUrlId
        : "none",
      widgetButton: mapWidgetButtonFromBackend(backendData.widgetButton || "Bottom-Right"),
      announcements: (backendData.announcements || []).map((ann: any) => ({
        _id: ann._id?.toString() || undefined,
        enable: ann.enable ?? true,
        image: ann.image || null,
        link: ann.link || null,
      })),
      displayOption: backendData.displayOption || defaultState.displayOption,
    });
  }, []);

  return (
    <WidgetCustomizationContext.Provider
      value={{
        state,
        updateState,
        resetState,
        loadData,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        toggleAnnouncement,
      }}
    >
      {children}
    </WidgetCustomizationContext.Provider>
  );
}

export function useWidgetCustomization() {
  const context = useContext(WidgetCustomizationContext);
  if (context === undefined) {
    throw new Error("useWidgetCustomization must be used within a WidgetCustomizationProvider");
  }
  return context;
}

