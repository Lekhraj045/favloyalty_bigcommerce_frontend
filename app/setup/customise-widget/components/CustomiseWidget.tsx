import { HexColorPicker, HexColorInput } from "react-colorful";
import ColorPickerField from "./ColorPickerField";
import { useWidgetCustomization } from "../context/WidgetCustomizationContext";

export default function CustomiseWidgetArea() {
  const { state, updateState } = useWidgetCustomization();
  
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
              value={state.widgetBgColor}
              onChange={(color) => updateState({ widgetBgColor: color })}
            />

            <ColorPickerField
              label="Heading Text Color"
              value={state.headingColor}
              onChange={(color) => updateState({ headingColor: color })}
            />

            <ColorPickerField
              label="Widget Icon Color"
              value={state.widgetIconColor || "#ffffff"}
              onChange={(color) => updateState({ widgetIconColor: color })}
            />
          </div>
        </div>
      </div>
    </>
  );
}
