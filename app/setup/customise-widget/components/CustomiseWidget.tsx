import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import ColorPickerField from "./ColorPickerField";

export default function CustomiseWidgetArea() {
  const [widgetColor, setWidgetColor] = useState("#047b5d");
  const [headingColor, setHeadingColor] = useState("#ffffff");
  const [widgetIconColor, setWidgetIconColor] = useState("#ffffff");
  return (
    <>
      <div className="card">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold">Brand colors</h2>
            <p>Set the brand colors for your widget.</p>
          </div>

          <div className="flex gap-8">
            <ColorPickerField
              label="Widget Color"
              value={widgetColor}
              onChange={setWidgetColor}
            />

            <ColorPickerField
              label="Heading Text Color"
              value={headingColor}
              onChange={setHeadingColor}
            />

            <ColorPickerField
              label="Widget Icon Color"
              value={widgetIconColor}
              onChange={setWidgetIconColor}
            />
          </div>
        </div>
      </div>
    </>
  );
}
