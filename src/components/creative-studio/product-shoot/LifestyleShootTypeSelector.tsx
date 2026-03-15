import { Check } from "lucide-react";
import { LifestyleShootShotType } from "./types";
import { lifestyleShootTypes } from "./lifestyleShootConfigs";

interface LifestyleShootTypeSelectorProps {
  selectedType: LifestyleShootShotType;
  onSelect: (type: LifestyleShootShotType) => void;
}

export const LifestyleShootTypeSelector = ({ selectedType, onSelect }: LifestyleShootTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {lifestyleShootTypes.map((shot) => {
        const isSelected = selectedType === shot.id;
        return (
          <button
            key={shot.id}
            type="button"
            onClick={() => onSelect(shot.id)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
              isSelected
                ? 'border-accent bg-accent/10 shadow-md'
                : 'border-border bg-card hover:border-accent/40 hover:shadow-sm'
            }`}
          >
            <div className="text-2xl mb-2">{shot.icon}</div>
            <h4 className="font-medium text-foreground text-sm mb-1">{shot.name}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{shot.description}</p>
            
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Check className="w-3 h-3 text-accent-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
