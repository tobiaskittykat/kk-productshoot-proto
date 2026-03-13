import { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles, Copy, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface RoulettePrompt {
  tier: 'faithful' | 'moderate' | 'creative';
  label: string;
  description: string;
  naturalPrompt: string;
  enabled: boolean;
  imageCount: number;
}

interface RoulettePromptCardsProps {
  prompts: RoulettePrompt[];
  isAnalyzing: boolean;
  onToggle: (tier: string, enabled: boolean) => void;
  onImageCountChange: (tier: string, count: number) => void;
  onPromptEdit: (tier: string, newPrompt: string) => void;
}

const tierColors: Record<string, { bg: string; border: string; badge: string; icon: string }> = {
  faithful: {
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    badge: 'bg-blue-500/10 text-blue-400',
    icon: '🎯',
  },
  moderate: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-400',
    icon: '🔄',
  },
  creative: {
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/20',
    badge: 'bg-purple-500/10 text-purple-400',
    icon: '✨',
  },
};

function PromptCard({
  prompt,
  onToggle,
  onImageCountChange,
  onPromptEdit,
}: {
  prompt: RoulettePrompt;
  onToggle: (enabled: boolean) => void;
  onImageCountChange: (count: number) => void;
  onPromptEdit: (newPrompt: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const colors = tierColors[prompt.tier] || tierColors.faithful;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.naturalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      colors.border,
      prompt.enabled ? colors.bg : "bg-muted/30 opacity-60",
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg">{colors.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground">{prompt.label}</span>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", colors.badge)}>
                {prompt.tier}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{prompt.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Image count */}
          <Select
            value={String(prompt.imageCount)}
            onValueChange={(v) => onImageCountChange(Number(v))}
            disabled={!prompt.enabled}
          >
            <SelectTrigger className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map(n => (
                <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Switch
            checked={prompt.enabled}
            onCheckedChange={onToggle}
          />
        </div>
      </div>

      {/* Expandable prompt editor */}
      {prompt.enabled && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Edit prompt
          </button>
          {expanded && (
            <div className="mt-2 space-y-2">
              <div className="relative">
                <Textarea
                  value={prompt.naturalPrompt}
                  onChange={(e) => onPromptEdit(e.target.value)}
                  className="text-xs leading-relaxed min-h-[200px] max-h-[400px] bg-background/50"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RoulettePromptCards({
  prompts,
  isAnalyzing,
  onToggle,
  onImageCountChange,
  onPromptEdit,
}: RoulettePromptCardsProps) {
  if (isAnalyzing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 animate-pulse text-accent" />
          Analyzing scene &amp; generating variation prompts...
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (prompts.length === 0) return null;

  const enabledCount = prompts.filter(p => p.enabled).length;
  const totalImages = prompts.filter(p => p.enabled).reduce((sum, p) => sum + p.imageCount, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Variation Prompts
        </span>
        <span className="text-xs text-muted-foreground">
          {enabledCount} tier{enabledCount !== 1 ? 's' : ''} · {totalImages} image{totalImages !== 1 ? 's' : ''}
        </span>
      </div>
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.tier}
          prompt={prompt}
          onToggle={(enabled) => onToggle(prompt.tier, enabled)}
          onImageCountChange={(count) => onImageCountChange(prompt.tier, count)}
          onPromptEdit={(newPrompt) => onPromptEdit(prompt.tier, newPrompt)}
        />
      ))}
    </div>
  );
}
