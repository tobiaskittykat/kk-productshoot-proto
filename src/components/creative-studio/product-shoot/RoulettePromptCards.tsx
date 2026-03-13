import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface VariationTierTogglesProps {
  enabledTiers: Record<string, boolean>;
  onToggle: (tier: string, enabled: boolean) => void;
  sourceCount: number;
  imageCount: number;
}

const tiers = [
  {
    id: 'faithful',
    icon: '🎞️',
    label: 'Close Recreation',
    description: 'Next frame on the same roll — micro angle shift, identical grain & light',
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
  },
  {
    id: 'moderate',
    icon: '🔄',
    label: 'Different Moment',
    description: 'Same session, same set — clearly different pose, same atmosphere',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
  },
  {
    id: 'creative',
    icon: '🎬',
    label: 'Same Set, Fresh Take',
    description: 'Same location & lighting — new composition, could be a different model',
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/20',
  },
];

export function VariationTierToggles({
  enabledTiers,
  onToggle,
  sourceCount,
  imageCount,
}: VariationTierTogglesProps) {
  const enabledCount = Object.values(enabledTiers).filter(Boolean).length;
  const totalImages = sourceCount * enabledCount * imageCount;

  return (
    <div className="space-y-2">
      {tiers.map((tier) => {
        const enabled = enabledTiers[tier.id] ?? true;
        return (
          <div
            key={tier.id}
            className={cn(
              "flex items-center justify-between rounded-xl border p-3 transition-all",
              tier.border,
              enabled ? tier.bg : "bg-muted/30 opacity-60",
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base">{tier.icon}</span>
              <div className="min-w-0">
                <span className="text-sm font-medium text-foreground">{tier.label}</span>
                <p className="text-[11px] text-muted-foreground truncate">{tier.description}</p>
              </div>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(v) => onToggle(tier.id, v)}
              className="shrink-0 ml-3"
            />
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground pt-1">
        {enabledCount} tier{enabledCount !== 1 ? 's' : ''} × {sourceCount} source{sourceCount !== 1 ? 's' : ''} × {imageCount} = <strong>{totalImages} images</strong>
      </p>
    </div>
  );
}
