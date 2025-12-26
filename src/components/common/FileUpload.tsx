import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Image, File, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (file: File) => Promise<{ url: string; path: string; fileName: string } | null>;
  onRemove?: (path: string) => Promise<boolean>;
  accept?: string;
  maxSizeMB?: number;
  uploading?: boolean;
  progress?: number;
  currentFile?: { url: string; path: string; fileName: string } | null;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onUpload,
  onRemove,
  accept = '*/*',
  maxSizeMB = 10,
  uploading = false,
  progress = 0,
  currentFile,
  className,
  disabled = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="w-8 h-8 text-primary" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
      return <FileText className="w-8 h-8 text-primary" />;
    }
    return <File className="w-8 h-8 text-primary" />;
  };

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`El archivo excede el límite de ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFile = useCallback(async (file: File) => {
    if (!validateFile(file)) return;
    await onUpload(file);
  }, [onUpload, maxSizeMB]);

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

    if (disabled || uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, uploading, handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleRemove = async () => {
    if (currentFile && onRemove) {
      await onRemove(currentFile.path);
    }
  };

  if (currentFile) {
    return (
      <div className={cn("flex items-center gap-3 p-3 border rounded-lg bg-muted/30", className)}>
        {getFileIcon(currentFile.fileName)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{currentFile.fileName}</p>
          <div className="flex items-center gap-1 text-xs text-success">
            <Check className="w-3 h-3" />
            Archivo cargado
          </div>
        </div>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          "flex flex-col items-center justify-center gap-2 cursor-pointer",
          dragActive && "border-primary bg-primary/5",
          error && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          !dragActive && !error && "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-5 h-5 animate-pulse text-primary" />
              <span className="text-sm text-muted-foreground">Subiendo...</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        ) : (
          <>
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Arrastra un archivo o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Máximo {maxSizeMB}MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
