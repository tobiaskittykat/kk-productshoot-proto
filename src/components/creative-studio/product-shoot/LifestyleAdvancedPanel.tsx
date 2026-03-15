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
        {/* Camera Angle */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Camera Angle</label>
          <Select value={settings.cameraAngle} onValueChange={(v) => update('cameraAngle', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cameraAngleOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lighting */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Lighting</label>
          <Select value={settings.lighting} onValueChange={(v) => update('lighting', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lightingOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Camera Lens */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Camera Lens</label>
          <Select value={settings.cameraLens} onValueChange={(v) => update('cameraLens', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cameraLensOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Camera Type */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Camera Type</label>
          <Select value={settings.cameraType} onValueChange={(v) => update('cameraType', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cameraTypeOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Film Stock */}
        <div className="space-y-1.5 col-span-2">
          <label className="text-xs text-muted-foreground">Film Stock</label>
          <Select value={settings.filmStock} onValueChange={(v) => update('filmStock', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filmStockOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
