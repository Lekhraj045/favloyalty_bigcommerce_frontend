import { useAppSelector } from "@/store/hooks";
import { getCollectSettings, getStoreId } from "@/utils/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Event, EventFormData } from "./types";

/**
 * Hook for managing ways to earn settings
 */
export function useWaysToEarnSettings() {
  const selectedChannel = useAppSelector(
    (state) => state.channel.selectedChannel
  );
  const storeId = getStoreId();
  const channelId = selectedChannel?.id || null;

  // State for toggle switches
  const [signUpEnabled, setSignUpEnabled] = useState(false);
  const [everyPurchaseEnabled, setEveryPurchaseEnabled] = useState(false);
  const [birthdayEnabled, setBirthdayEnabled] = useState(false);
  const [referEarnEnabled, setReferEarnEnabled] = useState(false);
  const [profileCompletionEnabled, setProfileCompletionEnabled] =
    useState(false);
  const [newsletterEnabled, setNewsletterEnabled] = useState(false);

  // State for input values (default to "0")
  const [signUpPoints, setSignUpPoints] = useState("0");
  const [everyPurchasePoints, setEveryPurchasePoints] = useState("0");
  const [birthdayPoints, setBirthdayPoints] = useState("0");
  const [referEarnPoints, setReferEarnPoints] = useState("0");
  const [profileCompletionPoints, setProfileCompletionPoints] = useState("0");
  const [newsletterPoints, setNewsletterPoints] = useState("0");

  // State for Events
  const [eventsEnabled, setEventsEnabled] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  // State for Add Event form
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    name: "",
    date: null,
    points: "",
  });

  // State for event search
  const [eventSearchQuery, setEventSearchQuery] = useState("");

  // State for Rejoin
  const [rejoinEnabled, setRejoinEnabled] = useState(false);
  const [recallDays, setRecallDays] = useState("0");
  const [rejoinPoints, setRejoinPoints] = useState("0");

  // Loading state
  const [loading, setLoading] = useState(false);

  // Reset form to default values
  const resetToDefaults = () => {
    setSignUpEnabled(false);
    setEveryPurchaseEnabled(false);
    setBirthdayEnabled(false);
    setReferEarnEnabled(false);
    setProfileCompletionEnabled(false);
    setNewsletterEnabled(false);
    setSignUpPoints("0");
    setEveryPurchasePoints("0");
    setBirthdayPoints("0");
    setReferEarnPoints("0");
    setProfileCompletionPoints("0");
    setNewsletterPoints("0");
    setEventsEnabled(false);
    setEvents([]);
    setRejoinEnabled(false);
    setRecallDays("0");
    setRejoinPoints("0");
    setEventFormData({ name: "", date: null, points: "" });
  };

  // Load collect settings when page loads or channel changes
  useEffect(() => {
    const loadCollectSettings = async () => {
      if (!storeId || !channelId) {
        resetToDefaults();
        return;
      }

      setLoading(true);
      try {
        const data = await getCollectSettings(storeId, channelId);

        if (data) {
          // Load basic settings
          if (data.basic) {
            if (data.basic.signup) {
              setSignUpEnabled(data.basic.signup.active || false);
              setSignUpPoints(String(data.basic.signup.point || 0));
            }
            if (data.basic.spent) {
              setEveryPurchaseEnabled(data.basic.spent.active || false);
              setEveryPurchasePoints(String(data.basic.spent.point || 0));
            }
            if (data.basic.birthday) {
              setBirthdayEnabled(data.basic.birthday.active || false);
              setBirthdayPoints(String(data.basic.birthday.point || 0));
            }
            if (data.basic.subucribing) {
              setNewsletterEnabled(data.basic.subucribing.active || false);
              setNewsletterPoints(String(data.basic.subucribing.point || 0));
            }
            if (data.basic.profileComplition) {
              setProfileCompletionEnabled(
                data.basic.profileComplition.active || false
              );
              setProfileCompletionPoints(
                String(data.basic.profileComplition.point || 0)
              );
            }
          }

          // Load refer and earn settings
          if (data.referAndEarn) {
            setReferEarnEnabled(data.referAndEarn.active || false);
            setReferEarnPoints(String(data.referAndEarn.point || 0));
          }

          // Load event settings
          if (data.event) {
            setEventsEnabled(data.event.active || false);
            if (data.event.events && Array.isArray(data.event.events)) {
              // Ensure events have all required fields
              const eventsWithDefaults = data.event.events.map(
                (event: any) => ({
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
                })
              );
              setEvents(eventsWithDefaults);
            } else {
              setEvents([]);
            }
          } else {
            setEvents([]);
          }

          // Reset event form after loading
          setEventFormData({ name: "", date: null, points: "" });

          // Load rejoin settings
          if (data.rejoin) {
            setRejoinEnabled(data.rejoin.active || false);
            setRecallDays(String(data.rejoin.dayOfRecall || 0));
            setRejoinPoints(String(data.rejoin.pointRejoin || 0));
          }
        } else {
          resetToDefaults();
        }
      } catch (error: any) {
        console.error("Error loading collect settings:", error);
        resetToDefaults();
      } finally {
        setLoading(false);
      }
    };

    loadCollectSettings();
  }, [storeId, channelId, selectedChannel?.id]);

  return {
    // Store and channel info
    storeId,
    channelId,

    // Basic settings
    signUp: { enabled: signUpEnabled, points: signUpPoints },
    everyPurchase: {
      enabled: everyPurchaseEnabled,
      points: everyPurchasePoints,
    },
    birthday: { enabled: birthdayEnabled, points: birthdayPoints },
    referEarn: { enabled: referEarnEnabled, points: referEarnPoints },
    profileCompletion: {
      enabled: profileCompletionEnabled,
      points: profileCompletionPoints,
    },
    newsletter: { enabled: newsletterEnabled, points: newsletterPoints },

    // Events
    eventsEnabled,
    events,
    eventFormData,
    eventSearchQuery,

    // Rejoin
    rejoin: { enabled: rejoinEnabled, recallDays, points: rejoinPoints },

    // Loading
    loading,

    // Setters
    setSignUpEnabled,
    setSignUpPoints,
    setEveryPurchaseEnabled,
    setEveryPurchasePoints,
    setBirthdayEnabled,
    setBirthdayPoints,
    setReferEarnEnabled,
    setReferEarnPoints,
    setProfileCompletionEnabled,
    setProfileCompletionPoints,
    setNewsletterEnabled,
    setNewsletterPoints,
    setEventsEnabled,
    setEvents,
    setEventFormData,
    setEventSearchQuery,
    setRejoinEnabled,
    setRecallDays,
    setRejoinPoints,
  };
}

