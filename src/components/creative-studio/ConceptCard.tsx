import { Check, Plus } from "lucide-react";
import { Concept } from "./types";

interface ConceptCardProps {
  concept: Concept;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const ConceptCard = ({ concept, index, isSelected, onSelect }: ConceptCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
        isSelected 
          ? 'border-accent shadow-lg ring-2 ring-accent/20' 
          : 'border-border bg-card hover:border-accent/50 hover:shadow-md'
      }`}
    >
      <div className="flex">
        {/* Accent bar like Gamma */}
        <div className={`w-2 shrink-0 ${isSelected ? 'bg-accent' : 'bg-accent/30'}`} />
        
        <div className="flex-1 p-5">
          <div className="flex items-start gap-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
              isSelected 
                ? 'bg-accent text-accent-foreground' 
                : 'bg-secondary text-muted-foreground'
            }`}>
              {isSelected ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-base mb-2">{concept.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{concept.description}</p>
              {concept.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {concept.tags.slice(0, 4).map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

interface AddConceptCardProps {
  onClick: () => void;
}

export const AddConceptCard = ({ onClick }: AddConceptCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-secondary/30 transition-all duration-200 flex items-center justify-center gap-2 text-muted-foreground hover:text-accent"
    >
      <Plus className="w-5 h-5" />
      <span className="font-medium">Add concept</span>
    </button>
  );
};