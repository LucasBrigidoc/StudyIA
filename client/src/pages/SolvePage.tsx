import { useState, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadZone } from "@/components/UploadZone";
import { FolderSelector } from "@/components/FolderSelector";
import { AIResponsePanel } from "@/components/AIResponsePanel";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { createFolder, getFilesByFolder } from "@/lib/indexedDB";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  extractedText?: string;
}

interface AIResponse {
  originalQuestion: string;
  extractedData: string[];
  questionItems: {
    letter: string;
    description: string;
    solution: string;
  }[];
  steps: {
    title: string;
    content: string;
  }[];
  finalAnswer: string;
  usedMaterials: string[];
  shortVersion: string;
}

export default function SolvePage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const { toast } = useToast();

  const handleFilesChange = useCallback(async (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    
    if (newFiles.length > 0 && !questionText) {
      setIsProcessing(true);
      
      // Simulate OCR processing - in real app this would use Tesseract.js
      setTimeout(() => {
        // todo: implement real OCR with Tesseract.js
        setQuestionText("Texto extraído do arquivo será exibido aqui após o processamento OCR...");
        setIsProcessing(false);
      }, 1500);
    }
  }, [questionText]);

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
      // Get context materials if folder is selected
      let contextMaterials: string[] = [];
      if (selectedFolderId) {
        const folderFiles = await getFilesByFolder(selectedFolderId);
        contextMaterials = folderFiles.map(f => f.name);
      }

      // todo: implement real API call to backend
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response for demonstration
      const mockResponse: AIResponse = {
        originalQuestion: questionText,
        extractedData: [
          "Dado 1 extraído da questão",
          "Dado 2 extraído da questão",
          "Dado 3 extraído da questão",
        ],
        questionItems: detectQuestionItems(questionText),
        steps: [
          { title: "Interpretação", content: "Análise do enunciado e identificação dos dados fornecidos." },
          { title: "Solução A", content: "Primeira resolução seguindo o método do material." },
          { title: "Verificação de Aderência", content: "Conferência se a solução segue o professor/material." },
          { title: "Solução B", content: "Segunda resolução independente usando mesmo método." },
          { title: "Consistência", content: "Comparação das soluções A e B." },
          { title: "Verificação Matemática", content: "Recálculo e verificação de unidades." },
          { title: "Resposta Final", content: "Resposta validada e confirmada." },
        ],
        finalAnswer: "A resposta final será exibida aqui após a análise completa da IA.",
        usedMaterials: contextMaterials.length > 0 ? contextMaterials : ["Nenhum material de contexto selecionado"],
        shortVersion: "Versão resumida para prova",
      };

      setResponse(mockResponse);
    } catch (error) {
      toast({
        title: "Erro ao resolver",
        description: "Ocorreu um erro ao processar sua questão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const detectQuestionItems = (text: string): { letter: string; description: string; solution: string }[] => {
    const items: { letter: string; description: string; solution: string }[] = [];
    const regex = /([a-e])\s*\)|item\s+([a-e])/gi;
    let match;
    const letters: string[] = [];

    while ((match = regex.exec(text)) !== null) {
      const letter = (match[1] || match[2]).toLowerCase();
      if (!letters.includes(letter)) {
        letters.push(letter);
      }
    }

    if (letters.length === 0) {
      return [];
    }

    letters.forEach(letter => {
      items.push({
        letter: letter.toUpperCase(),
        description: `Item ${letter.toUpperCase()}) da questão será analisado aqui`,
        solution: "A solução detalhada para este item será gerada pela IA.",
      });
    });

    return items;
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
                  onCreateNew={() => setShowCreateFolder(true)}
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
                disabled={!questionText.trim() || isResolving}
                data-testid="button-resolve"
              >
                {isResolving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resolvendo...
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
