"use client";

import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import { saveCollectSettings } from "@/utils/api";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useEffect, useMemo, useState } from "react";
import LoadingSkeleton from "./components/LoadingSkeleton";
import PointsOnEventsSection from "./components/PointsOnEventsSection";
import PointsOnRejoiningSection from "./components/PointsOnRejoiningSection";
import UnsavedChangesModal from "./components/UnsavedChangesModal";
import WaysToEarnSection from "./components/WaysToEarnSection";
import { useUnsavedChanges, useWaysToEarnSettings } from "./hooks";
import type { Event } from "./types";
import { createEventFromForm } from "./utils";

export default function WaysToEarn() {
  const settings = useWaysToEarnSettings();
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveAndNextLoading, setSaveAndNextLoading] = useState(false);

  // Update savedEvents when events are loaded
  useEffect(() => {
    if (
      settings.events.length > 0 &&
      savedEvents.length === 0 &&
      !settings.loading
    ) {
      setSavedEvents(JSON.parse(JSON.stringify(settings.events)));
    }
  }, [settings.events, settings.loading]);

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!settings.eventSearchQuery.trim()) {
      return settings.events;
    }
    const query = settings.eventSearchQuery.toLowerCase();
    return settings.events.filter(
      (event) =>
        event.name?.toLowerCase().includes(query) ||
        event.eventDate?.toLowerCase().includes(query) ||
        String(event.point)?.includes(query)
    );
  }, [settings.events, settings.eventSearchQuery]);

  // Handle save
  const handleSave = async (isNext: boolean = false) => {
    if (!settings.storeId || !settings.channelId) {
      addToast({
        title: "Error",
        description: "Store ID or Channel ID is missing",
        color: "danger",
      });
      return;
    }

    // Validate that no enabled toggle has 0 points
    const validationErrors: string[] = [];

    if (
      settings.signUp.enabled &&
      (parseInt(settings.signUp.points) || 0) === 0
    ) {
      validationErrors.push("Sign up");
    }
    if (
      settings.everyPurchase.enabled &&
      (parseFloat(settings.everyPurchase.points) || 0) === 0
    ) {
      validationErrors.push("Every purchase (Per INR spent)");
    }
    if (
      settings.birthday.enabled &&
      (parseInt(settings.birthday.points) || 0) === 0
    ) {
      validationErrors.push("Birthday");
    }
    if (
      settings.referEarn.enabled &&
      (parseInt(settings.referEarn.points) || 0) === 0
    ) {
      validationErrors.push("Refer & Earn");
    }
    if (
      settings.profileCompletion.enabled &&
      (parseInt(settings.profileCompletion.points) || 0) === 0
    ) {
      validationErrors.push("Profile Completion");
    }
    if (
      settings.newsletter.enabled &&
      (parseInt(settings.newsletter.points) || 0) === 0
    ) {
      validationErrors.push("Subscribing to newsletter");
    }
    if (
      settings.rejoin.enabled &&
      (parseInt(settings.rejoin.points) || 0) === 0
    ) {
      validationErrors.push("Points on Rejoining");
    }

    if (validationErrors.length > 0) {
      addToast({
        title: "Validation Error",
        description: `Please set points greater than 0 for the following enabled options: ${validationErrors.join(", ")}`,
        color: "danger",
      });
      return;
    }

    const loadingSetter = isNext ? setSaveAndNextLoading : setSaveLoading;
    loadingSetter(true);

    try {
      // Prepare basic settings
      const basic = {
        signup: {
          active: settings.signUp.enabled,
          point: parseInt(settings.signUp.points) || 0,
        },
        spent: {
          active: settings.everyPurchase.enabled,
          point: parseFloat(settings.everyPurchase.points) || 0,
        },
        birthday: {
          active: settings.birthday.enabled,
          point: parseInt(settings.birthday.points) || 0,
        },
        subucribing: {
          active: settings.newsletter.enabled,
          point: parseInt(settings.newsletter.points) || 0,
        },
        profileComplition: {
          active: settings.profileCompletion.enabled,
          point: parseInt(settings.profileCompletion.points) || 0,
        },
      };

      // Prepare refer and earn settings
      const referAndEarn = {
        active: settings.referEarn.enabled,
        point: parseInt(settings.referEarn.points) || 0,
      };

      // Prepare event settings
      const event = {
        active: settings.eventsEnabled,
        events: settings.events || [],
      };

      // Prepare rejoin settings
      const rejoin = {
        active: settings.rejoin.enabled,
        dayOfRecall: parseInt(settings.rejoin.recallDays) || 0,
        pointRejoin: parseInt(settings.rejoin.points) || 0,
      };

      const settingsData = {
        basic,
        referAndEarn,
        event,
        rejoin,
      };

      const response = await saveCollectSettings(
        settings.storeId,
        settings.channelId,
        settingsData
      );

      if (response && response.success) {
        // Update saved events state after successful save
        setSavedEvents(JSON.parse(JSON.stringify(settings.events)));
        addToast({
          title: "Success",
          description: "Settings saved successfully",
          color: "success",
        });
      } else {
        throw new Error("Save operation did not return success");
      }

      if (isNext) {
        console.log("Navigate to next page");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to save settings",
        color: "danger",
      });
    } finally {
      loadingSetter(false);
    }
  };

  // Unsaved changes hook
  const unsavedChanges = useUnsavedChanges(
    settings.events,
    savedEvents,
    handleSave,
    () => {
      // Reset events to saved state
      settings.setEvents(JSON.parse(JSON.stringify(savedEvents)));
    }
  );

  // Event handlers
  const handleAddEvent = () => {
    const newEvent = createEventFromForm(settings.eventFormData);
    if (newEvent) {
      settings.setEvents([...settings.events, newEvent]);
      settings.setEventFormData({ name: "", date: null, points: "" });
      addToast({
        title: "Success",
        description: "Event added successfully",
        color: "success",
      });
    }
  };

  const handleDeleteEvent = (eventId: string | number, index: number) => {
    const updatedEvents = settings.events.filter((_, i) => i !== index);
    settings.setEvents(updatedEvents);
    addToast({
      title: "Success",
      description: "Event deleted successfully",
      color: "success",
    });
  };

  const handleEditEvent = (event: Event, index: number) => {
    // This is called when edit mode starts, but we don't need to do anything
    // as the EventsTable handles the edit state internally
  };

  const handleSaveEvent = (index: number, updatedEvent: Event) => {
    const updatedEvents = [...settings.events];
    updatedEvents[index] = updatedEvent;
    settings.setEvents(updatedEvents);
    addToast({
      title: "Success",
      description: "Event updated successfully",
      color: "success",
    });
  };

  const handleCancelEvent = (index: number) => {
    // Cancel is handled by EventsTable internally
    // No need to do anything here
  };

  // Show skeleton loading state
  if (settings.loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation onNavigate={unsavedChanges.safeNavigate} />
        </div>

        <WaysToEarnSection
          signUp={settings.signUp}
          everyPurchase={settings.everyPurchase}
          birthday={settings.birthday}
          referEarn={settings.referEarn}
          profileCompletion={settings.profileCompletion}
          newsletter={settings.newsletter}
          onSignUpChange={(enabled, points) => {
            // Always update enabled state first
            settings.setSignUpEnabled(enabled);
            // Then update points (will be "0" if disabled)
            settings.setSignUpPoints(points);
            // Mark as unsaved
            unsavedChanges.setHasUnsavedChanges(true);
          }}
          onEveryPurchaseChange={(enabled, points) => {
            settings.setEveryPurchaseEnabled(enabled);
            settings.setEveryPurchasePoints(points);
            unsavedChanges.setHasUnsavedChanges(true);
          }}
          onBirthdayChange={(enabled, points) => {
            settings.setBirthdayEnabled(enabled);
            settings.setBirthdayPoints(points);
            unsavedChanges.setHasUnsavedChanges(true);
          }}
          onReferEarnChange={(enabled, points) => {
            settings.setReferEarnEnabled(enabled);
            settings.setReferEarnPoints(points);
            unsavedChanges.setHasUnsavedChanges(true);
          }}
          onProfileCompletionChange={(enabled, points) => {
            settings.setProfileCompletionEnabled(enabled);
            settings.setProfileCompletionPoints(points);
            unsavedChanges.setHasUnsavedChanges(true);
          }}
          onNewsletterChange={(enabled, points) => {
            settings.setNewsletterEnabled(enabled);
            settings.setNewsletterPoints(points);
            unsavedChanges.setHasUnsavedChanges(true);
          }}
        />

        <PointsOnEventsSection
          enabled={settings.eventsEnabled}
          events={settings.events}
          formData={settings.eventFormData}
          searchQuery={settings.eventSearchQuery}
          filteredEvents={filteredEvents}
          onToggleChange={settings.setEventsEnabled}
          onFormChange={(field, value) => {
            settings.setEventFormData({
              ...settings.eventFormData,
              [field]: value,
            });
          }}
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
          onSaveEvent={handleSaveEvent}
          onCancelEvent={handleCancelEvent}
          onDeleteEvent={handleDeleteEvent}
          onSearchChange={settings.setEventSearchQuery}
        />

        <PointsOnRejoiningSection
          enabled={settings.rejoin.enabled}
          recallDays={settings.rejoin.recallDays}
          points={settings.rejoin.points}
          onToggleChange={settings.setRejoinEnabled}
          onRecallDaysChange={settings.setRecallDays}
          onPointsChange={settings.setRejoinPoints}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-end mt-4">
          <Button
            color="primary"
            variant="flat"
            className="custom-btn-default"
            onClick={() => handleSave(false)}
            isLoading={saveLoading}
            disabled={saveLoading || saveAndNextLoading}
          >
            Save
          </Button>
          <Button
            className="custom-btn"
            onClick={() => handleSave(true)}
            isLoading={saveAndNextLoading}
            disabled={saveLoading || saveAndNextLoading}
          >
            Save & Next
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={unsavedChanges.showUnsavedModal}
        onSave={unsavedChanges.handleSaveUnsavedChanges}
        onDiscard={() => {
          // Reset events to saved state before discarding
          settings.setEvents(JSON.parse(JSON.stringify(savedEvents)));
          unsavedChanges.handleDiscardUnsavedChanges();
        }}
        isLoading={saveLoading}
      />
    </div>
  );
}
