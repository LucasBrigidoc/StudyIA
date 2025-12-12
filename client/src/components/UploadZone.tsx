import { useState, useCallback, useRef } from "react";
import { Upload, FileText, Image, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  extractedText?: string;
}

interface UploadZoneProps {
  onFilesChange: (files: UploadedFile[]) => void;
  onTextChange: (text: string) => void;
  extractedText: string;
  isProcessing: boolean;
}

export function UploadZone({
  onFilesChange,
  onTextChange,
  extractedText,
  isProcessing,
}: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    },
    []
  );

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) =>
      file.type.startsWith("image/") || file.type === "application/pdf"
    );

    const uploadedFiles: UploadedFile[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    }));

    const updatedFiles = [...files, ...uploadedFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        data-testid="input-file-upload"
      />

      <Card
        className={cn(
          "min-h-48 border-2 border-dashed flex flex-col items-center justify-center gap-4 p-6 cursor-pointer transition-colors",
          isDragging && "border-primary bg-primary/5",
          !isDragging && "border-muted-foreground/25"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="zone-upload"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Arraste e solte seus arquivos aqui</p>
            <p className="text-sm text-muted-foreground">
              ou clique para selecionar
            </p>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Image className="h-3 w-3" /> Imagens
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> PDF
            </span>
          </div>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative group aspect-square rounded-md bg-muted overflow-hidden"
              data-testid={`file-preview-${file.id}`}
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate w-full text-center mt-1">
                    {file.file.name}
                  </span>
                </div>
              )}
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                data-testid={`button-remove-file-${file.id}`}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                {formatFileSize(file.file.size)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Ou cole o texto da questão:
        </label>
        <Textarea
          placeholder="Cole aqui o texto das questões que deseja resolver..."
          value={extractedText}
          onChange={(e) => onTextChange(e.target.value)}
          className="min-h-32 font-serif text-lg"
          data-testid="textarea-question"
        />
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Extraindo texto dos arquivos...
          </div>
        )}
      </div>
    </div>
  );
}
