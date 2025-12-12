import { useState } from "react";
import { 
  FileText, 
  Database, 
  ListOrdered, 
  CheckCircle, 
  Copy, 
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface QuestionItem {
  letter: string;
  description: string;
  solution: string;
}

interface AIResponse {
  originalQuestion: string;
  extractedData: string[];
  questionItems: QuestionItem[];
  steps: {
    title: string;
    content: string;
  }[];
  finalAnswer: string;
  usedMaterials: string[];
  shortVersion: string;
}

interface AIResponsePanelProps {
  response: AIResponse | null;
  isLoading: boolean;
}

export function AIResponsePanel({ response, isLoading }: AIResponsePanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>(["step-1"]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-muted-foreground">Processando sua questão...</p>
          <p className="text-sm text-muted-foreground">A IA está analisando os materiais e resolvendo</p>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Sparkles className="h-12 w-12 mb-4" />
          <p className="font-medium">Aguardando questão</p>
          <p className="text-sm text-center mt-2">
            Faça upload de uma imagem, PDF ou cole o texto da questão e clique em "Resolver"
          </p>
        </CardContent>
      </Card>
    );
  }

  const stepIcons = [
    BookOpen,
    Calculator,
    ClipboardCheck,
    Calculator,
    ClipboardCheck,
    Calculator,
    CheckCircle,
  ];

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-1">
        <Card data-testid="section-question">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Questão Completa
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(response.originalQuestion, "question")}
              data-testid="button-copy-question"
            >
              {copiedSection === "question" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md font-serif text-lg leading-relaxed">
              {response.originalQuestion}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="section-data">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Dados Extraídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {response.extractedData.map((data, i) => (
                <li key={i} className="flex items-start gap-2 font-mono text-sm bg-muted p-2 rounded">
                  <span className="text-primary font-bold">{i + 1}.</span>
                  <span>{data}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {response.questionItems.length > 0 && (
          <Card data-testid="section-items">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-primary" />
                Itens da Questão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {response.questionItems.map((item, i) => (
                <div key={i} className="border rounded-md p-4" data-testid={`item-${item.letter}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {item.letter})
                    </Badge>
                    <span className="font-medium">O que pede:</span>
                  </div>
                  <p className="text-muted-foreground mb-4 pl-4 border-l-2 border-primary">
                    {item.description}
                  </p>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm font-medium mb-2">Solução:</p>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]}>
                        {item.solution}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card data-testid="section-steps">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Etapas do Fluxo SolveAI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {response.steps.map((step, i) => {
              const Icon = stepIcons[i] || CheckCircle;
              const stepId = `step-${i + 1}`;
              const isExpanded = expandedSteps.includes(stepId);

              return (
                <Collapsible key={i} open={isExpanded} onOpenChange={() => toggleStep(stepId)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      data-testid={`button-step-${i + 1}`}
                    >
                      <span className="flex items-center gap-2">
                        <Badge variant="outline">{i + 1}</Badge>
                        <Icon className="h-4 w-4" />
                        {step.title}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none mt-2 bg-muted p-4 rounded-md">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]}>
                        {step.content}
                      </ReactMarkdown>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-primary" data-testid="section-final">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 bg-primary/5">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Resposta Final
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(response.finalAnswer, "final")}
              data-testid="button-copy-final"
            >
              {copiedSection === "final" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]}>
                {response.finalAnswer}
              </ReactMarkdown>
            </div>

            {response.usedMaterials.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Materiais utilizados:</p>
                <div className="flex flex-wrap gap-2">
                  {response.usedMaterials.map((material, i) => (
                    <Badge key={i} variant="secondary">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Versão curta (para prova):</p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                {response.shortVersion}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
