import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2, Package, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ANGLE_OPTIONS = [
  { value: 'front', label: 'Front' },
  { value: 'side', label: 'Side' },
  { value: 'back', label: 'Back' },
  { value: 'top', label: 'Top' },
  { value: '3/4', label: '3/4 View' },
  { value: 'detail', label: 'Detail' },
  { value: 'sole', label: 'Sole' },
  { value: 'other', label: 'Other' },
];

interface UploadedAngle {
  id: string;
  file: File;
  previewUrl: string;
  angle: string;
  uploading?: boolean;
}

interface CreateSKUModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (skuId: string) => void;
}

export function CreateSKUModal({ open, onClose, onCreated }: CreateSKUModalProps) {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [angles, setAngles] = useState<UploadedAngle[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = '';
  };

  const addFiles = (files: File[]) => {
    const newAngles: UploadedAngle[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
      angle: ANGLE_OPTIONS[angles.length + index]?.value || 'other',
    }));
    setAngles(prev => [...prev, ...newAngles]);
  };

  const removeAngle = (id: string) => {
    setAngles(prev => {
      const angle = prev.find(a => a.id === id);
      if (angle) URL.revokeObjectURL(angle.previewUrl);
      return prev.filter(a => a.id !== id);
    });
  };

  const updateAngleType = (id: string, angleType: string) => {
    setAngles(prev => prev.map(a => (a.id === id ? { ...a, angle: angleType } : a)));
  };

  const handleCreate = async () => {
    if (!user?.id || !name.trim() || angles.length === 0) return;

    setIsCreating(true);
    try {
      // 1. Create SKU record
      const { data: sku, error: skuError } = await supabase
        .from('product_skus')
        .insert({
          user_id: user.id,
          brand_id: currentBrand?.id || null,
          name: name.trim(),
          sku_code: skuCode.trim() || null,
        })
        .select()
        .single();

      if (skuError) throw skuError;

      // 2. Upload each angle image and create product records
      for (const angle of angles) {
        const fileExt = angle.file.name.split('.').pop();
        const filePath = `${user.id}/${sku.id}/${angle.id}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, angle.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        // Create product record linked to SKU
        const { error: prodError } = await supabase.from('scraped_products').insert({
          user_id: user.id,
          brand_id: currentBrand?.id || null,
          sku_id: sku.id,
          angle: angle.angle,
          name: name.trim(),
          external_id: `sku-${sku.id}-${angle.angle}`,
          thumbnail_url: urlData.publicUrl,
          full_url: urlData.publicUrl,
          storage_path: filePath,
        });

        if (prodError) throw prodError;
      }

      // 3. Generate composite image (call edge function)
      // For now, we'll skip this and just use the first image as preview
      // TODO: Implement composite-product-images edge function

      toast.success(`Created SKU "${name}" with ${angles.length} angles`);
      queryClient.invalidateQueries({ queryKey: ['product-skus'] });
      queryClient.invalidateQueries({ queryKey: ['scraped-products'] });

      // Cleanup
      angles.forEach(a => URL.revokeObjectURL(a.previewUrl));
      setName('');
      setSkuCode('');
      setAngles([]);
      onClose();
      onCreated?.(sku.id);
    } catch (error: any) {
      console.error('Error creating SKU:', error);
      toast.error(error.message || 'Failed to create SKU');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    angles.forEach(a => URL.revokeObjectURL(a.previewUrl));
    setName('');
    setSkuCode('');
    setAngles([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Create Product SKU
          </DialogTitle>
          <DialogDescription>
            Group multiple angles of the same product for better AI fidelity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* SKU Name & Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku-name">Product Name *</Label>
              <Input
                id="sku-name"
                placeholder="e.g., Boston Brown Clog"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku-code">SKU Code (optional)</Label>
              <Input
                id="sku-code"
                placeholder="e.g., BIRK-BOSTON-BRN"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
              />
            </div>
          </div>

          {/* Upload Zone */}
          <div className="space-y-2">
            <Label>Product Angles *</Label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-accent bg-accent/5'
                  : 'border-muted-foreground/30 hover:border-accent/50'
              }`}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop product images here
              </p>
              <label>
                <Button variant="outline" size="sm" asChild>
                  <span>Browse Files</span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>

          {/* Uploaded Angles Grid */}
          {angles.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Angles ({angles.length})</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {angles.map((angle) => (
                  <div
                    key={angle.id}
                    className="relative rounded-lg overflow-hidden border bg-muted"
                  >
                    <img
                      src={angle.previewUrl}
                      alt={angle.angle}
                      className="aspect-square object-cover"
                    />
                    <button
                      onClick={() => removeAngle(angle.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="p-2">
                      <Select
                        value={angle.angle}
                        onValueChange={(v) => updateAngleType(angle.id, v)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ANGLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || angles.length === 0 || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              `Create SKU with ${angles.length} Angle${angles.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
