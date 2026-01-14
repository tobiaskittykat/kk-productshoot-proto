import { useState } from 'react';
import { 
  X, 
  Download, 
  RefreshCw, 
  Pencil, 
  Trash2, 
  Copy, 
  Check,
  Image as ImageIcon,
  MapPin,
  Palette,
  Lightbulb,
  Camera,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GeneratedImage, sampleProductReferences, sampleContextReferences, sampleMoodboards, artisticStyles, lightingStyles, cameraAngles } from './types';
import { cn } from '@/lib/utils';

interface ImageDetailModalProps {
  image: GeneratedImage | null;
  isOpen: boolean;
  onClose: () => void;
  onVariation: (image: GeneratedImage) => void;
  onEdit: (image: GeneratedImage) => void;
  onDelete: (image: GeneratedImage) => void;
}

export const ImageDetailModal = ({
  image,
  isOpen,
  onClose,
  onVariation,
  onEdit,
  onDelete,
}: ImageDetailModalProps) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!image) return null;

  const handleDownload = async () => {
    if (!image.imageUrl) return;
    
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleCopyPrompt = async () => {
    const textToCopy = image.refinedPrompt || image.prompt;
    await navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleAction = (action: 'variation' | 'edit' | 'delete') => {
    onClose();
    setTimeout(() => {
      if (action === 'variation') onVariation(image);
      else if (action === 'edit') onEdit(image);
      else if (action === 'delete') onDelete(image);
    }, 150);
  };

  // Find reference images by URL
  const productRef = image.productReferenceUrl 
    ? sampleProductReferences.find(r => r.url === image.productReferenceUrl)
    : null;
  const contextRef = image.contextReferenceUrl 
    ? sampleContextReferences.find(r => r.url === image.contextReferenceUrl)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-background">
        <div className="flex h-full">
          {/* Left Side - Image */}
          <div className="flex-1 bg-secondary/30 flex items-center justify-center p-6 relative">
            <img
              src={image.imageUrl}
              alt={image.prompt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Details */}
          <div className="w-[380px] border-l border-border flex flex-col">
            {/* Header with actions */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Image Details</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDownload}
                    className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction('variation')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Create Variation
                </button>
                <button
                  onClick={() => handleAction('edit')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-medium transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Image
                </button>
                <button
                  onClick={() => handleAction('delete')}
                  className="w-9 h-9 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Prompt Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    Prompt
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm bg-secondary/50 rounded-lg p-3 border border-border">
                  {image.prompt}
                </p>
                
                {image.refinedPrompt && image.refinedPrompt !== image.prompt && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Refined prompt:</p>
                    <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-2 border border-border">
                      {image.refinedPrompt}
                    </p>
                  </div>
                )}
              </div>

              {/* Reference Images */}
              {(productRef || contextRef || image.productReferenceUrl || image.contextReferenceUrl) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ImageIcon className="w-4 h-4" />
                    Reference Images
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Product Reference */}
                    {(productRef || image.productReferenceUrl) && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">Product</p>
                        <div className="aspect-square rounded-lg overflow-hidden border border-border">
                          <img
                            src={productRef?.thumbnail || image.productReferenceUrl}
                            alt={productRef?.name || 'Product reference'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {productRef && (
                          <p className="text-xs text-muted-foreground truncate">{productRef.name}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Context Reference */}
                    {(contextRef || image.contextReferenceUrl) && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">Context</p>
                        <div className="aspect-square rounded-lg overflow-hidden border border-border">
                          <img
                            src={contextRef?.thumbnail || image.contextReferenceUrl}
                            alt={contextRef?.name || 'Context reference'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {contextRef && (
                          <p className="text-xs text-muted-foreground truncate">{contextRef.name}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Generation Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Palette className="w-4 h-4" />
                  Generation Info
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Status</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      image.status === 'completed' && "bg-green-500/10 text-green-600",
                      image.status === 'failed' && "bg-destructive/10 text-destructive",
                      image.status === 'pending' && "bg-secondary text-muted-foreground"
                    )}>
                      {image.status === 'completed' ? 'Completed' : image.status === 'failed' ? 'Failed' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Image ID</span>
                    <span className="font-mono text-xs text-muted-foreground">{image.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};