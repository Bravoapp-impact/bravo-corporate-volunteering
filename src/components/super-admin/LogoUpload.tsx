import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { devLog } from "@/lib/logger";

interface LogoUploadProps {
  currentLogoUrl: string | null;
  onLogoChange: (url: string | null) => void;
  entityId?: string;
  bucket?: "company-logos" | "association-logos" | "experience-images";
  label?: string;
  aspectRatio?: "square" | "wide";
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export function LogoUpload({ currentLogoUrl, onLogoChange, entityId, bucket = "company-logos", label = "Carica logo", aspectRatio = "square" }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato non valido",
        description: "Formati accettati: PNG, JPG, WebP, SVG",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      toast({
        variant: "destructive",
        title: "File troppo grande",
        description: "Dimensione massima: 2 MB",
      });
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${entityId || crypto.randomUUID()}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      setPreviewUrl(publicUrl);
      onLogoChange(publicUrl);

      toast({
        title: "Logo caricato",
        description: "Il logo è stato caricato con successo",
      });
    } catch (error) {
      devLog.error("Error uploading logo:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare il logo",
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onLogoChange(null);
  };

  const sizeClasses = aspectRatio === "wide" 
    ? "w-48 h-28" 
    : "w-24 h-24";

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className={`${sizeClasses} object-cover rounded-lg border border-border bg-white`}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`${sizeClasses} rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center cursor-pointer hover:border-border hover:bg-muted/50 transition-colors`}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Caricamento...
            </>
          ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {previewUrl ? "Cambia" : label}
          </>
        )}
      </Button>
    </div>

      <p className="text-xs text-muted-foreground">
        PNG, JPG, WebP, SVG • Max 2 MB
      </p>
    </div>
  );
}