/**
 * Hook for managing unsaved changes tracking and navigation guard
 */
export function useUnsavedChanges(
  events: Event[],
  savedEvents: Event[],
  onSave: () => Promise<void>,
  onDiscard?: () => void
) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const isNavigatingRef = useRef(false);

  // Check if events have changed
  useEffect(() => {
    const eventsChanged =
      JSON.stringify(events) !== JSON.stringify(savedEvents);
    setHasUnsavedChanges(eventsChanged);
  }, [events, savedEvents]);

  // Handle page refresh/unload and browser navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        // Prevent navigation and show modal
        window.history.pushState(null, "", window.location.href);
        setPendingNavigation(pathname);
        setShowUnsavedModal(true);
      }
    };

    // Push current state to enable popstate detection
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, pathname]);

  // Custom navigation function that checks for unsaved changes
  const safeNavigate = (route: string) => {
    if (hasUnsavedChanges && !isNavigatingRef.current) {
      setPendingNavigation(route);
      setShowUnsavedModal(true);
    } else {
      isNavigatingRef.current = false;
      router.push(route);
    }
  };

  // Handle unsaved changes - Save
  const handleSaveUnsavedChanges = async () => {
    setShowUnsavedModal(false);
    const navRoute = pendingNavigation;
    setPendingNavigation(null);
    isNavigatingRef.current = true;

    try {
      await onSave();

      // Navigate after successful save
      if (navRoute && navRoute !== pathname) {
        router.push(navRoute);
      }
      // Reset after a short delay to allow navigation
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    } catch (error) {
      // If save fails, don't navigate
      isNavigatingRef.current = false;
    }
  };

  // Handle unsaved changes - Discard
  const handleDiscardUnsavedChanges = (onDiscard?: () => void) => {
    if (onDiscard) {
      onDiscard();
    }
    setHasUnsavedChanges(false);
    const navRoute = pendingNavigation;
    setPendingNavigation(null);
    setShowUnsavedModal(false);
    isNavigatingRef.current = true;

    // Navigate after discarding
    if (navRoute && navRoute !== pathname) {
      router.push(navRoute);
    }
    // Reset after a short delay to allow navigation
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  };

  return {
    hasUnsavedChanges,
    showUnsavedModal,
    safeNavigate,
    handleSaveUnsavedChanges,
    handleDiscardUnsavedChanges,
    setHasUnsavedChanges,
  };
}
