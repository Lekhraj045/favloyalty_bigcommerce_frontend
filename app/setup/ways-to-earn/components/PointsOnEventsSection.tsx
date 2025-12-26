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
}: PointsOnEventsSectionProps) {
  return (
    <div className="card !p-0">
      <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold">Points on Events</h2>
          <p>
            Configure special events where customers can earn loyalty points.
            You can set up multiple events with their dates and point values.
          </p>
        </div>
        <Switch
          aria-label="Points on Events"
          size="sm"
          color="success"
          isSelected={enabled}
          onValueChange={onToggleChange}
        />
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
                    onChange={(e) => onFormChange("name", e.target.value)}
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
                  </select>
                </div>
              </div>

              <div className="w-full">
                <label className="block mb-1 text-[13px]">Date of Event</label>
                <DatePicker
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
                      onFormChange("points", value)
                    );
                  }}
                  onBlur={() =>
                    handleInputBlur(formData.points, (value: string) =>
                      onFormChange("points", value)
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
