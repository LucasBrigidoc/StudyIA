import { useState, useEffect } from "react";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolderCard } from "@/components/FolderCard";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { FolderDetailModal } from "@/components/FolderDetailModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  type ContextFolder,
  getAllFolders,
  createFolder,
  deleteFolder,
} from "@/lib/indexedDB";
import { useToast } from "@/hooks/use-toast";

export default function FoldersPage() {
  const [folders, setFolders] = useState<ContextFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<ContextFolder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<ContextFolder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const allFolders = await getAllFolders();
      setFolders(allFolders);
    } catch (error) {
      console.error("Error loading folders:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as pastas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name);
      await loadFolders();
      toast({
        title: "Pasta criada",
        description: `A pasta "${name}" foi criada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a pasta.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      await deleteFolder(folderToDelete.id);
      await loadFolders();
      toast({
        title: "Pasta excluída",
        description: `A pasta "${folderToDelete.name}" foi excluída.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a pasta.",
        variant: "destructive",
      });
    } finally {
      setFolderToDelete(null);
    }
  };

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Pastas de Contexto</h1>
          <p className="text-muted-foreground">
            Organize seus materiais de estudo por disciplina ou assunto
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-new-folder">
          <Plus className="h-4 w-4 mr-2" />
          Nova Pasta
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FolderOpen className="h-16 w-16 mb-4" />
          <h2 className="text-xl font-medium mb-2">Nenhuma pasta criada</h2>
          <p className="text-center mb-4">
            Crie pastas para organizar slides, PDFs, anotações e outros materiais de estudo
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Pasta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onOpen={setSelectedFolder}
              onDelete={setFolderToDelete}
            />
          ))}
        </div>
      )}

      <CreateFolderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateFolder}
      />

      <FolderDetailModal
        folder={selectedFolder}
        open={!!selectedFolder}
        onOpenChange={(open) => !open && setSelectedFolder(null)}
        onFilesChange={loadFolders}
      />

      <AlertDialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pasta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a pasta "{folderToDelete?.name}"? 
              Todos os arquivos dentro dela serão perdidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} data-testid="button-confirm-delete">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
