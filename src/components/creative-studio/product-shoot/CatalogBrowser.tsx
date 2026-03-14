import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Search, Download, Package, Loader2, X, Eye, EyeOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import catalogData from '@/data/birkenstock-catalog.json';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface CatalogProduct {
  model: string;
  productName: string;
  color: string;
  title?: string;
  sourceUrl?: string;
  imageUrls: string[];
  extractedAt?: string;
}

// Lifestyle URL patterns to filter out
const LIFESTYLE_PATTERNS = [/_f_look_f/i, /_f_closeup_f/i, /_m_look_m/i, /_m_closeup_m/i];

function isLifestyleUrl(url: string): boolean {
  return LIFESTYLE_PATTERNS.some(p => p.test(url));
}

function getHeroUrl(imageUrls: string[]): string | null {
  const product = imageUrls.find(u => !isLifestyleUrl(u));
  return product || null;
}

function getProductImageCount(imageUrls: string[]): number {
  return imageUrls.filter(u => !isLifestyleUrl(u)).length;
}

function makeSkuCode(productName: string, color: string): string {
  const model = productName.split(' ').slice(0, 2).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const col = color.split(' ').join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return `BIRK-${model}-${col}`.slice(0, 40);
}

// Color family synonym map for semantic search
const COLOR_FAMILIES: Record<string, string[]> = {
  red: ['red', 'crimson', 'burgundy', 'cherry', 'scarlet', 'ruby', 'wine', 'garnet', 'brick', 'maroon', 'claret', 'bordeaux'],
  pink: ['pink', 'rose', 'blush', 'fuchsia', 'magenta', 'coral', 'salmon', 'fondant'],
  blue: ['blue', 'navy', 'cobalt', 'azure', 'indigo', 'sky', 'denim', 'teal', 'sapphire', 'midnight', 'dusty'],
  green: ['green', 'olive', 'sage', 'forest', 'emerald', 'mint', 'thyme', 'khaki', 'moss', 'jade', 'lime', 'eucalyptus', 'matcha'],
  brown: ['brown', 'tan', 'cognac', 'tobacco', 'mocha', 'chocolate', 'espresso', 'habana', 'sienna', 'cork', 'camel', 'mocca', 'nut', 'ginger', 'cinnamon'],
  black: ['black', 'onyx', 'anthracite', 'charcoal', 'jet', 'ebony'],
  white: ['white', 'cream', 'ivory', 'pearl', 'bone', 'snow', 'alabaster'],
  gray: ['gray', 'grey', 'silver', 'stone', 'slate', 'ash', 'pewter', 'mink', 'basalt', 'graphite', 'iron'],
  yellow: ['yellow', 'gold', 'mustard', 'honey', 'amber', 'lemon', 'saffron'],
  orange: ['orange', 'tangerine', 'apricot', 'copper', 'peach', 'rust'],
  purple: ['purple', 'violet', 'plum', 'lavender', 'lilac', 'mauve', 'port', 'eggplant'],
  beige: ['beige', 'sand', 'taupe', 'nude', 'oat', 'latte', 'biscuit', 'desert', 'linen', 'chai', 'wheat', 'parchment'],
};

/** Check if a token matches in haystack, expanding color synonyms (prefix-aware) */
function tokenMatchesHaystack(token: string, haystack: string): boolean {
  const words = haystack.split(/\s+/);
  // Direct prefix match on any word
  if (words.some(w => w.startsWith(token))) return true;
  // Check if token is a prefix of any color family key or synonym
  for (const [key, family] of Object.entries(COLOR_FAMILIES)) {
    const allTerms = [key, ...family];
    // Does the token prefix-match any term in this family?
    if (allTerms.some(term => term.startsWith(token))) {
      // Yes — check if any synonym from this family appears as a word-prefix in haystack
      return allTerms.some(syn => words.some(w => w.startsWith(syn)));
    }
  }
  return false;
}

