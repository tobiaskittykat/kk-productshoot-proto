import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, X, ArrowLeft, FolderOpen, Package, CheckCircle2, Loader2, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { UploadProgressView } from './UploadProgressView';
import { GroupReviewCard } from './GroupReviewCard';
import { UngroupedSection } from './UngroupedSection';
import { Badge } from '@/components/ui/badge';

interface SmartUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  url?: string;
  uploading?: boolean;
}

interface ProductGroup {
  id: string;
  suggestedName: string;
  suggestedSku: string;
  confidence: number;
  images: Array<{
    id: string;
    url: string;
    detectedAngle: string;
    angleConfidence: number;
  }>;
  productAnalysis: {
    summary: string;
    product_type: string;
    colors: string[];
    materials: string[];
    style_keywords: string[];
  };
}

interface UngroupedImage {
  id: string;
  url: string;
  reason: string;
}

interface BatchProduct {
  productName: string;
  color: string;
  model: string;
  imageCount: number;
  heroUrl: string | null;
  alreadyRegistered: boolean;
}

interface ImportBatch {
  batchId: string;
  brandId: string;
  products: BatchProduct[];
  totalImages: number;
  newProducts: number;
}

type Step = 'source' | 'upload' | 'batches' | 'analyzing' | 'review';

export function SmartUploadModal({ open, onOpenChange }: SmartUploadModalProps) {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('source');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [ungrouped, setUngrouped] = useState<UngroupedImage[]>([]);
  const [saving, setSaving] = useState(false);

  // Crawled batches state
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [crawledSource, setCrawledSource] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const newImages: UploadedImage[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 20));
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const uploadImages = async (): Promise<{ id: string; url: string }[]> => {
    const uploaded: { id: string; url: string }[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const fileName = `${user?.id}/${Date.now()}-${img.file.name}`;
      
      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, img.file);

      if (error) {
        console.error('Upload error:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      uploaded.push({ id: img.id, url: urlData.publicUrl });
      setUploadProgress(Math.round(((i + 1) / images.length) * 100));
    }

    return uploaded;
  };

  const startAnalysis = async () => {
    if (images.length === 0) return;

    setStep('analyzing');
    setUploadProgress(0);
    setAnalysisProgress(0);

    try {
      const uploadedImages = await uploadImages();
      
      if (uploadedImages.length === 0) {
        throw new Error('No images were uploaded successfully');
      }

      setAnalysisProgress(20);

      const { data, error } = await supabase.functions.invoke('analyze-bulk-products', {
        body: { images: uploadedImages }
      });

      if (error) throw error;

      setAnalysisProgress(100);

      const groupsWithIds = (data.groups || []).map((g: any) => ({
        ...g,
        id: crypto.randomUUID(),
      }));

      setGroups(groupsWithIds);
      setUngrouped(data.ungrouped || []);
      setStep('review');

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Could not analyze images',
        variant: 'destructive',
      });
      setStep('upload');
    }
  };

  // ── Crawled batches flow ──

  const loadBatches = async () => {
    setLoadingBatches(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-import-batches');
      if (error) throw error;
      setBatches(data.batches || []);
    } catch (error) {
      console.error('Failed to load batches:', error);
      toast({
        title: 'Could not load imports',
        description: error instanceof Error ? error.message : 'Failed to list import batches',
        variant: 'destructive',
      });
    } finally {
      setLoadingBatches(false);
    }
  };

  const selectBatch = async (batch: ImportBatch) => {
    setSelectedBatchId(batch.batchId);
    setCrawledSource(true);

    // Convert manifest products to ProductGroup[] format
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/product-images`;

    // We need to download the full manifest to get image paths
    try {
      const { data, error } = await supabase.functions.invoke('list-import-batches');
      if (error) throw error;

      // Download the manifest directly from storage
      const manifestPath = `imports/${batch.batchId}/manifest.json`;
      const { data: manifestFile, error: dlErr } = await supabase.storage
        .from('product-images')
        .download(manifestPath);

      if (dlErr || !manifestFile) throw new Error('Could not download manifest');

      const manifest = JSON.parse(await manifestFile.text());

      const convertedGroups: ProductGroup[] = (manifest.products || [])
        .filter((p: any) => {
          // Skip already-registered products
          const batchProduct = batch.products.find(
            bp => bp.productName === p.productName && bp.color === p.color
          );
          return batchProduct && !batchProduct.alreadyRegistered;
        })
        .map((p: any) => ({
          id: crypto.randomUUID(),
          suggestedName: `${p.productName} — ${p.color}`,
          suggestedSku: makeSkuCode(p.productName, p.color),
          confidence: 95,
          images: (p.images || []).filter((img: any) => {
            const angle = (img.angle || '').toLowerCase();
            return !['lifestyle', 'on-foot', 'on-model', 'on_foot', 'on_model'].includes(angle);
          }).map((img: any) => ({
            id: crypto.randomUUID(),
            url: `${storageBaseUrl}/imports/${batch.batchId}/${img.path}`,
            detectedAngle: img.angle || 'unknown',
            angleConfidence: 90,
            storagePath: `imports/${batch.batchId}/${img.path}`,
          })),
          productAnalysis: {
            summary: p.title || `${p.productName} in ${p.color}`,
            product_type: 'sandal',
            colors: [p.color],
            materials: [],
            style_keywords: [p.model],
          },
        }));

      setGroups(convertedGroups);
      setUngrouped([]);
      setStep('review');
    } catch (error) {
      console.error('Batch select error:', error);
      toast({
        title: 'Failed to load batch',
        description: error instanceof Error ? error.message : 'Could not parse manifest',
        variant: 'destructive',
      });
    }
  };

  function makeSkuCode(productName: string, color: string): string {
    const model = productName.split(' ').slice(0, 2).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const col = color.split(' ').slice(0, 2).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    return `BIRK-${model}-${col}`.slice(0, 40);
  }

  const handleChooseSource = (source: 'upload' | 'crawled') => {
    if (source === 'upload') {
      setCrawledSource(false);
      setStep('upload');
    } else {
      setStep('batches');
      loadBatches();
    }
  };

  const updateGroup = (groupId: string, updates: Partial<ProductGroup>) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ));
  };

  const moveToGroup = (imageId: string, fromGroupId: string | null, toGroupId: string) => {
    let imageData: ProductGroup['images'][0] | undefined;
    
    if (fromGroupId) {
      const fromGroup = groups.find(g => g.id === fromGroupId);
      imageData = fromGroup?.images.find(i => i.id === imageId);
      if (imageData) {
        setGroups(prev => prev.map(g => 
          g.id === fromGroupId 
            ? { ...g, images: g.images.filter(i => i.id !== imageId) }
            : g
        ));
      }
    } else {
      const ungroupedImg = ungrouped.find(u => u.id === imageId);
      if (ungroupedImg) {
        imageData = {
          id: ungroupedImg.id,
          url: ungroupedImg.url,
          detectedAngle: 'unknown',
          angleConfidence: 50,
        };
        setUngrouped(prev => prev.filter(u => u.id !== imageId));
      }
    }

    if (imageData) {
      setGroups(prev => prev.map(g =>
        g.id === toGroupId
          ? { ...g, images: [...g.images, imageData!] }
          : g
      ));
    }
  };

  const createGroupFromUngrouped = (imageIds: string[]) => {
    const imagesToGroup = ungrouped.filter(u => imageIds.includes(u.id));
    if (imagesToGroup.length === 0) return;

    const newGroup: ProductGroup = {
      id: crypto.randomUUID(),
      suggestedName: 'New Product',
      suggestedSku: 'NEW-PRODUCT-001',
      confidence: 50,
      images: imagesToGroup.map(u => ({
        id: u.id,
        url: u.url,
        detectedAngle: 'unknown',
        angleConfidence: 50,
      })),
      productAnalysis: {
        summary: '',
        product_type: '',
        colors: [],
        materials: [],
        style_keywords: [],
      },
    };

    setGroups(prev => [...prev, newGroup]);
    setUngrouped(prev => prev.filter(u => !imageIds.includes(u.id)));
  };

  const saveAllSKUs = async () => {
    if (!user?.id) return;
    setSaving(true);

    try {
      for (const group of groups) {
        if (group.images.length === 0) continue;

        const { data: sku, error: skuError } = await supabase
          .from('product_skus')
          .insert({
            user_id: user.id,
            brand_id: currentBrand?.id || null,
            name: group.suggestedName,
            sku_code: group.suggestedSku,
            description: group.productAnalysis,
          })
          .select()
          .single();

        if (skuError) throw skuError;

        for (const img of group.images) {
          const imgAny = img as any;
          await supabase.from('scraped_products').insert({
            user_id: user.id,
            brand_id: currentBrand?.id || null,
            sku_id: sku.id,
            name: group.suggestedName,
            external_id: img.id,
            thumbnail_url: img.url,
            full_url: img.url,
            angle: img.detectedAngle,
            description: group.productAnalysis,
            storage_path: imgAny.storagePath || null,
          });
        }

        // Background tasks
        try {
          supabase.functions.invoke('composite-product-images', {
            body: {
              skuId: sku.id,
              imageUrls: group.images.map(i => i.url),
              layout: group.images.length <= 4 ? '2x2' : '1x4',
            }
          });
          
          supabase.functions.invoke('analyze-shoe-components', {
            body: { skuId: sku.id }
          });
        } catch (e) {
          console.warn('Background tasks failed:', e);
        }
      }

      toast({
        title: 'Products saved!',
        description: `Created ${groups.length} product SKU${groups.length !== 1 ? 's' : ''} with ${groups.reduce((sum, g) => sum + g.images.length, 0)} images`,
      });

      queryClient.invalidateQueries({ queryKey: ['product-skus'] });
      queryClient.invalidateQueries({ queryKey: ['products-page-skus'] });
      onOpenChange(false);
      resetState();

    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Could not save products',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetState = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setGroups([]);
    setUngrouped([]);
    setBatches([]);
    setSelectedBatchId(null);
    setCrawledSource(false);
    setStep('source');
    setUploadProgress(0);
    setAnalysisProgress(0);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const goBack = () => {
    if (step === 'upload' || step === 'batches') setStep('source');
    else if (step === 'review' && crawledSource) setStep('batches');
    else if (step === 'review') setStep('upload');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Smart Product Upload
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* ── Step: Choose Source ── */}
          {step === 'source' && (
            <div className="grid grid-cols-2 gap-4 py-8 px-4">
              <button
                onClick={() => handleChooseSource('upload')}
                className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-accent/50 hover:bg-accent/5 transition-all group"
              >
                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="text-lg font-medium">Upload New</span>
                <span className="text-sm text-muted-foreground text-center">
                  Drag & drop or browse for product photos
                </span>
              </button>

              <button
                onClick={() => handleChooseSource('crawled')}
                className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-accent/50 hover:bg-accent/5 transition-all group"
              >
                <FolderOpen className="w-10 h-10 text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="text-lg font-medium">From Crawled Images</span>
                <span className="text-sm text-muted-foreground text-center">
                  Import products from your crawler batches
                </span>
              </button>
            </div>
          )}

          {/* ── Step: Upload (existing flow) ── */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('smart-upload-input')?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Drag & drop product photos here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse (max 20 images)
                </p>
                <input
                  id="smart-upload-input"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {images.length} image{images.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setImages([])}>
                      Clear all
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {images.map(img => (
                      <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                        <img
                          src={img.preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={startAnalysis}
                  disabled={images.length === 0}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Start AI Sorting
                </Button>
              </div>
            </div>
          )}

          {/* ── Step: Browse Crawled Batches ── */}
          {step === 'batches' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <span className="text-sm text-muted-foreground">
                  Select a crawler batch to import
                </span>
              </div>

              {loadingBatches && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading import batches…</span>
                </div>
              )}

              {!loadingBatches && batches.length === 0 && (
                <div className="text-center py-16">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No import batches found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Run your crawler first to upload product images
                  </p>
                </div>
              )}

              {!loadingBatches && batches.map(batch => (
                <button
                  key={batch.batchId}
                  onClick={() => selectBatch(batch)}
                  disabled={batch.newProducts === 0}
                  className="w-full text-left rounded-xl border border-border p-4 hover:border-accent/50 hover:bg-accent/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{batch.batchId}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {batch.totalImages} images · {batch.products.length} product{batch.products.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      {batch.newProducts > 0 ? (
                        <Badge variant="secondary">
                          {batch.newProducts} new
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          All registered
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Product thumbnails */}
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {batch.products.slice(0, 6).map((product, idx) => (
                      <div key={idx} className="flex-shrink-0 w-16">
                        {product.heroUrl ? (
                          <img
                            src={product.heroUrl}
                            alt={product.productName}
                            className={`w-16 h-16 rounded-lg object-cover border border-border ${product.alreadyRegistered ? 'opacity-40' : ''}`}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">{product.color}</p>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Step: Analyzing ── */}
          {step === 'analyzing' && (
            <UploadProgressView
              uploadProgress={uploadProgress}
              analysisProgress={analysisProgress}
              imageCount={images.length}
            />
          )}

          {/* ── Step: Review ── */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <span className="text-sm text-muted-foreground">
                  {crawledSource ? 'Imported' : 'AI found'} {groups.length} product{groups.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4">
                {groups.map(group => (
                  <GroupReviewCard
                    key={group.id}
                    group={group}
                    allGroups={groups}
                    onUpdate={(updates) => updateGroup(group.id, updates)}
                    onMoveImage={(imageId, toGroupId) => moveToGroup(imageId, group.id, toGroupId)}
                    onDeleteImage={(imageId) => {
                      setGroups(prev => prev
                        .map(g => g.id === group.id
                          ? { ...g, images: g.images.filter(img => img.id !== imageId) }
                          : g
                        )
                        .filter(g => g.images.length > 0)
                      );
                    }}
                  />
                ))}
              </div>

              {ungrouped.length > 0 && (
                <UngroupedSection
                  images={ungrouped}
                  groups={groups}
                  onCreateGroup={createGroupFromUngrouped}
                  onMoveToGroup={(imageId, groupId) => moveToGroup(imageId, null, groupId)}
                />
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={saveAllSKUs}
                  disabled={saving || groups.length === 0}
                  className="gap-2"
                >
                  {saving ? 'Saving...' : `Save ${groups.length} Product${groups.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
