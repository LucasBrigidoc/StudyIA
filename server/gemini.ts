// Integration with Gemini AI for SolveAI Educacional
// Using blueprint:javascript_gemini

import { GoogleGenAI } from "@google/genai";

// Validate API key at module load
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface QuestionItem {
  letter: string;
  description: string;
  solution: string;
}

export interface SolveResponse {
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
  confidence: "alta" | "media" | "baixa";
  confidenceReason?: string;
  warnings: string[];
  missingData: string[];
  sourceCitations: {
    formula: string;
    source: string;
  }[];
}

export interface FolderInfo {
  name: string;
  bookReference?: string;
  notes?: string;
}

function buildPrompt(questionText: string, contextMaterials: string[], folderInfo?: FolderInfo): string {
  const materialsText = contextMaterials.length > 0 
    ? contextMaterials.join("\n\n---\n\n")
    : "Nenhum material de contexto fornecido. Use seu conhecimento geral.";

  let folderInfoText = "";
  if (folderInfo) {
    folderInfoText = `\n[INFORMAÇÕES DA MATÉRIA: ${folderInfo.name}]`;
    if (folderInfo.bookReference) {
      folderInfoText += `\nLIVRO DE REFERÊNCIA: ${folderInfo.bookReference}
IMPORTANTE: Utilize as fórmulas, métodos e abordagem deste livro para resolver a questão. A resolução deve seguir o estilo e nomenclatura do livro indicado.`;
    }
    if (folderInfo.notes) {
      folderInfoText += `\nINFORMAÇÕES ADICIONAIS DO PROFESSOR/ALUNO: ${folderInfo.notes}`;
    }
    folderInfoText += "\n";
  }

  return `Você é o SolveAI, especialista em resolver questões acadêmicas usando um fluxo estruturado e verificações rigorosas.

REGRAS CRÍTICAS DE INTEGRIDADE:
1. NUNCA invente dados que não estão no problema. Se faltar algum dado necessário, liste em "missingData".
2. NUNCA use fórmulas sem citar a fonte exata (slide X, página Y, ou "conhecimento geral").
3. Se não tiver 100% de certeza, defina confidence como "media" ou "baixa" e explique em confidenceReason.
4. Se algo parecer estranho ou ambíguo, adicione em "warnings".
${folderInfoText}
${contextMaterials.length > 0 ? "Use OBRIGATORIAMENTE os materiais da pasta fornecida abaixo:" : ""}

[MATERIAIS DA PASTA]
${materialsText}

[QUESTÃO A RESOLVER]
${questionText}

Execute o seguinte fluxo e retorne um JSON estruturado:

ETAPA 1 — INTERPRETAÇÃO E DETECÇÃO DE DADOS FALTANTES
- Transcreva o enunciado completo
- Liste TODOS os dados fornecidos (valores numéricos, unidades, condições)
- Diga exatamente o que cada item (a, b, c, etc.) está pedindo
- Se houver itens A), B), C) etc., identifique e explique o que cada um pede SEPARADAMENTE
- VERIFIQUE se algum dado necessário NÃO foi fornecido no problema
- Se faltar dados, liste-os em "missingData" e NÃO INVENTE valores
- Relacione com materiais da pasta (slide, fórmula, exemplo) se disponíveis
- Crie um plano de solução

ETAPA 2 — SOLUÇÃO A COM CITAÇÃO DE FONTES
- Resolva passo a passo cada item
- Para CADA fórmula usada, cite a fonte exata: "Fórmula X (Slide 3)" ou "Equação Y (página 45 do livro)" ou "Fórmula Z (conhecimento geral de física)"
- Usando EXATAMENTE as fórmulas/métodos do material (se disponível)
- Com unidades, substituições e cálculos organizados
- Para cada item (A, B, C), mostre a resolução separada

ETAPA 3 — VERIFICAÇÃO DE ADERÊNCIA  
- Confira se a solução segue o professor/material  
- Confira se algum dado foi ignorado  
- Ajuste se necessário

ETAPA 4 — SOLUÇÃO B (INDEPENDENTE)  
- Refazer a questão sem olhar a solução A  
- Usando o mesmo método

ETAPA 5 — CONSISTÊNCIA  
- Compare A e B  
- Se houver diferença, corrija e produza Solução C

ETAPA 6 — ANÁLISE DIMENSIONAL
- Verifique se TODAS as unidades estão corretas em cada cálculo
- Confirme que o resultado final tem a unidade esperada
- Exemplo: metros + metros = metros (OK), metros + segundos = ERRO
- Se houver erro de unidades, corrija a solução

ETAPA 7 — VERIFICAÇÃO MATEMÁTICA  
- Recalcular tudo  
- Verificar arredondamento e lógica

ETAPA 8 — VERIFICAÇÃO REVERSA (BACK-CHECK)
- Pegue a resposta final obtida
- Substitua de volta na equação/problema original
- Verifique se os valores batem e fazem sentido
- Para equações: substitua o valor encontrado e confirme que ambos os lados são iguais
- Para física/química: use o resultado para recalcular um dado conhecido do problema
- Verifique se a ordem de grandeza faz sentido (ex: velocidade de carro não pode ser 50.000 km/h)
- Se a verificação falhar, identifique o erro e corrija a solução

ETAPA 9 — AVALIAÇÃO DE CONFIANÇA
- Avalie sua confiança na resposta: "alta", "media" ou "baixa"
- "alta": Todos os dados disponíveis, cálculos verificados, back-check passou
- "media": Alguma ambiguidade no enunciado OU não tinha material de referência
- "baixa": Dados faltando OU múltiplas interpretações possíveis OU back-check falhou
- Explique o motivo da sua avaliação em confidenceReason

ETAPA 10 — RESPOSTA FINAL  
- Resposta final validada para cada item
- Passo a passo
- Fórmulas usadas com citação de fonte
- Resultado da verificação reversa
- Versão curta para prova
- Indicação do material utilizado (se houver)
- Liste todos os avisos importantes em "warnings"

IMPORTANTE: Retorne APENAS um JSON válido no seguinte formato (sem markdown, sem texto extra):
{
  "originalQuestion": "texto completo da questão transcrita",
  "extractedData": ["dado 1 com valor e unidade", "dado 2", ...],
  "questionItems": [
    {
      "letter": "A",
      "description": "O que o item A está pedindo",
      "solution": "Resolução completa do item A com fórmulas e cálculos em markdown"
    },
    {
      "letter": "B",
      "description": "O que o item B está pedindo",
      "solution": "Resolução completa do item B"
    }
  ],
  "steps": [
    {"title": "Interpretação", "content": "análise detalhada + dados faltantes identificados"},
    {"title": "Solução A", "content": "resolução passo a passo com citação de fontes"},
    {"title": "Verificação de Aderência", "content": "conferência"},
    {"title": "Solução B", "content": "segunda resolução"},
    {"title": "Consistência", "content": "comparação"},
    {"title": "Análise Dimensional", "content": "verificação de unidades"},
    {"title": "Verificação Matemática", "content": "recálculo"},
    {"title": "Verificação Reversa", "content": "substituição da resposta no problema original para confirmar"},
    {"title": "Avaliação de Confiança", "content": "nível de certeza e justificativa"},
    {"title": "Resposta Final", "content": "validação final com avisos"}
  ],
  "finalAnswer": "Resposta final formatada em markdown com todas as respostas",
  "usedMaterials": ["material 1 usado", "material 2"],
  "shortVersion": "Respostas resumidas: a) X | b) Y | c) Z",
  "confidence": "alta | media | baixa",
  "confidenceReason": "Explicação do nível de confiança",
  "warnings": ["Aviso 1 se houver ambiguidade", "Aviso 2 se algo parecer estranho"],
  "missingData": ["Dado que faltou no problema e não foi inventado"],
  "sourceCitations": [
    {"formula": "F = ma", "source": "Slide 3 - Leis de Newton"},
    {"formula": "v = d/t", "source": "Conhecimento geral de física"}
  ]
}

Se a questão não tiver itens separados (a, b, c), deixe questionItems como array vazio e coloque toda a resolução em steps e finalAnswer.`;
}

