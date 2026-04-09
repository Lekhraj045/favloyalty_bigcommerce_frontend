import { handleInputBlur, handleIntegerInputChange } from "@/utils/formHelpers";
import { Button } from "@heroui/button";
import { DatePicker } from "@heroui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { addToast } from "@heroui/toast";
import { Tooltip } from "@heroui/tooltip";
import { CalendarDate, today } from "@internationalized/date";
import { Clock, SquarePen, Trash2 } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import type { Event, EventFormData } from "./types";

interface EventsTableProps {
  events: Event[];
  allEvents?: Event[]; // Original events array for finding correct index
  onEdit?: (event: Event, index: number) => void;
  onDelete?: (eventId: string | number, index: number) => void;
  onSave?: (index: number, updatedEvent: Event) => void;
  onCancel?: (index: number) => void;
}

export default function EventsTable({
  events,
  allEvents,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: EventsTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EventFormData | null>(null);

  // Sort events to show "Scheduled" events first
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const statusA = (a.status || "").toLowerCase();
      const statusB = (b.status || "").toLowerCase();

      // If one is "scheduled" and the other is not, scheduled comes first
      if (statusA === "scheduled" && statusB !== "scheduled") {
        return -1;
      }
      if (statusA !== "scheduled" && statusB === "scheduled") {
        return 1;
      }

      // If both have the same status or neither is scheduled, maintain original order
      return 0;
    });
  }, [events]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateString;
    }
  };

  const isToday = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    } catch {
      return false;
    }
  };

  const handleStartEdit = (
    event: Event,
    index: number,
    e?: React.MouseEvent,
  ) => {
    // Prevent event propagation and default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // If another event is being edited, cancel it first
    if (editingIndex !== null && editingIndex !== index) {
      handleCancelEdit(editingIndex);
    }

    const date = new Date(event.eventDate);
    // Create a proper CalendarDate object for the DatePicker
    const calendarDate = new CalendarDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
    setEditFormData({
      name: event.name,
      date: calendarDate,
      points: String(event.point),
    });
    setEditingIndex(index);
    if (onEdit) {
      onEdit(event, index);
    }
  };

  const handleSaveEdit = (index: number) => {
    if (!editFormData || !onSave) return;

    const event = sortedEvents[index];
    if (!event) return;

    // Find the original index in the full events array
    const eventsArray = allEvents || events;
    const originalIndex = eventsArray.findIndex((e) => {
      if (event._id && e._id) {
        return e._id === event._id;
      }
      // For temporary events without _id, compare by reference or by all properties
      return (
        e === event ||
        (e.name === event.name &&
          e.eventDate === event.eventDate &&
          e.point === event.point)
      );
    });
    const actualIndex = originalIndex !== -1 ? originalIndex : index;

    // Validate form data
    const trimmedEventName = editFormData.name?.trim() || "";
    const trimmedEventPoints = editFormData.points?.trim() || "";

    if (
      !trimmedEventName ||
      !editFormData.date ||
      !trimmedEventPoints ||
      trimmedEventPoints === "0"
    ) {
      addToast({
        title: "Validation Error",
        description:
          "Please fill in all fields: Event Name, Date of Event, and Points",
        color: "danger",
      });
      return;
    }

    const pointsValue = parseInt(trimmedEventPoints);
    if (isNaN(pointsValue) || pointsValue < 1 || pointsValue > 10000) {
      addToast({
        title: "Validation Error",
        description: "Points must be between 1-10000",
        color: "danger",
      });
      return;
    }

    // Validate date is not in the past
    const todayDateValue = today("UTC");
    if (
      editFormData.date.year < todayDateValue.year ||
      (editFormData.date.year === todayDateValue.year &&
        editFormData.date.month < todayDateValue.month) ||
      (editFormData.date.year === todayDateValue.year &&
        editFormData.date.month === todayDateValue.month &&
        editFormData.date.day < todayDateValue.day)
    ) {
      addToast({
        title: "Validation Error",
        description:
          "Event date cannot be in the past. Please select today or a future date.",
        color: "danger",
      });
      return;
    }

    // Keep event date as pure calendar date string to avoid timezone shifts
    const eventDateYmd = `${editFormData.date.year}-${String(editFormData.date.month).padStart(2, "0")}-${String(editFormData.date.day).padStart(2, "0")}`;

    // Check if event date is today (for isImmediate)
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const selectedDate = new Date(
      editFormData.date.year,
      editFormData.date.month - 1,
      editFormData.date.day,
    );
    selectedDate.setHours(0, 0, 0, 0);
    const isImmediate = selectedDate.getTime() === todayDate.getTime();

    // Check for duplicate event (same name and date, excluding the current event being edited)
    // eventsArray is already declared above, so we reuse it
    const eventDate = new Date(
      editFormData.date.year,
      editFormData.date.month - 1,
      editFormData.date.day,
    );
    eventDate.setHours(0, 0, 0, 0);

    const isDuplicate = eventsArray.some((existingEvent, existingIndex) => {
      // Find the index in the allEvents array if we're using filtered events
      let actualExistingIndex = existingIndex;
      if (allEvents && events !== allEvents) {
        // Find the actual index in allEvents
        const foundIndex = allEvents.findIndex((e) => {
          if (existingEvent._id && e._id) {
            return e._id === existingEvent._id;
          }
          return (
            e === existingEvent ||
            (e.name === existingEvent.name &&
              e.eventDate === existingEvent.eventDate &&
              e.point === existingEvent.point)
          );
        });
        actualExistingIndex = foundIndex !== -1 ? foundIndex : existingIndex;
      }

      // Skip the current event being edited
      if (actualExistingIndex === actualIndex) {
        return false;
      }

      const existingDate = new Date(existingEvent.eventDate);
      existingDate.setHours(0, 0, 0, 0);

      return (
        existingEvent.name.toLowerCase() === trimmedEventName.toLowerCase() &&
        existingDate.getTime() === eventDate.getTime()
      );
    });

    if (isDuplicate) {
      addToast({
        title: "Validation Error",
        description: `An event with the name "${trimmedEventName}" already exists for this date. Please choose a different name or date.`,
        color: "danger",
      });
      return;
    }

    const updatedEvent: Event = {
      ...event,
      name: trimmedEventName,
      eventDate: eventDateYmd,
      point: pointsValue,
      isImmediate: isImmediate,
    };

    onSave(actualIndex, updatedEvent);
    setEditingIndex(null);
    setEditFormData(null);
  };

  const handleCancelEdit = (index: number) => {
    setEditingIndex(null);
    setEditFormData(null);
    if (onCancel) {
      onCancel(index);
    }
  };

  const eventOptions = [
    "Birthday",
    "Refer & Earn",
    "Profile Completion",
    "Subscribing to newsletter",
    "Easter",
    "Christmas",
    "New Year",
    "Diwali",
    "Holi",
    "Thanksgiving",
  ];

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "completed") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
          Completed
        </span>
      );
    } else if (statusLower === "processing") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700">
          Processing
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-100 text-sky-700">
          Scheduled
        </span>
      );
    }
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="tierTable border border-[#DEDEDE] rounded-lg overflow-hidden">
      <Table
        aria-label="Events points table"
        shadow="none"
        removeWrapper
        classNames={{
          th: "bg-[#F7F7F7] text-xs font-normal text-[#616161] px-3 py-2",
          td: "text-xs text-[#303030] px-3 py-2 border-t border-[#E3E3E3]",
        }}
      >
        <TableHeader>
          <TableColumn className="!rounded-bl-none pl-3">
            Event / Occasion
          </TableColumn>
          <TableColumn>Date of Event</TableColumn>
          <TableColumn>Points</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn className="!rounded-br-none" align="end">
            Action
          </TableColumn>
        </TableHeader>

        <TableBody>
          {sortedEvents.map((event, index) => {
            const isEditing = editingIndex === index;
            const currentEditData = isEditing ? editFormData : null;

            return (
              <TableRow
                key={event._id || `temp-${index}`}
                className={isEditing ? "bg-gray-50" : ""}
              >
                <TableCell
                  className={isEditing ? "" : "flex items-center gap-2"}
                >
                  {isEditing ? (
                    <select
                      value={currentEditData?.name || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...currentEditData!,
                          name: e.target.value,
                        })
                      }
                      className="w-full h-8 border border-gray-300 rounded-md pl-3 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#fdfdfd] appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "16px",
                        paddingRight: "1.75rem",
                      }}
                    >
                      <option value="">Select Event</option>
                      {/* Preserve custom/unlisted event names while editing */}
                      {currentEditData?.name &&
                        !eventOptions.includes(currentEditData.name) && (
                          <option value={currentEditData.name}>
                            {currentEditData.name}
                          </option>
                        )}
                      {eventOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-gray-500" />
                      {event.name}
                    </>
                  )}
                </TableCell>

                <TableCell className={isEditing ? "align-middle" : ""}>
                  {isEditing ? (
                    <DatePicker
                      showMonthAndYearPickers
                      size="sm"
                      value={currentEditData?.date || undefined}
                      onChange={(date) =>
                        setEditFormData({
                          ...currentEditData!,
                          date: date || null,
                        })
                      }
                      minValue={today("UTC")}
                      classNames={{
                        base: "w-full",
                        inputWrapper: [
                          "bg-[#fdfdfd]",
                          "border",
                          "border-[#8a8a8a]",
                          "rounded-lg",
                          "h-8",
                          "min-h-8",
                          "px-3",
                        ],
                        input: "h-8",
                      }}
                    />
                  ) : (
                    <>
                      {formatDate(event.eventDate)}
                      {isToday(event.eventDate) && (
                        <span className="text-xs text-gray-500 ml-1">
                          (Today)
                        </span>
                      )}
                    </>
                  )}
                </TableCell>

                <TableCell>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentEditData?.points || ""}
                      onChange={(e) => {
                        handleIntegerInputChange(
                          e.target.value,
                          (value: string) =>
                            setEditFormData({
                              ...currentEditData!,
                              points: value,
                            }),
                        );
                      }}
                      onBlur={() =>
                        handleInputBlur(
                          currentEditData?.points || "",
                          (value: string) =>
                            setEditFormData({
                              ...currentEditData!,
                              points: value,
                            }),
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          e.key !== "Backspace" &&
                          e.key !== "Delete" &&
                          e.key !== "ArrowLeft" &&
                          e.key !== "ArrowRight" &&
                          e.key !== "Tab"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Points (1-10000)"
                      className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                    />
                  ) : (
                    `${event.point} points`
                  )}
                </TableCell>

                <TableCell>{getStatusBadge(event.status)}</TableCell>

                <TableCell>
                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="flat"
                          className="h-7 px-3 text-xs bg-black text-white hover:bg-gray-800"
                          onPress={() => handleSaveEdit(index)}
                          isDisabled={
                            !currentEditData?.name ||
                            !currentEditData?.date ||
                            !currentEditData?.points ||
                            currentEditData.points === "0"
                          }
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          className="h-7 px-3 text-xs"
                          onPress={() => handleCancelEdit(index)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <div
                        className="flex gap-4 text-gray-500"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {onEdit && (
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleStartEdit(event, index, e);
                              return false;
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              return false;
                            }}
                            className="cursor-pointer hover:opacity-70 inline-flex items-center"
                          >
                            <Tooltip
                              showArrow={true}
                              closeDelay={0}
                              content="Edit"
                            >
                              <SquarePen
                                size={14}
                                className="text-gray-500 hover:text-black"
                              />
                            </Tooltip>
                          </span>
                        )}
                        {onDelete &&
                          (() => {
                            // Find the original index in the full events array
                            const eventsArray = allEvents || events;
                            const originalIndex = eventsArray.findIndex((e) => {
                              if (event._id && e._id) {
                                return e._id === event._id;
                              }
                              return (
                                e === event ||
                                (e.name === event.name &&
                                  e.eventDate === event.eventDate &&
                                  e.point === event.point)
                              );
                            });
                            const actualIndex =
                              originalIndex !== -1 ? originalIndex : index;

                            // Check if event is completed - disable delete for completed events
                            const isCompleted =
                              event.status?.toLowerCase() === "completed";

                            return (
                              <span
                                onClick={(e) => {
                                  if (isCompleted) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return false;
                                  }
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onDelete(
                                    event._id || actualIndex,
                                    actualIndex,
                                  );
                                  return false;
                                }}
                                onMouseDown={(e) => {
                                  if (isCompleted) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return false;
                                  }
                                  e.preventDefault();
                                  e.stopPropagation();
                                  return false;
                                }}
                                className={
                                  isCompleted
                                    ? "cursor-not-allowed opacity-50 inline-flex items-center"
                                    : "cursor-pointer hover:opacity-70 inline-flex items-center"
                                }
                              >
                                <Tooltip
                                  showArrow={true}
                                  closeDelay={0}
                                  content={
                                    isCompleted
                                      ? "Cannot delete completed events"
                                      : "Delete"
                                  }
                                >
                                  <Trash2
                                    size={14}
                                    className={
                                      isCompleted
                                        ? "text-gray-300"
                                        : "text-gray-500 hover:text-red-500"
                                    }
                                  />
                                </Tooltip>
                              </span>
                            );
                          })()}
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
