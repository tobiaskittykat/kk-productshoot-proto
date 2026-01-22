import { Shuffle, Plus, Bookmark, ImageIcon, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { CreativeStudioState, SavedConcept } from "./types";

interface StepOnePromptProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  onLoadSavedConcept?: (concept: SavedConcept) => void;
}

// Marketing-style briefs for Bandolier - organized by type
const exampleBriefsByType: Record<string, string[]> = {
  lifestyle: [
    // Summer/Travel campaigns
    "Summer crossbody launch campaign - effortless European getaway vibes, golden hour luxury",
    "Vacation essentials shoot - yacht deck to seaside dinner, one bag does it all",
    "Coastal collection campaign - sun-drenched elegance, linen and ocean blues",
    
    // Festival/Desert campaigns
    "Festival season drop - desert sunset energy, bold and expressive",
    "Road trip content series - open highways, adventure-ready accessories",
    "Southwest-inspired editorial - earthy tones, effortless boho-luxe",
    
    // Urban/Street Style campaigns
    "City essentials campaign - coffee run to cocktail hour, hands-free living",
    "Street style editorial - fashion week energy, urban sophistication",
    "Morning routine content - getting ready moments, everyday luxury",
    
    // Party/Evening campaigns
    "Holiday party campaign - champagne moments, after-dark glamour",
    "NYE collection shoot - celebration vibes, sparkle and spontaneity",
    "Girls night content - getting ready together, going out in style",
    
    // Floral/Spring campaigns
    "Spring refresh campaign - garden party meets street style",
    "Mother's Day gifting shoot - brunch settings, fresh florals, thoughtful luxury",
    "New arrivals launch - spring color story, bright and optimistic",
    
    // Bold/Statement campaigns
    "Statement print drop - leopard season, unapologetically bold",
    "Power accessories editorial - strong silhouettes, confident energy",
    "Fall fashion campaign - rich tones, texture-forward styling",
  ],
  product: [],
  localization: [],
  ugc: [],
};

const getRandomBriefs = (typeId: string, count: number = 6): string[] => {
  const briefs = exampleBriefsByType[typeId] || exampleBriefsByType.product;
  const shuffled = [...briefs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const StepOnePrompt = ({ state, onUpdate, onLoadSavedConcept }: StepOnePromptProps) => {
  const [displayedBriefs, setDisplayedBriefs] = useState<string[]>([]);

  // Initialize and update briefs when type changes
  useEffect(() => {
    const typeId = state.selectedTypeCard || 'product';
    setDisplayedBriefs(getRandomBriefs(typeId));
  }, [state.selectedTypeCard]);

  const handleShuffle = () => {
    const typeId = state.selectedTypeCard || 'product';
    setDisplayedBriefs(getRandomBriefs(typeId));
  };

  const handleBriefClick = (brief: string) => {
    onUpdate({ prompt: brief });
  };

  

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-6 pt-8">
      {/* Saved Concepts Section - show when available and prompt is empty */}
      {!state.prompt.trim() && state.savedConcepts.length > 0 && onLoadSavedConcept && (
        <div className="w-full space-y-5">
          {/* Section Header */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-sm text-muted-foreground font-medium px-2 flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Your saved concepts
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Saved Concept Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.savedConcepts.slice(0, 6).map((concept) => (
              <button
                key={concept.id}
                onClick={() => onLoadSavedConcept(concept)}
                className="group flex flex-col gap-2.5 p-5 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-md transition-all duration-200 text-left"
                style={{
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)'
                }}
              >
                <span className="font-medium text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1">
                  {concept.title}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {concept.description}
                </span>
                {/* Show saved assets indicators */}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {concept.presets?.moodboardId && (
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded-full">
                      <ImageIcon className="w-3 h-3" />
                      Moodboard
                    </span>
                  )}
                  {(concept.presets?.productIds?.length ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded-full">
                      <Package className="w-3 h-3" />
                      {concept.presets!.productIds!.length} Product{concept.presets!.productIds!.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Example Briefs Section - only show when prompt is empty */}
      {!state.prompt.trim() && (
      <div className="w-full space-y-5">
        {/* Section Header */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-sm text-muted-foreground font-medium px-2">Example briefs</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Brief Cards Grid - KittyKat style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayedBriefs.map((brief, index) => (
            <button
              key={index}
              onClick={() => handleBriefClick(brief)}
              className="group flex items-start gap-3 p-5 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-md transition-all duration-200 text-left"
              style={{
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)'
              }}
            >
              <span className="text-muted-foreground text-sm leading-relaxed flex-1 group-hover:text-foreground transition-colors">
                {brief}
              </span>
              <Plus className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0 mt-0.5" />
            </button>
          ))}
        </div>

        {/* Shuffle Button - KittyKat style */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleShuffle}
            className="action-chip"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
