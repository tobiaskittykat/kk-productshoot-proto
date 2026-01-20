import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { ReferenceImage } from "./types";
import { ReferenceThumbnail } from "./ReferenceThumbnail";

interface ExtendedReferenceImage extends ReferenceImage {
  isScraped?: boolean;
  dbId?: string;
}

interface ReferenceGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  references: ExtendedReferenceImage[];
  selectedReference?: string | null;
  selectedReferences?: string[]; // For multi-select mode
  onSelect: (referenceId: string) => void;
  onDelete?: (referenceId: string) => void; // For deleting scraped products
  multiSelect?: boolean;
}

export const ReferenceGalleryModal = ({ 
  isOpen, 
  onClose, 
  title,
  references,
  selectedReference, 
  selectedReferences = [],
  onSelect,
  onDelete,
  multiSelect = false
}: ReferenceGalleryModalProps) => {
  const handleSelect = (referenceId: string) => {
    onSelect(referenceId);
    // Only close on single select mode
    if (!multiSelect) {
      onClose();
    }
  };

  const isSelected = (refId: string) => {
    if (multiSelect) {
      return selectedReferences.includes(refId);
    }
    return selectedReference === refId;
  };

  // Separate scraped vs sample references for display
  const scrapedRefs = references.filter(r => (r as ExtendedReferenceImage).isScraped);
  const sampleRefs = references.filter(r => !(r as ExtendedReferenceImage).isScraped);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            {multiSelect && selectedReferences.length > 0 && (
              <span className="text-sm bg-accent/20 text-accent px-3 py-1 rounded-full">
                {selectedReferences.length} selected
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-6">
          {/* Scraped Products Section */}
          {scrapedRefs.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                From Bandolier
                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                  {scrapedRefs.length}
                </span>
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {scrapedRefs.map((ref) => (
                  <div key={ref.id} className="relative group">
                    <ReferenceThumbnail
                      reference={ref}
                      isSelected={isSelected(ref.id)}
                      onSelect={() => handleSelect(ref.id)}
                      showLabel={true}
                    />
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(ref.id);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample References Section */}
          {sampleRefs.length > 0 && (
            <div>
              {scrapedRefs.length > 0 && (
                <p className="text-sm font-medium text-foreground mb-3">Sample References</p>
              )}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {sampleRefs.map((ref) => (
                  <ReferenceThumbnail
                    key={ref.id}
                    reference={ref}
                    isSelected={isSelected(ref.id)}
                    onSelect={() => handleSelect(ref.id)}
                    showLabel={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Or upload your own</p>
            <button className="w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex flex-col items-center justify-center gap-2 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium text-foreground text-sm">Upload image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
            </button>
          </div>
        </div>

        {/* Done button for multi-select */}
        {multiSelect && (
          <div className="pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
