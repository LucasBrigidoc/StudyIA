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
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Shield,
  BookMarked
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
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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
  confidence?: "alta" | "media" | "baixa";
  confidenceReason?: string;
  warnings?: string[];
  missingData?: string[];
  sourceCitations?: {
    formula: string;
    source: string;
  }[];
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
    Calculator,
    CheckCircle,
    Shield,
    CheckCircle,
  ];

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "alta":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "media":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "baixa":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-muted";
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case "alta":
        return <Shield className="h-4 w-4" />;
      case "media":
        return <AlertCircle className="h-4 w-4" />;
      case "baixa":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-1">
        {response.confidence && (
          <Card data-testid="section-confidence">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {getConfidenceIcon(response.confidence)}
                  <span className="font-medium">Nível de Confiança:</span>
                  <Badge className={getConfidenceColor(response.confidence)}>
                    {response.confidence.toUpperCase()}
                  </Badge>
                </div>
                {response.confidenceReason && (
                  <p className="text-sm text-muted-foreground">
                    {response.confidenceReason}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {response.warnings && response.warnings.length > 0 && (
          <Card className="border-yellow-500" data-testid="section-warnings">
            <CardHeader className="pb-2 bg-yellow-50 dark:bg-yellow-950">
              <CardTitle className="text-base flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                <AlertTriangle className="h-4 w-4" />
                Avisos Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {response.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {response.missingData && response.missingData.length > 0 && (
          <Card className="border-red-500" data-testid="section-missing">
            <CardHeader className="pb-2 bg-red-50 dark:bg-red-950">
              <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                Dados Faltantes no Problema
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Os seguintes dados não foram fornecidos no enunciado:
              </p>
              <ul className="space-y-1">
                {response.missingData.map((data, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-red-500">-</span>
                    <span>{data}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

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
            <div className="bg-muted p-4 rounded-md prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {response.originalQuestion}
              </ReactMarkdown>
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
                <li key={i} className="flex items-start gap-3 text-sm bg-muted p-3 rounded-md">
                  <Badge variant="outline" className="mt-0.5 flex-shrink-0">{i + 1}</Badge>
                  <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {data}
                    </ReactMarkdown>
                  </div>
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
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
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
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
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
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
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

            {response.sourceCitations && response.sourceCitations.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <BookMarked className="h-4 w-4" />
                  Fórmulas e Fontes:
                </p>
                <div className="space-y-2">
                  {response.sourceCitations.map((citation, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-muted p-2 rounded-md">
                      <code className="font-mono text-primary">{citation.formula}</code>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-muted-foreground">{citation.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Versão curta (para prova):</p>
              <div className="bg-muted p-3 rounded-md prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {response.shortVersion}
                </ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
