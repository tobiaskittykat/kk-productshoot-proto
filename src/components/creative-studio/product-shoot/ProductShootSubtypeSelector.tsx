import { Sparkles, RefreshCw, Package, Palette } from "lucide-react";
import { ShootMode } from "./types";

interface ProductShootSubtypeSelectorProps {
  onSelectMode?: (mode: ShootMode) => void;
  selectedMode?: ShootMode;
  onModeSelect?: (mode: ShootMode) => void;
}

export const ProductShootSubtypeSelector = ({ 
  onSelectMode,
  selectedMode, 
  onModeSelect 
}: ProductShootSubtypeSelectorProps) => {
  const handleSelect = (mode: ShootMode) => {
    if (onSelectMode) {
      onSelectMode(mode);
    } else if (onModeSelect) {
      onModeSelect(mode);
    }
  };

  const modes: { id: ShootMode; icon: typeof Sparkles; title: string; description: string }[] = [
    { id: 'new', icon: Sparkles, title: 'New Shoot', description: 'Choose your product, background, and model from scratch' },
    { id: 'lifestyle-shoot', icon: Palette, title: 'Lifestyle Shoot', description: 'Moodboard-driven shoot with full creative control' },
    { id: 'remix', icon: RefreshCw, title: 'Remix Existing', description: 'Upload an ad creative and swap the shoes with your product' },
    { id: 'setup', icon: Package, title: 'Set Up Product', description: 'Create a new colorway from an existing shoe' },
  ];

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          What would you like to create?
        </h2>
        <p className="text-muted-foreground">
          Start fresh, use a moodboard, remix an existing shoot, or set up a new product
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {modes.map(({ id, icon: Icon, title, description }) => (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left group ${
              selectedMode === id
                ? 'border-accent bg-accent/10 shadow-md'
                : 'border-border bg-card hover:border-accent/40 hover:shadow-sm'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              selectedMode === id
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground group-hover:bg-accent/20'
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
