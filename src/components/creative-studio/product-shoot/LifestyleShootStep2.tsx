import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, ChevronRight, Package, Camera, Palette, Settings2, FileText, Clock, Check, Expand, Upload, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useShoeComponents, useComponentOverrides } from "@/hooks/useShoeComponents";
import { parseSkuDisplayInfo, formatSkuAttributes } from "@/lib/skuDisplayUtils";
import { ProductSKU } from "./ProductSKUPicker";
import { ProductPickerModal } from "./ProductPickerModal";
import { SmartUploadModal } from "./SmartUploadModal";
import { ShoeComponentsPanel } from "./ShoeComponentsPanel";
import { ProductAnglePreview } from "./ProductAnglePreview";
import { LifestyleShootTypeSelector } from "./LifestyleShootTypeSelector";
import { LifestyleAdvancedPanel } from "./LifestyleAdvancedPanel";
import {
  ProductShootState,
  LifestyleShootConfig,
  LifestyleShootShotType,
  LifestyleAdvancedSettings,
  initialLifestyleAdvancedSettings,
  initialLifestyleShootConfig,
} from "./types";
import { aspectRatios, resolutions } from "../types";
import { MoodboardModal } from "../MoodboardModal";
import { useToast } from "@/hooks/use-toast";

interface LifestyleShootStep2Props {
  state: ProductShootState;
  onStateChange: (updates: Partial<ProductShootState>) => void;
  imageCount: number;
  resolution: string;
  aspectRatio: string;
  sequentialGeneration: boolean;
  onOutputSettingsChange: (updates: {
    imageCount?: number;
    resolution?: string;
    aspectRatio?: string;
    sequentialGeneration?: boolean;
  }) => void;
}

