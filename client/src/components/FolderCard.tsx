import { useState, useEffect } from "react";
import { Folder, MoreVertical, Trash2, Eye, FileText, Image } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ContextFolder, type ContextFile, getFilesByFolder } from "@/lib/indexedDB";

interface FolderCardProps {
  folder: ContextFolder;
  onOpen: (folder: ContextFolder) => void;
  onDelete: (folder: ContextFolder) => void;
}

export function FolderCard({ folder, onOpen, onDelete }: FolderCardProps) {
  const [files, setFiles] = useState<ContextFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [folder.id]);

  const loadFiles = async () => {
    try {
      const folderFiles = await getFilesByFolder(folder.id);
      setFiles(folderFiles);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    const total = files.reduce((acc, f) => acc + f.size, 0);
    if (total < 1024) return total + " B";
    if (total < 1024 * 1024) return (total / 1024).toFixed(1) + " KB";
    return (total / (1024 * 1024)).toFixed(1) + " MB";
  };

  const previewFiles = files.slice(0, 3);

  return (
    <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-folder-${folder.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Folder className="h-5 w-5 text-primary shrink-0" />
          <span className="font-medium truncate">{folder.name}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="shrink-0" data-testid={`button-folder-menu-${folder.id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpen(folder)} data-testid={`menu-open-${folder.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Abrir
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(folder)}
              className="text-destructive"
              data-testid={`menu-delete-${folder.id}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-2" onClick={() => onOpen(folder)}>
        {loading ? (
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="aspect-video flex items-center justify-center text-muted-foreground text-sm">
            Pasta vazia
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {previewFiles.map((file) => (
              <div
                key={file.id}
                className="aspect-square bg-muted rounded flex items-center justify-center overflow-hidden"
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={file.data}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            ))}
            {files.length > 3 && (
              <div className="col-span-3 text-center text-xs text-muted-foreground mt-1">
                +{files.length - 3} mais
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>{files.length} arquivo{files.length !== 1 ? "s" : ""}</span>
          {files.length > 0 && (
            <>
              <span className="text-border">|</span>
              <span>{formatSize(files.reduce((a, f) => a + f.size, 0))}</span>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
