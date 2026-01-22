"use client";

import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import UpgradeModal from "@/components/UpgradeModal";
import { useAppDispatch } from "@/store/hooks";
import { updateChannelCompletionStatus } from "@/store/slices/channelSlice";
import {
    getStorePlan,
    saveCollectSettings,
    StorePlan,
    updatePageCompletionStatus,
    updateSetupProgress,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import LoadingSkeleton from "./components/LoadingSkeleton";
import PointsOnEventsSection from "./components/PointsOnEventsSection";
import PointsOnRejoiningSection from "./components/PointsOnRejoiningSection";
import UnsavedChangesModal from "./components/UnsavedChangesModal";
import WaysToEarnSection from "./components/WaysToEarnSection";
import { useUnsavedChanges, useWaysToEarnSettings } from "./hooks";
import type { Event } from "./types";
import { createEventFromForm } from "./utils";

export default function WaysToEarn() {
  const router = useRouter();
  const settings = useWaysToEarnSettings();
  const dispatch = useAppDispatch();
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveAndNextLoading, setSaveAndNextLoading] = useState(false);
  
  // Plan and upgrade modal state
  const [storePlan, setStorePlan] = useState<StorePlan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [restrictedFeatureName, setRestrictedFeatureName] = useState<string>("");
  const hasDisabledFeaturesRef = useRef<boolean>(false);

  // Helper function to check if user is on free plan
  const isFreePlan = () => {
    return storePlan?.plan === "free";
  };

  // Helper function to show upgrade modal
  const showUpgradeModalForFeature = (featureName: string) => {
    setRestrictedFeatureName(featureName);
    setShowUpgradeModal(true);
  };

  // Load store plan information
  useEffect(() => {
    const loadStorePlan = async () => {
      try {
        const plan = await getStorePlan();
        setStorePlan(plan);
      } catch (error) {
        console.error("Error loading store plan:", error);
        // Default to free plan if error
        setStorePlan({ plan: "free", trialDaysRemaining: null, paypalSubscriptionId: null });
      }
    };
    loadStorePlan();
  }, []);

  // Disable restricted features for free plan users when settings are loaded
  useEffect(() => {
    if (
      storePlan &&
      storePlan.plan === "free" &&
      !settings.loading &&
      !hasDisabledFeaturesRef.current
    ) {
      // Disable Birthday if enabled
      if (settings.birthday.enabled) {
        settings.setBirthdayEnabled(false);
      }
      // Disable Refer & Earn if enabled
      if (settings.referEarn.enabled) {
        settings.setReferEarnEnabled(false);
      }
      // Disable Profile Completion if enabled
      if (settings.profileCompletion.enabled) {
        settings.setProfileCompletionEnabled(false);
      }
      // Disable Newsletter if enabled
      if (settings.newsletter.enabled) {
        settings.setNewsletterEnabled(false);
      }
      // Disable Events if enabled
      if (settings.eventsEnabled) {
        settings.setEventsEnabled(false);
      }
      // Disable Rejoin if enabled
      if (settings.rejoin.enabled) {
        settings.setRejoinEnabled(false);
      }
      hasDisabledFeaturesRef.current = true;
    }
  }, [storePlan, settings.loading]);

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
        // Check if events were processed for today
        const eventsWereProcessed = response.eventProcessing && response.eventProcessing.processed;
        
        if (eventsWereProcessed) {
          console.log("✅ Events were processed for today:", response.eventProcessing);
        }
        
        // Always use events from backend response if available (they have latest statuses)
        // This ensures that if events were processed, their status is updated to "completed"
        if (response.data && response.data.event && response.data.event.events) {
          const updatedEvents = response.data.event.events.map((event: any) => ({
            ...event,
            status: event.status || "scheduled",
            isImmediate: event.isImmediate || false,
            type: event.type || "default",
            processingInfo: event.processingInfo || {
              startedAt: null,
              completedAt: null,
              jobID: null,
              processedCount: 0,
              failedCount: 0,
              totalCustomers: 0,
              error: null,
            },
          }));
          
          // Update events state with backend data (includes updated statuses like "completed")
          settings.setEvents(updatedEvents);
          console.log("✅ Updated events with statuses from backend:", updatedEvents);
          
          // Update saved events state with the updated events
          setSavedEvents(JSON.parse(JSON.stringify(updatedEvents)));
        } else {
          // If no events in response, use current events
          setSavedEvents(JSON.parse(JSON.stringify(settings.events)));
        }

        // Update setup progress to 2 (only increases, never decreases)
        try {
          await updateSetupProgress(settings.channelId, 2);
        } catch (error) {
          console.error("Error updating setup progress:", error);
          // Don't fail the save if progress update fails
        }

        // Check if page is completed: at least one of the 6 ways to earn is enabled
        const isPageCompleted =
          settings.signUp.enabled ||
          settings.everyPurchase.enabled ||
          settings.birthday.enabled ||
          settings.referEarn.enabled ||
          settings.profileCompletion.enabled ||
          settings.newsletter.enabled;

        // Update page completion status
        try {
          await updatePageCompletionStatus(
            settings.channelId,
            "waysToEarn",
            isPageCompleted
          );
          // Update Redux store to reflect the new completion status
          dispatch(
            updateChannelCompletionStatus({
              channelId: settings.channelId,
              pageType: "waysToEarn",
              completed: isPageCompleted,
            })
          );
        } catch (error) {
          console.error("Error updating page completion status:", error);
          // Don't fail the save if completion status update fails
        }

        addToast({
          title: "Success",
          description: "Settings saved successfully",
          color: "success",
        });
      } else {
        throw new Error("Save operation did not return success");
      }

      if (isNext) {
        // Navigate to next step: Ways to Redeem (using router to preserve Redux state)
        router.push("/setup/ways-to-redeem");
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
      // Check for duplicate event (same name and date)
      const eventDate = new Date(newEvent.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      
      const isDuplicate = settings.events.some((existingEvent) => {
        const existingDate = new Date(existingEvent.eventDate);
        existingDate.setHours(0, 0, 0, 0);
        
        return (
          existingEvent.name.toLowerCase() === newEvent.name.toLowerCase() &&
          existingDate.getTime() === eventDate.getTime()
        );
      });

      if (isDuplicate) {
        addToast({
          title: "Validation Error",
          description: `An event with the name "${newEvent.name}" already exists for this date. Please choose a different name or date.`,
          color: "danger",
        });
        return;
      }

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
          isFreePlan={isFreePlan()}
          onPremiumClick={showUpgradeModalForFeature}
        />

        <PointsOnEventsSection
          enabled={settings.eventsEnabled}
          events={settings.events}
          formData={settings.eventFormData}
          searchQuery={settings.eventSearchQuery}
          filteredEvents={filteredEvents}
          onToggleChange={(enabled) => {
            settings.setEventsEnabled(enabled);
            unsavedChanges.setHasUnsavedChanges(true);
          }}
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
          isFreePlan={isFreePlan()}
          onPremiumClick={showUpgradeModalForFeature}
        />

        <PointsOnRejoiningSection
          enabled={settings.rejoin.enabled}
          recallDays={settings.rejoin.recallDays}
          points={settings.rejoin.points}
          onToggleChange={(enabled) => {
            settings.setRejoinEnabled(enabled);
            unsavedChanges.setHasUnsavedChanges(true);
          }}
          onRecallDaysChange={settings.setRecallDays}
          onPointsChange={settings.setRejoinPoints}
          isFreePlan={isFreePlan()}
          onPremiumClick={showUpgradeModalForFeature}
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={restrictedFeatureName}
      />
    </div>
  );
}
