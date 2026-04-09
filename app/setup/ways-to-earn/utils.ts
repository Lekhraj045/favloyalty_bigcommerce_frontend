import { addToast } from "@heroui/toast";
import { CalendarDate, today } from "@internationalized/date";
import type { Event, EventFormData } from "./types";

/**
 * Page-specific event handling utilities
 * These functions are specific to the ways-to-earn page
 */
export const createEventFromForm = (formData: EventFormData): Event | null => {
  const selectedName = formData.name?.trim() || "";
  const isCustomEvent = selectedName === "Custom Event";
  const trimmedCustomName = (formData.customEventName || "").trim();
  const trimmedEventName = isCustomEvent ? trimmedCustomName : selectedName;
  const trimmedEventPoints = formData.points?.trim() || "";

  if (
    !trimmedEventName ||
    !formData.date ||
    !trimmedEventPoints ||
    trimmedEventPoints === "0"
  ) {
    addToast({
      title: "Validation Error",
      description: isCustomEvent
        ? "Please fill in all fields: Custom Event Name, Date of Event, and Points"
        : "Please fill in all fields: Event Name, Date of Event, and Points",
      color: "danger",
    });
    return null;
  }

  if (isCustomEvent && trimmedCustomName.length > 50) {
    addToast({
      title: "Validation Error",
      description: "Custom Event Name must be 50 characters or fewer",
      color: "danger",
    });
    return null;
  }

  // Validate points is between 1-10000
  const pointsValue = parseInt(trimmedEventPoints);
  if (isNaN(pointsValue) || pointsValue < 1 || pointsValue > 10000) {
    addToast({
      title: "Validation Error",
      description: "Points must be between 1-10000",
      color: "danger",
    });
    return null;
  }

  // Validate date is not in the past
  const todayDateValue = today("UTC");
  if (
    formData.date.year < todayDateValue.year ||
    (formData.date.year === todayDateValue.year &&
      formData.date.month < todayDateValue.month) ||
    (formData.date.year === todayDateValue.year &&
      formData.date.month === todayDateValue.month &&
      formData.date.day < todayDateValue.day)
  ) {
    addToast({
      title: "Validation Error",
      description:
        "Event date cannot be in the past. Please select today or a future date.",
      color: "danger",
    });
    return null;
  }

  // Keep event date as a pure calendar date string to avoid timezone shifts
  const eventDateYmd = `${formData.date.year}-${String(formData.date.month).padStart(2, "0")}-${String(formData.date.day).padStart(2, "0")}`;

  // Check if event date is today (for isImmediate)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const selectedDate = new Date(
    formData.date.year,
    formData.date.month - 1,
    formData.date.day,
  );
  selectedDate.setHours(0, 0, 0, 0);
  const isImmediate = selectedDate.getTime() === todayDate.getTime();

  // Create new event object matching the database structure
  return {
    name: trimmedEventName,
    type: "default",
    eventDate: eventDateYmd,
    point: pointsValue,
    status: "scheduled",
    processingInfo: {
      startedAt: null,
      completedAt: null,
      jobID: null,
      processedCount: 0,
      failedCount: 0,
      totalCustomers: 0,
      error: null,
    },
    isImmediate: isImmediate,
  };
};

export const convertEventToFormData = (event: Event): EventFormData => {
  const raw = String(event.eventDate || "");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T00:00:00`)
    : new Date(raw);
  // Create a proper CalendarDate object for the DatePicker
  const calendarDate = new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  return {
    name: event.name,
    date: calendarDate,
    points: String(event.point),
  };
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

export function getCurrencyIcon(currencyCode: string): string {
  const normalized = (currencyCode ?? "").toUpperCase().trim();
  return (CURRENCY_SYMBOLS[normalized] ?? currencyCode) || "₹";
}