interface CatalogBrowserProps {
  onBack: () => void;
  onDone: () => void;
  hideBack?: boolean;
}

export function CatalogBrowser({ onBack, onDone, hideBack }: CatalogBrowserProps) {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const queryClient = useQueryClient();
  const products: CatalogProduct[] = (catalogData as any).products || [];

  const [search, setSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number; currentName: string }>({ current: 0, total: 0, currentName: '' });
  const [showHidden, setShowHidden] = useState(false);

  // Hidden products stored in localStorage
  const HIDDEN_KEY = 'catalog-hidden-products';
  const [hiddenProducts, setHiddenProducts] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(HIDDEN_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const toggleHidden = (productKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenProducts(prev => {
      const next = new Set(prev);
      if (next.has(productKey)) next.delete(productKey);
      else next.add(productKey);
      localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const makeProductKey = (p: CatalogProduct) => `${p.productName}::${p.color}`;

  // Get existing SKU codes to mark already-registered
  const { data: existingSkus } = useQuery({
    queryKey: ['product-skus-codes', currentBrand?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('product_skus')
        .select('sku_code')
        .eq('user_id', user.id);
      return (data || []).map(s => s.sku_code);
    },
    enabled: !!user?.id,
  });

  const existingSet = useMemo(() => new Set(existingSkus || []), [existingSkus]);

  // Extract unique models
  const models = useMemo(() => {
    const m = new Set(products.map(p => p.model));
    return Array.from(m).sort();
  }, [products]);

  // Available products (excluding hidden unless showHidden)
  const visibleProducts = useMemo(() => {
    if (showHidden) return products;
    return products.filter(p => !hiddenProducts.has(makeProductKey(p)));
  }, [products, hiddenProducts, showHidden]);

  // Filter products
  const filtered = useMemo(() => {
    let result = visibleProducts;
    if (selectedModel) {
      result = result.filter(p => p.model === selectedModel);
    }
    if (search.trim()) {
      const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
      result = result.filter(p => {
        const haystack = `${p.productName} ${p.color} ${p.model}`.toLowerCase();
        return tokens.every(t => tokenMatchesHaystack(t, haystack));
      });
    }
    return result.map((p) => {
      const idx = products.indexOf(p);
      return { ...p, _idx: idx };
    });
  }, [visibleProducts, products, search, selectedModel]);

  const toggleSelect = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const importSelected = async () => {
    if (!user?.id || !currentBrand?.id) return;
    setImporting(true);

    const toImport = Array.from(selected).map(idx => products[idx]).filter(Boolean);
    setImportProgress({ current: 0, total: toImport.length, currentName: '' });

    // Process in batches of 5 (edge function limit is 20)
    const BATCH_SIZE = 5;
    let totalUploaded = 0;

    try {
      // Get user session for apiKey
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
        const batch = toImport.slice(i, i + BATCH_SIZE);
        setImportProgress({
          current: i,
          total: toImport.length,
          currentName: batch[0]?.productName || '',
        });

        const batchPayload = batch.map(p => ({
          model: p.model,
          productName: p.productName,
          color: p.color,
          title: p.title,
          sourceUrl: p.sourceUrl,
          imageUrls: p.imageUrls.filter(u => !isLifestyleUrl(u)),
          extractedAt: p.extractedAt,
        }));

        const { data, error } = await supabase.functions.invoke('bulk-import-products', {
          body: {
            apiKey: session.access_token,
            brandId: currentBrand.id,
            products: batchPayload,
          },
        });

        if (error) {
          console.error('Batch import error:', error);
          toast({
            title: 'Import error',
            description: `Failed batch starting with ${batch[0]?.productName}`,
            variant: 'destructive',
          });
        } else {
          totalUploaded += data?.summary?.imagesUploaded || 0;

          // Fire-and-forget: trigger AI analysis + composite for each imported SKU
          const details = data?.details || [];
          for (const detail of details) {
            if (detail.skuId) {
              supabase.functions.invoke('analyze-shoe-components', {
                body: { skuId: detail.skuId },
              });
              supabase.functions.invoke('composite-product-images', {
                body: { skuId: detail.skuId, imageUrls: [], layout: '2x2' },
              });
            }
          }
        }
      }

      setImportProgress({ current: toImport.length, total: toImport.length, currentName: 'Done!' });

      toast({
        title: 'Import complete!',
        description: `Imported ${toImport.length} products with ${totalUploaded} images`,
      });

      queryClient.invalidateQueries({ queryKey: ['product-skus'] });
      queryClient.invalidateQueries({ queryKey: ['products-page-skus'] });
      queryClient.invalidateQueries({ queryKey: ['product-skus-codes'] });

      setTimeout(() => {
        setImporting(false);
        setSelected(new Set());
        onDone();
      }, 1500);

    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Could not import products',
        variant: 'destructive',
      });
      setImporting(false);
    }
  };

  if (importing) {
    const pct = importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Importing products…</p>
          <p className="text-sm text-muted-foreground">{importProgress.currentName}</p>
          <p className="text-xs text-muted-foreground">
            {importProgress.current} / {importProgress.total} products
          </p>
        </div>
        <Progress value={pct} className="w-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!hideBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {filtered.length === visibleProducts.length
              ? `${visibleProducts.length} products`
              : `${filtered.length} of ${visibleProducts.length} products`}
            {hiddenProducts.size > 0 && ` · ${hiddenProducts.size} hidden`}
          </span>
          {hiddenProducts.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHidden(prev => !prev)}
              className="text-xs h-7 px-2"
            >
              {showHidden ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
              {showHidden ? 'Hide removed' : 'Show removed'}
            </Button>
          )}
        </div>
        {selected.size > 0 && (
          <Button onClick={importSelected} className="gap-2">
            <Download className="w-4 h-4" />
            Import {selected.size} Product{selected.size !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by model, color, material…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Model filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={selectedModel === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedModel(null)}
        >
          All
        </Badge>
        {models.map(m => (
          <Badge
            key={m}
            variant={selectedModel === m ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedModel(prev => prev === m ? null : m)}
          >
            {m}
          </Badge>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
        {filtered.map((product) => {
          const heroUrl = getHeroUrl(product.imageUrls);
          const imgCount = getProductImageCount(product.imageUrls);
          const skuCode = makeSkuCode(product.productName, product.color);
          const alreadyRegistered = existingSet.has(skuCode);
          const isSelected = selected.has(product._idx);

          return (
            <button
              key={product._idx}
              onClick={() => !alreadyRegistered && toggleSelect(product._idx)}
              disabled={alreadyRegistered}
              className={`relative text-left rounded-xl border overflow-hidden transition-all group ${
                alreadyRegistered
                  ? 'opacity-50 cursor-not-allowed border-border'
                  : isSelected
                    ? 'border-accent ring-2 ring-accent/30 bg-accent/5'
                    : 'border-border hover:border-accent/40 hover:bg-accent/5'
              }`}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-muted">
                {heroUrl ? (
                  <img
                    src={heroUrl}
                    alt={`${product.productName} ${product.color}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Checkbox */}
              {!alreadyRegistered && (
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(product._idx)}
                    className="bg-background/80 backdrop-blur-sm"
                  />
                </div>
              )}

              {/* Already registered badge */}
              {alreadyRegistered && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Imported
                  </Badge>
                </div>
              )}

              {/* Info */}
              <div className="p-2 space-y-0.5">
                <p className="text-xs font-medium leading-tight truncate">{product.productName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{product.color}</p>
                <p className="text-[10px] text-muted-foreground">{imgCount} images</p>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No products match your search</p>
        </div>
      )}

      {/* Sticky bottom bar when items selected */}
      {selected.size > 0 && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t pt-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selected.size} product{selected.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button onClick={importSelected} className="gap-2">
              <Download className="w-4 h-4" />
              Import Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
