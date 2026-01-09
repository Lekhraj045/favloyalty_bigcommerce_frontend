import { Button } from "@heroui/button";
import React, { useState } from "react";
import AnnouncementsTableArea from "./AnnouncementsTable";
import AnnouncementsModalArea from "./AnnouncementsModal";

export default function AnnouncementsArea() {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  return (
    <>
      <div className="card !p-0">
        <div className="flex flex-col">
          <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold">Announcements</h2>
              <p>Select the options you want to display as announcements</p>
            </div>

            <AnnouncementsModalArea
              editingIndex={editingIndex}
              onCloseEdit={() => setEditingIndex(null)}
            />
          </div>

          <AnnouncementsTableArea onEdit={(index) => setEditingIndex(index)} />
        </div>
      </div>
    </>
  );
}
