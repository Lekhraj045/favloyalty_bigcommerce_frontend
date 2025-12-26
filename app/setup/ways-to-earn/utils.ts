import { addToast } from "@heroui/toast";
import { CalendarDate, today } from "@internationalized/date";
import type { Event, EventFormData } from "./types";

/**
 * Page-specific event handling utilities
 * These functions are specific to the ways-to-earn page
 */
export const createEventFromForm = (formData: EventFormData): Event | null => {
  const trimmedEventName = formData.name?.trim() || "";
  const trimmedEventPoints = formData.points?.trim() || "";

  if (
    !trimmedEventName ||
    !formData.date ||
    !trimmedEventPoints ||
    trimmedEventPoints === "0"
  ) {
    addToast({
      title: "Validation Error",
      description:
        "Please fill in all fields: Event Name, Date of Event, and Points",
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

  // Convert DateValue to Date
  const eventDateObj = new Date(
    formData.date.year,
    formData.date.month - 1,
    formData.date.day
  );

  // Check if event date is today (for isImmediate)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const selectedDate = new Date(eventDateObj);
  selectedDate.setHours(0, 0, 0, 0);
  const isImmediate = selectedDate.getTime() === todayDate.getTime();

  // Create new event object matching the database structure
  return {
    name: trimmedEventName,
    type: "default",
    eventDate: eventDateObj.toISOString(),
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
  const date = new Date(event.eventDate);
  // Create a proper CalendarDate object for the DatePicker
  const calendarDate = new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return {
    name: event.name,
    date: calendarDate,
    points: String(event.point),
  };
};
