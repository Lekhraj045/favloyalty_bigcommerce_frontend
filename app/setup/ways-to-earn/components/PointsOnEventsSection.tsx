import { handleInputBlur, handleIntegerInputChange } from "@/utils/formHelpers";
import { Button } from "@heroui/button";
import { DatePicker } from "@heroui/date-picker";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { today } from "@internationalized/date";
import { Search } from "lucide-react";
import EventsTable from "../eventsTable";
import type { Event, EventFormData } from "../types";

interface PointsOnEventsSectionProps {
  enabled: boolean;
  events: Event[];
  formData: EventFormData;
  searchQuery: string;
  filteredEvents: Event[];
  onToggleChange: (enabled: boolean) => void;
  onFormChange: (field: keyof EventFormData, value: any) => void;
  onAddEvent: () => void;
  onEditEvent: (event: Event, index: number) => void;
  onSaveEvent: (index: number, updatedEvent: Event) => void;
  onCancelEvent: (index: number) => void;
  onDeleteEvent: (eventId: string | number, index: number) => void;
  onSearchChange: (query: string) => void;
  isFreePlan?: boolean;
  onPremiumClick?: (featureName: string) => void;
}

export default function PointsOnEventsSection({
  enabled,
  events,
  formData,
  searchQuery,
  filteredEvents,
  onToggleChange,
  onFormChange,
  onAddEvent,
  onEditEvent,
  onSaveEvent,
  onCancelEvent,
  onDeleteEvent,
  onSearchChange,
  isFreePlan = false,
  onPremiumClick,
}: PointsOnEventsSectionProps) {
  const handleToggleChange = (value: boolean) => {
    if (isFreePlan && value && onPremiumClick) {
      onPremiumClick("Points on Events");
      return;
    }
    onToggleChange(value);
  };

  const isCustomEvent = formData.name === "Custom Event";

  return (
    <div className="card !p-0">
      <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold">Points on Events</h2>
            {isFreePlan && (
              <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-yellow-800"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
          </div>
          <p>
            Configure special events where customers can earn loyalty points.
            You can set up multiple events with their dates and point values.
          </p>
        </div>
        <div
          onClick={(e) => {
            if (isFreePlan && onPremiumClick) {
              e.preventDefault();
              e.stopPropagation();
              onPremiumClick("Points on Events");
            }
          }}
          className={isFreePlan ? "cursor-pointer" : ""}
        >
          <Switch
            aria-label="Points on Events"
            size="sm"
            color="success"
            isSelected={enabled}
            onValueChange={handleToggleChange}
            isDisabled={isFreePlan}
            classNames={{
              base: isFreePlan ? "opacity-50 cursor-not-allowed" : "",
            }}
          />
        </div>
      </div>

      {enabled && (
        <>
          <div className="card !p-0 m-4">
            <div className="flex justify-between items-center gap-4 p-4 border-b border-[#DEDEDE]">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-bold">Add New Event</h2>
                <p>
                  Events allow you to award points for special occasions.
                  Same-day events are processed immediately in the background.
                </p>
              </div>
              <Button className="custom-btn" onClick={onAddEvent}>
                Add Event
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4">
              <div>
                <div className="w-full custom-dropi relative">
                  <label className="block mb-1 text-[13px]">
                    Select Name For Point
                  </label>
                  <select
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      onFormChange("name", value);
                      // Clear custom name when switching away from custom
                      if (value !== "Custom Event") {
                        onFormChange("customEventName", "");
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Event</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Refer & Earn">Refer & Earn</option>
                    <option value="Profile Completion">
                      Profile Completion
                    </option>
                    <option value="Subscribing to newsletter">
                      Subscribing to newsletter
                    </option>
                    <option value="Easter">Easter</option>
                    <option value="Christmas">Christmas</option>
                    <option value="New Year">New Year</option>
                    <option value="Diwali">Diwali</option>
                    <option value="Holi">Holi</option>
                    <option value="Custom Event">Custom Event</option>
                  </select>
                </div>
              </div>

              <div className="w-full">
                <label className="block mb-1 text-[13px]">Date of Event</label>
                <DatePicker
                  key={`date-picker-${events.length}-${formData.name || "empty"}-${formData.points || "empty"}`}
                  showMonthAndYearPickers
                  size="sm"
                  value={formData.date || undefined}
                  onChange={(date) => onFormChange("date", date || null)}
                  minValue={today("UTC")}
                  classNames={{
                    base: "w-full",
                    inputWrapper: [
                      "bg-[#fdfdfd]",
                      "border",
                      "border-[#8a8a8a]",
                      "rounded-lg",
                      "h-8",
                      "px-3",
                    ],
                  }}
                />
              </div>

              <div className="">
                <label className="block mb-1 text-[13px]">
                  Points (1-10000)
                </label>
                <input
                  type="text"
                  value={formData.points}
                  onChange={(e) => {
                    handleIntegerInputChange(e.target.value, (value: string) =>
                      onFormChange("points", value),
                    );
                  }}
                  onBlur={() =>
                    handleInputBlur(formData.points, (value: string) =>
                      onFormChange("points", value),
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
                  className="w-full h-8 border border-[#8a8a8a] rounded-lg px-3 text-[13px] leading-none focus:outline-none bg-[#fdfdfd]"
                />
              </div>
            </div>

            {isCustomEvent && (
              <div className="px-4 pb-4 -mt-2">
                <div className="max-w-[calc((100%-2rem)/3)]">
                  <Input
                    label="Custom Event Name"
                    labelPlacement="outside"
                    size="sm"
                    variant="bordered"
                    value={formData.customEventName || ""}
                    onChange={(e) =>
                      onFormChange("customEventName", e.target.value)
                    }
                    maxLength={50}
                    description={`${(formData.customEventName || "").length}/50 characters`}
                    classNames={{
                      base: "w-full",
                      mainWrapper: "gap-1",
                      inputWrapper: [
                        "h-8",
                        "min-h-8",
                        "bg-[#fdfdfd]",
                        "border",
                        "border-[#8a8a8a]",
                        "rounded-lg",
                        "px-3",
                      ].join(" "),
                      label: "text-[13px] leading-none mb-0",
                      input: ["text-[13px]"].join(" "),
                      description: "text-xs text-default-500",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {events.length > 0 && (
            <div className="card !p-0 m-4">
              <div className="flex justify-between items-center gap-4 p-4 border-b border-[#DEDEDE]">
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-bold">Scheduled Events</h2>
                  <p>View and manage scheduled events.</p>
                </div>

                <div className="h-8">
                  <Input
                    variant="bordered"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    startContent={
                      <Search className="text-lg text-default-400 pointer-events-none shrink-0 w-4" />
                    }
                    classNames={{
                      base: "w-full",
                      inputWrapper: [
                        "h-8",
                        "min-h-8",
                        "bg-[#fdfdfd]",
                        "border",
                        "border-[#8a8a8a]",
                        "rounded-lg",
                        "w-[200px]",
                        "px-2",
                      ].join(" "),
                      input: ["text-xs"].join(" "),
                    }}
                  />
                </div>
              </div>

              <div className="p-4">
                <EventsTable
                  events={filteredEvents}
                  allEvents={events}
                  onEdit={onEditEvent}
                  onSave={onSaveEvent}
                  onCancel={onCancelEvent}
                  onDelete={onDeleteEvent}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
