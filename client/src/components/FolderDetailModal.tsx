import { useState, useEffect, useRef } from "react";
import { X, Upload, FileText, Trash2, Loader2, Book, StickyNote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  type ContextFolder,
  type ContextFile,
  getFilesByFolder,
  addFile,
  deleteFile,
  updateFolder,
} from "@/lib/indexedDB";

interface FolderDetailModalProps {
  folder: ContextFolder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesChange?: () => void;
}

export function FolderDetailModal({
  folder,
  open,
  onOpenChange,
  onFilesChange,
}: FolderDetailModalProps) {
  const [files, setFiles] = useState<ContextFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bookReference, setBookReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (folder && open) {
      loadFiles();
      setBookReference(folder.bookReference || "");
      setNotes(folder.notes || "");
    }
  }, [folder, open]);

  const handleSaveInfo = async () => {
    if (!folder) return;
    setSaving(true);
    try {
      await updateFolder(folder.id, { bookReference, notes });
      onFilesChange?.();
    } catch (error) {
      console.error("Error saving folder info:", error);
    } finally {
      setSaving(false);
    }
  };

  const loadFiles = async () => {
    if (!folder) return;
    setLoading(true);
    try {
      const folderFiles = await getFilesByFolder(folder.id);
      setFiles(folderFiles);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!folder || !e.target.files) return;

    setUploading(true);
    const newFiles = Array.from(e.target.files);

    try {
      for (const file of newFiles) {
        const reader = new FileReader();
        const data = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        await addFile({
          folderId: folder.id,
          name: file.name,
          type: file.type,
          size: file.size,
          data,
        });
      }
      await loadFiles();
      onFilesChange?.();
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      await loadFiles();
      onFilesChange?.();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (!folder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {folder.name}
          </DialogTitle>
        </DialogHeader>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,application/pdf,.txt,.md"
          multiple
          className="hidden"
        />

        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="bookReference" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Livro de Referência
            </Label>
            <Input
              id="bookReference"
              placeholder="Ex: Halliday, Resnick - Fundamentos de Física Vol. 1"
              value={bookReference}
              onChange={(e) => setBookReference(e.target.value)}
              data-testid="input-book-reference"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Outras Informações
            </Label>
            <Textarea
              id="notes"
              placeholder="Adicione informações extras sobre esta matéria..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-notes"
            />
          </div>
          <Button 
            onClick={handleSaveInfo} 
            disabled={saving}
            variant="secondary"
            size="sm"
            data-testid="button-save-info"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Salvar Informações
          </Button>
        </div>

        <div className="flex justify-between items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {files.length} arquivo{files.length !== 1 ? "s" : ""} nesta pasta
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            data-testid="button-add-files"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Adicionar Arquivos
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4" />
              <p>Nenhum arquivo nesta pasta</p>
              <p className="text-sm">Adicione slides, PDFs, fotos ou anotações</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative rounded-md bg-muted overflow-hidden"
                  data-testid={`file-item-${file.id}`}
                >
                  <div className="aspect-square flex items-center justify-center">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.data}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-2 bg-card">
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteFile(file.id)}
                    data-testid={`button-delete-file-${file.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Total: {formatSize(files.reduce((a, f) => a + f.size, 0))}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
