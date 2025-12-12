import { useState, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadZone } from "@/components/UploadZone";
import { FolderSelector } from "@/components/FolderSelector";
import { AIResponsePanel } from "@/components/AIResponsePanel";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { createFolder, getFilesByFolder, getFolderById } from "@/lib/indexedDB";
import { solveQuestion, extractTextFromImage, type SolveResponse, type FolderInfo } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  extractedText?: string;
}

export default function SolvePage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [response, setResponse] = useState<SolveResponse | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const { toast } = useToast();

  const handleFilesChange = useCallback(async (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    
    if (newFiles.length > 0) {
      setIsProcessing(true);
      
      try {
        // Extract text from each file using Gemini Vision
        const extractedTexts: string[] = [];
        
        for (const uploadedFile of newFiles) {
          if (uploadedFile.file.type.startsWith("image/")) {
            // Convert file to base64
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
              reader.onload = () => {
                const result = reader.result as string;
                // Remove the data URL prefix
                const base64Data = result.split(",")[1];
                resolve(base64Data);
              };
              reader.readAsDataURL(uploadedFile.file);
            });
            
            const text = await extractTextFromImage(base64, uploadedFile.file.type);
            if (text) {
              extractedTexts.push(text);
            }
          } else if (uploadedFile.file.type === "application/pdf") {
            // For PDFs, we'll use the same approach - convert to image via Gemini
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
              reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(",")[1];
                resolve(base64Data);
              };
              reader.readAsDataURL(uploadedFile.file);
            });
            
            const text = await extractTextFromImage(base64, "application/pdf");
            if (text) {
              extractedTexts.push(text);
            }
          }
        }
        
        if (extractedTexts.length > 0) {
          setQuestionText(extractedTexts.join("\n\n"));
        }
      } catch (error) {
        console.error("Error extracting text:", error);
        toast({
          title: "Erro na extração",
          description: "Não foi possível extrair o texto dos arquivos. Tente colar o texto manualmente.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  }, [toast]);

  const handleResolve = async () => {
    if (!questionText.trim()) {
      toast({
        title: "Questão vazia",
        description: "Por favor, faça upload de um arquivo ou cole o texto da questão.",
        variant: "destructive",
      });
      return;
    }

    setIsResolving(true);
    setResponse(null);

    try {
      // Get context materials and folder info if folder is selected
      let contextMaterials: string[] = [];
      let folderInfo: FolderInfo | undefined;
      
      if (selectedFolderId) {
        const folder = await getFolderById(selectedFolderId);
        if (folder) {
          folderInfo = {
            name: folder.name,
            bookReference: folder.bookReference,
            notes: folder.notes,
          };
        }
        
        const folderFiles = await getFilesByFolder(selectedFolderId);
        
        // Extract text from context files
        for (const file of folderFiles) {
          if (file.extractedText) {
            contextMaterials.push(`[${file.name}]\n${file.extractedText}`);
          } else if (file.type.startsWith("image/") || file.type === "application/pdf") {
            // Try to extract text from images in context
            try {
              const base64Data = file.data.split(",")[1];
              const text = await extractTextFromImage(base64Data, file.type);
              if (text) {
                contextMaterials.push(`[${file.name}]\n${text}`);
              }
            } catch (e) {
              // If extraction fails, just add the file name
              contextMaterials.push(`[${file.name}] - Arquivo de contexto`);
            }
          }
        }
      }

      const result = await solveQuestion(questionText, contextMaterials, folderInfo);
      setResponse(result);
      
      toast({
        title: "Questão resolvida!",
        description: "A IA analisou sua questão e gerou a resolução completa.",
      });
    } catch (error) {
      console.error("Error solving question:", error);
      toast({
        title: "Erro ao resolver",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua questão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const folder = await createFolder(name);
      setSelectedFolderId(folder.id);
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

  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Resolver Questões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pasta de Contexto</label>
                <FolderSelector
                  selectedFolderId={selectedFolderId}
                  onSelect={setSelectedFolderId}
                />
                <p className="text-xs text-muted-foreground">
                  Selecione uma pasta com seus materiais de estudo para a IA usar como referência
                </p>
              </div>

              <UploadZone
                onFilesChange={handleFilesChange}
                onTextChange={setQuestionText}
                extractedText={questionText}
                isProcessing={isProcessing}
              />

              <Button
                className="w-full"
                size="lg"
                onClick={handleResolve}
                disabled={!questionText.trim() || isResolving || isProcessing}
                data-testid="button-resolve"
              >
                {isResolving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resolvendo com IA...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Resolver usando Contexto
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="h-full min-h-[500px]">
          <AIResponsePanel response={response} isLoading={isResolving} />
        </div>
      </div>

      <CreateFolderDialog
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}