export const LifestyleShootStep2 = ({
  state,
  onStateChange,
  imageCount,
  resolution,
  aspectRatio,
  sequentialGeneration,
  onOutputSettingsChange,
}: LifestyleShootStep2Props) => {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const config = state.lifestyleShootConfig || initialLifestyleShootConfig;
  
  const updateConfig = (updates: Partial<LifestyleShootConfig>) => {
    onStateChange({
      lifestyleShootConfig: { ...config, ...updates },
    });
  };

  const [openSections, setOpenSections] = useState({
    moodboard: true,
    product: true,
    brief: false,
    shotType: true,
    advanced: false,
    output: true,
  });

  const [showProductPickerModal, setShowProductPickerModal] = useState(false);
  const [showSmartUploadModal, setShowSmartUploadModal] = useState(false);
  const [selectedSku, setSelectedSku] = useState<ProductSKU | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [displayedSkuIds, setDisplayedSkuIds] = useState<string[]>([]);
  const [skuCache, setSkuCache] = useState<Map<string, ProductSKU>>(new Map());
  const [activeAngleUrls, setActiveAngleUrls] = useState<Record<string, { thumbnail: string; full: string }>>({});
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; skuName: string } | null>(null);
  const [attachReferenceImages, setAttachReferenceImages] = useState(state.attachReferenceImages ?? true);
  const [showMoodboardModal, setShowMoodboardModal] = useState(false);
  const [moodboardModalTab, setMoodboardModalTab] = useState("browse");

  // Shoe component hooks
  const { components, isLoading: isLoadingComponents, isAnalyzing, triggerAnalysis } = useShoeComponents({ skuId: state.selectedProductId });
  const { overrides, setComponentOverride, resetOverrides, hasOverrides } = useComponentOverrides(components);

  useEffect(() => {
    onStateChange({ componentOverrides: hasOverrides ? overrides : undefined });
  }, [overrides, hasOverrides]);

  useEffect(() => {
    onStateChange({ attachReferenceImages });
  }, [attachReferenceImages]);

  // Fetch moodboards
  const { data: moodboards = [] } = useQuery({
    queryKey: ['moodboards-lifestyle', user?.id, currentBrand?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = supabase
        .from('custom_moodboards')
        .select('id, name, description, thumbnail_url, visual_analysis')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }
      const { data } = await query;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch recent SKUs
  const { data: recentSkus = [] } = useQuery({
    queryKey: ['recent-skus-lifestyle', user?.id, currentBrand?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = supabase
        .from('product_skus')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(3);
      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }
      const { data: skus } = await query;
      if (!skus?.length) return [];
      return Promise.all(skus.map(async (sku) => {
        if (sku.composite_image_url) return { ...sku, display_image_url: sku.composite_image_url };
        const { data: angles } = await supabase.from('scraped_products').select('thumbnail_url').eq('sku_id', sku.id).limit(1);
        return { ...sku, display_image_url: angles?.[0]?.thumbnail_url || null };
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch selected SKU
  const { data: fetchedSku } = useQuery({
    queryKey: ['selected-sku-lifestyle', state.selectedProductId],
    queryFn: async () => {
      if (!state.selectedProductId || !user?.id) return null;
      const { data: sku } = await supabase.from('product_skus').select('*').eq('id', state.selectedProductId).maybeSingle();
      if (!sku) return null;
      const { data: angles } = await supabase.from('scraped_products').select('id, thumbnail_url, angle').eq('sku_id', sku.id);
      return { id: sku.id, name: sku.name, sku_code: sku.sku_code, composite_image_url: sku.composite_image_url, brand_id: sku.brand_id, last_used_at: sku.last_used_at, angles: (angles || []).map(a => ({ id: a.id, thumbnail_url: a.thumbnail_url, angle: a.angle })) } as ProductSKU;
    },
    enabled: !!state.selectedProductId && !selectedSku && !!user?.id,
  });

  useEffect(() => { if (fetchedSku && !selectedSku) setSelectedSku(fetchedSku); }, [fetchedSku, selectedSku]);
  useEffect(() => { if (displayedSkuIds.length === 0 && recentSkus.length > 0) setDisplayedSkuIds(recentSkus.slice(0, 3).map(s => s.id)); }, [recentSkus, displayedSkuIds.length]);
  useEffect(() => {
    if (!hasAutoSelected && recentSkus.length > 0 && !state.selectedProductId) {
      const mostRecent = recentSkus[0];
      handleSkuSelect({ id: mostRecent.id, name: mostRecent.name, sku_code: mostRecent.sku_code, composite_image_url: mostRecent.composite_image_url, brand_id: mostRecent.brand_id, last_used_at: mostRecent.last_used_at, angles: [] }, false);
      setHasAutoSelected(true);
    }
  }, [recentSkus, state.selectedProductId, hasAutoSelected]);

  const displayedProducts = useMemo(() => {
    if (displayedSkuIds.length === 0) return recentSkus.slice(0, 3);
    return displayedSkuIds.map(id => recentSkus.find(s => s.id === id) || (skuCache.has(id) ? { ...skuCache.get(id)!, display_image_url: skuCache.get(id)!.composite_image_url } : null)).filter(Boolean) as typeof recentSkus;
  }, [displayedSkuIds, recentSkus, skuCache]);

  const handleSkuSelect = (sku: ProductSKU, fromModal = false) => {
    setSelectedSku(sku);
    onStateChange({ selectedProductId: sku.id, recoloredProductUrl: sku.composite_image_url || sku.angles[0]?.thumbnail_url });
    if (fromModal) {
      setSkuCache(prev => { const next = new Map(prev); next.set(sku.id, sku); return next; });
      setDisplayedSkuIds(prev => [sku.id, ...prev.filter(id => id !== sku.id)].slice(0, 3));
    }
  };

  const toggleSection = (s: keyof typeof openSections) => setOpenSections(prev => ({ ...prev, [s]: !prev[s] }));

  const handleDeleteMoodboard = useCallback(async (mb: typeof moodboards[0]) => {
    try {
      await supabase.storage.from('moodboards').remove([mb.id ? `${user?.id}/${mb.id}` : ''].filter(Boolean));
      // The query fetches file_path from custom_moodboards but we only have id/name/thumbnail here
      // So fetch the record first to get file_path
      const { data: record } = await supabase.from('custom_moodboards').select('file_path').eq('id', mb.id).maybeSingle();
      if (record?.file_path) {
        await supabase.storage.from('moodboards').remove([record.file_path]);
      }
      await supabase.from('custom_moodboards').delete().eq('id', mb.id);
      queryClient.invalidateQueries({ queryKey: ['moodboards-lifestyle'] });
      queryClient.invalidateQueries({ queryKey: ['custom-moodboards'] });
      if (config.selectedMoodboardId === mb.id) {
        updateConfig({ selectedMoodboardId: undefined });
      }
      toast({ title: 'Moodboard deleted' });
    } catch (err) {
      console.error('Delete moodboard error:', err);
      toast({ title: 'Failed to delete moodboard', variant: 'destructive' });
    }
  }, [user?.id, queryClient, toast, config.selectedMoodboardId]);

  const selectedMoodboard = moodboards.find(m => m.id === config.selectedMoodboardId);
  const currentProductImage = state.recoloredProductUrl || selectedSku?.composite_image_url || selectedSku?.angles?.[0]?.thumbnail_url;

  const SectionHeader = ({ icon: Icon, title, section, badge }: { icon: typeof Camera; title: string; section: keyof typeof openSections; badge?: string }) => (
    <CollapsibleTrigger
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-4 hover:bg-muted/50 rounded-xl transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        <span className="font-medium text-foreground">{title}</span>
        {badge && <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{badge}</span>}
      </div>
      {openSections[section] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </CollapsibleTrigger>
  );

  return (
    <div className="space-y-4 mt-8">
      {/* 1. Moodboard Selection */}
      <Collapsible open={openSections.moodboard}>
        <div id="section-ls-moodboard" className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader icon={Palette} title="Moodboard" section="moodboard" badge={selectedMoodboard?.name} />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {moodboards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No moodboards yet. Upload one below or browse the gallery.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {moodboards.map(mb => {
                    const isSelected = config.selectedMoodboardId === mb.id;
                    return (
                      <div key={mb.id} className="group relative">
                        <button
                          onClick={() => updateConfig({ selectedMoodboardId: isSelected ? undefined : mb.id })}
                          className={cn(
                            "relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all",
                            isSelected ? "border-accent ring-2 ring-accent/30" : "border-transparent hover:border-muted-foreground/30"
                          )}
                        >
                          <img src={mb.thumbnail_url} alt={mb.name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                              <Check className="w-3 h-3 text-accent-foreground" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                            <span className="text-xs text-white font-medium line-clamp-1">{mb.name}</span>
                          </div>
                        </button>
                        {/* Delete overlay */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteMoodboard(mb); }}
                          className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive z-20"
                          title="Delete moodboard"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload + Browse row */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => { setMoodboardModalTab("upload"); setShowMoodboardModal(true); }}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
                <span className="text-muted-foreground/40">·</span>
                <button
                  onClick={() => { setMoodboardModalTab("browse"); setShowMoodboardModal(true); }}
                  className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  Browse all moodboards
                </button>
              </div>

              {/* Show selected moodboard analysis preview */}
              {selectedMoodboard?.visual_analysis && (
                <div className="mt-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Style DNA: </span>
                  {(selectedMoodboard.visual_analysis as any)?.overallLookAndFeel?.slice(0, 200) 
                    || (selectedMoodboard.visual_analysis as any)?.emotional_tone
                    || selectedMoodboard.description
                    || 'Analysis available'}
                  {((selectedMoodboard.visual_analysis as any)?.overallLookAndFeel?.length || 0) > 200 && '…'}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* 2. Product Selection */}
      <Collapsible open={openSections.product}>
        <div id="section-ls-product" className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader icon={Package} title="Product" section="product" badge={selectedSku?.name} />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {displayedProducts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Your Products
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {displayedProducts.map(sku => {
                      const isSelected = state.selectedProductId === sku.id;
                      const imageUrl = (sku as any).display_image_url || sku.composite_image_url;
                      return (
                        <button
                          key={sku.id}
                          onClick={() => handleSkuSelect({ id: sku.id, name: sku.name, sku_code: sku.sku_code, composite_image_url: sku.composite_image_url, brand_id: sku.brand_id, last_used_at: sku.last_used_at, angles: [] }, false)}
                          className={cn(
                            "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                            isSelected ? "border-accent ring-2 ring-accent/30" : "border-transparent hover:border-muted-foreground/30"
                          )}
                        >
                          {imageUrl ? (
                            <img src={imageUrl} alt={sku.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground" /></div>
                          )}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                              <Check className="w-3 h-3 text-accent-foreground" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-5">
                            <span className="text-[10px] text-white line-clamp-1">{sku.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowProductPickerModal(true)}
                className="w-full py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
              >
                Browse More Products…
              </button>

              {/* Component Overrides */}
              {state.selectedProductId && components && (
                <ShoeComponentsPanel
                  components={components}
                  overrides={overrides}
                  onOverrideChange={setComponentOverride}
                  onResetAll={resetOverrides}
                  attachReferenceImages={attachReferenceImages}
                  onAttachReferenceImagesChange={setAttachReferenceImages}
                  isAnalyzing={isAnalyzing}
                  onTriggerAnalysis={() => triggerAnalysis()}
                />
              )}

              {/* Reference images toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Attach product reference images</span>
                <Switch checked={attachReferenceImages} onCheckedChange={setAttachReferenceImages} />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* 3. Creative Brief */}
      <Collapsible open={openSections.brief}>
        <div id="section-ls-brief" className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader icon={FileText} title="Creative Brief" section="brief" badge={config.creativeBrief ? 'Added' : undefined} />
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <Textarea
                placeholder="Describe your vision… e.g., 'Relaxed Sunday morning, coffee shop terrace, warm Mediterranean light'"
                value={config.creativeBrief || ''}
                onChange={(e) => updateConfig({ creativeBrief: e.target.value })}
                className="min-h-[80px] resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1.5">Optional — adds creative direction on top of the moodboard aesthetic.</p>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* 4. Shot Type */}
      <Collapsible open={openSections.shotType}>
        <div id="section-ls-shottype" className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader icon={Camera} title="Shot Type" section="shotType" />
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <LifestyleShootTypeSelector
                selectedType={config.lifestyleShotType}
                onSelect={(type) => updateConfig({ lifestyleShotType: type })}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* 5. Advanced Settings */}
      <Collapsible open={openSections.advanced}>
        <div id="section-ls-advanced" className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader icon={Settings2} title="Advanced Settings" section="advanced" />
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <LifestyleAdvancedPanel
                settings={config.advancedSettings}
                onChange={(advancedSettings) => updateConfig({ advancedSettings })}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* 6. Output Settings */}
      <Collapsible open={openSections.output}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader icon={Settings2} title="Output" section="output" />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Images</label>
                  <Select value={String(imageCount)} onValueChange={(v) => onOutputSettingsChange({ imageCount: Number(v) })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 6, 8].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Aspect Ratio</label>
                  <Select value={aspectRatio} onValueChange={(v) => onOutputSettingsChange({ aspectRatio: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map(a => <SelectItem key={a} value={a}>{a === 'auto' ? 'Auto' : a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Resolution</label>
                  <Select value={resolution} onValueChange={(v) => onOutputSettingsChange({ resolution: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {resolutions.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Generate each image independently (more variety)</span>
                <Switch checked={sequentialGeneration} onCheckedChange={(v) => onOutputSettingsChange({ sequentialGeneration: v })} />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Modals */}
      <ProductPickerModal
        open={showProductPickerModal}
        onOpenChange={setShowProductPickerModal}
        selectedSkuId={state.selectedProductId || null}
        onSelectSku={(sku) => { handleSkuSelect(sku, true); setShowProductPickerModal(false); }}
        onCreateNew={() => { setShowProductPickerModal(false); }}
        onSmartUpload={() => { setShowProductPickerModal(false); setShowSmartUploadModal(true); }}
      />
      <SmartUploadModal open={showSmartUploadModal} onOpenChange={setShowSmartUploadModal} />
      <MoodboardModal
        isOpen={showMoodboardModal}
        onClose={() => {
          setShowMoodboardModal(false);
          queryClient.invalidateQueries({ queryKey: ['moodboards-lifestyle'] });
        }}
        selectedMoodboard={config.selectedMoodboardId || null}
        onSelect={(moodboardId) => {
          // Extract raw ID if it has custom- prefix (from MoodboardModal transform)
          const rawId = moodboardId.replace(/^custom-/, '');
          updateConfig({ selectedMoodboardId: rawId });
        }}
        initialTab={moodboardModalTab}
      />

      {/* Fullscreen image dialog */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>{fullscreenImage?.skuName}</DialogTitle>
            <DialogDescription>Product image preview</DialogDescription>
          </DialogHeader>
          {fullscreenImage && <img src={fullscreenImage.url} alt={fullscreenImage.skuName} className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};
