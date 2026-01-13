import { Sparkles, Image, Video, RefreshCw } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useBrands } from "@/hooks/useBrands";
import { CreativeStudioState, typeCards } from "./types";

interface CreativeStudioHeaderProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

export const CreativeStudioHeader = ({ 
  state, 
  onUpdate, 
  onRegenerate,
  showRegenerate = false 
}: CreativeStudioHeaderProps) => {
  const { brands, currentBrand } = useBrands();

  const handleTypeCardClick = (cardId: string) => {
    const card = typeCards.find(c => c.id === cardId);
    if (card) {
      onUpdate({ 
        selectedTypeCard: cardId,
        useCase: cardId as CreativeStudioState['useCase'],
      });
    }
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-6">
      {/* Centered Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-accent" />
          Create
        </h1>
        <p className="text-muted-foreground text-lg">
          What would you like to create today?
        </p>
      </div>

      {/* Type Cards - Top, Icon + Label Only */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {typeCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleTypeCardClick(card.id)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
              state.selectedTypeCard === card.id
                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                : 'border-border bg-card hover:border-accent/50 hover:shadow-md'
            }`}
          >
            <span className="text-4xl mb-3">{card.icon}</span>
            <span className={`font-medium ${
              state.selectedTypeCard === card.id ? 'text-accent' : 'text-foreground'
            }`}>
              {card.label}
            </span>
          </button>
        ))}
      </div>

      {/* Settings Pills Row - Single Row */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Brand Selector Pill */}
        <Select 
          value={state.selectedBrand || currentBrand?.id || ''} 
          onValueChange={(value) => onUpdate({ selectedBrand: value })}
        >
          <SelectTrigger className="h-9 px-4 rounded-full bg-secondary/50 border-0 text-sm font-medium hover:bg-secondary transition-colors w-auto">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campaign Selector Pill */}
        <Select value={state.selectedCampaign || ''} onValueChange={(value) => onUpdate({ selectedCampaign: value })}>
          <SelectTrigger className="h-9 px-4 rounded-full bg-secondary/50 border-0 text-sm font-medium hover:bg-secondary transition-colors w-auto">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summer-2025">Summer 2025</SelectItem>
            <SelectItem value="holiday-collection">Holiday Collection</SelectItem>
            <SelectItem value="new-arrivals">New Arrivals</SelectItem>
          </SelectContent>
        </Select>

        {/* Media Type Toggle Pill */}
        <div className="flex items-center rounded-full bg-secondary/50 overflow-hidden shrink-0">
          <button
            onClick={() => onUpdate({ mediaType: 'image' })}
            className={`flex items-center gap-1.5 px-4 h-9 text-sm font-medium transition-colors ${
              state.mediaType === 'image' 
                ? 'bg-accent text-accent-foreground rounded-full' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Image className="w-4 h-4" />
            Image
          </button>
          <button
            onClick={() => onUpdate({ mediaType: 'video' })}
            className={`flex items-center gap-1.5 px-4 h-9 text-sm font-medium transition-colors ${
              state.mediaType === 'video' 
                ? 'bg-accent text-accent-foreground rounded-full' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
        </div>

        {/* Number of Concepts Pill */}
        <Select 
          value={state.imageCount.toString()} 
          onValueChange={(value) => onUpdate({ imageCount: parseInt(value) })}
        >
          <SelectTrigger className="h-9 px-4 rounded-full bg-secondary/50 border-0 text-sm font-medium hover:bg-secondary transition-colors w-auto">
            <SelectValue placeholder="# Concepts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Concepts</SelectItem>
            <SelectItem value="3">3 Concepts</SelectItem>
            <SelectItem value="4">4 Concepts</SelectItem>
            <SelectItem value="6">6 Concepts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Brief Input with Regenerate Button */}
      <div className="w-full flex gap-3">
        <input
          type="text"
          value={state.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          placeholder="Enter your creative brief..."
          className="flex-1 h-14 bg-card border border-border rounded-2xl px-5 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 text-foreground placeholder:text-muted-foreground text-lg"
        />
        {showRegenerate && (
          <button
            onClick={onRegenerate}
            className="h-14 px-5 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border transition-colors flex items-center gap-2 text-foreground font-medium"
            title="Regenerate concepts"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        )}
      </div>
    </div>
  );
};
