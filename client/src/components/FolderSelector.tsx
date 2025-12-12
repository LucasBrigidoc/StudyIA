import { useState, useEffect } from "react";
import { Folder } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ContextFolder, getAllFolders, getFolderFileCount } from "@/lib/indexedDB";

interface FolderSelectorProps {
  selectedFolderId: string | null;
  onSelect: (folderId: string | null) => void;
}

interface FolderWithCount extends ContextFolder {
  fileCount: number;
}

export function FolderSelector({
  selectedFolderId,
  onSelect,
}: FolderSelectorProps) {
  const [folders, setFolders] = useState<FolderWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const allFolders = await getAllFolders();
      const foldersWithCount = await Promise.all(
        allFolders.map(async (folder) => ({
          ...folder,
          fileCount: await getFolderFileCount(folder.id),
        }))
      );
      setFolders(foldersWithCount);
    } catch (error) {
      console.error("Error loading folders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-9 bg-muted rounded-md animate-pulse" />
    );
  }

  return (
    <div>
      <Select
        value={selectedFolderId || ""}
        onValueChange={(value) => onSelect(value || null)}
      >
        <SelectTrigger className="w-full" data-testid="select-folder">
          <SelectValue placeholder="Selecione uma pasta de contexto">
            {selectedFolderId && folders.find(f => f.id === selectedFolderId) ? (
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                <span>{folders.find(f => f.id === selectedFolderId)?.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({folders.find(f => f.id === selectedFolderId)?.fileCount} arquivos)
                </span>
              </div>
            ) : (
              "Selecione uma pasta de contexto"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {folders.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma pasta criada ainda
            </div>
          ) : (
            folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span>{folder.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ({folder.fileCount} arquivos)
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
