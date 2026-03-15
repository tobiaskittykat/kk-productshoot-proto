import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifestyleAdvancedSettings, initialLifestyleAdvancedSettings } from "./types";
import {
  cameraAngleOptions,
  lightingOptions,
  cameraLensOptions,
  cameraTypeOptions,
  filmStockOptions,
  depthOfFieldOptions,
} from "./lifestyleShootConfigs";

interface LifestyleAdvancedPanelProps {
  settings: LifestyleAdvancedSettings;
  onChange: (settings: LifestyleAdvancedSettings) => void;
}

export const LifestyleAdvancedPanel = ({ settings, onChange }: LifestyleAdvancedPanelProps) => {
  const update = (key: keyof LifestyleAdvancedSettings, value: string) => {
    onChange({ ...settings, [key]: value });
  };

  const isDefault = JSON.stringify(settings) === JSON.stringify(initialLifestyleAdvancedSettings);

  const dropdowns: { key: keyof LifestyleAdvancedSettings; label: string; options: typeof cameraAngleOptions }[] = [
    { key: 'cameraAngle', label: 'Camera Angle', options: cameraAngleOptions },
    { key: 'lighting', label: 'Lighting', options: lightingOptions },
    { key: 'cameraLens', label: 'Camera Lens', options: cameraLensOptions },
    { key: 'cameraType', label: 'Camera Type', options: cameraTypeOptions },
    { key: 'filmStock', label: 'Film Stock', options: filmStockOptions },
    { key: 'depthOfField', label: 'Depth of Field', options: depthOfFieldOptions },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Advanced Camera Settings</span>
        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ ...initialLifestyleAdvancedSettings })}
            className="text-xs text-muted-foreground h-7"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset defaults
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {dropdowns.map(({ key, label, options }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{label}</label>
            <Select value={settings[key]} onValueChange={(v) => update(key, v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};