export function validateApiKey(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export async function solveQuestion(
  questionText: string,
  contextMaterials: string[],
  folderInfo?: FolderInfo
): Promise<SolveResponse> {
  if (!validateApiKey()) {
    throw new Error("GEMINI_API_KEY não está configurada. Configure a chave da API nas variáveis de ambiente.");
  }

  const prompt = buildPrompt(questionText, contextMaterials, folderInfo);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawJson = response.text;

    if (!rawJson) {
      throw new Error("Resposta vazia do modelo");
    }

    // Parse the JSON response
    const data: SolveResponse = JSON.parse(rawJson);
    
    // Ensure all required fields exist
    return {
      originalQuestion: data.originalQuestion || questionText,
      extractedData: data.extractedData || [],
      questionItems: data.questionItems || [],
      steps: data.steps || [],
      finalAnswer: data.finalAnswer || "Não foi possível gerar a resposta.",
      usedMaterials: data.usedMaterials || contextMaterials,
      shortVersion: data.shortVersion || "",
      confidence: data.confidence || "media",
      confidenceReason: data.confidenceReason || "",
      warnings: data.warnings || [],
      missingData: data.missingData || [],
      sourceCitations: data.sourceCitations || [],
    };
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw new Error(`Falha ao resolver questão: ${error}`);
  }
}

export async function extractTextFromImage(imageBase64: string, mimeType: string): Promise<string> {
  if (!validateApiKey()) {
    throw new Error("GEMINI_API_KEY não está configurada. Configure a chave da API nas variáveis de ambiente.");
  }

  try {
    const contents = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
      `Extraia TODO o texto visível nesta imagem. Se for uma questão de prova ou exercício, transcreva o enunciado completo, incluindo todos os itens (a, b, c, etc.), valores numéricos, fórmulas e condições. Mantenha a formatação original o máximo possível.`,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    return response.text || "";
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error(`Falha ao extrair texto da imagem: ${error}`);
  }
}
