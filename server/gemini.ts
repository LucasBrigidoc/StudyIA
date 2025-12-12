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
${folderInfoText}
${contextMaterials.length > 0 ? "Use OBRIGATORIAMENTE os materiais da pasta fornecida abaixo:" : ""}

[MATERIAIS DA PASTA]
${materialsText}

[QUESTÃO A RESOLVER]
${questionText}

Execute o seguinte fluxo e retorne um JSON estruturado:

ETAPA 1 — INTERPRETAÇÃO  
- Transcreva o enunciado completo
- Liste TODOS os dados fornecidos (valores numéricos, unidades, condições)
- Diga exatamente o que cada item (a, b, c, etc.) está pedindo
- Se houver itens A), B), C) etc., identifique e explique o que cada um pede SEPARADAMENTE
- Relacione com materiais da pasta (slide, fórmula, exemplo) se disponíveis
- Crie um plano de solução

ETAPA 2 — SOLUÇÃO A  
- Resolva passo a passo cada item
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

ETAPA 6 — VERIFICAÇÃO MATEMÁTICA  
- Recalcular tudo  
- Verificar unidades, arredondamento e lógica

ETAPA 7 — VERIFICAÇÃO REVERSA (BACK-CHECK)
- Pegue a resposta final obtida
- Substitua de volta na equação/problema original
- Verifique se os valores batem e fazem sentido
- Para equações: substitua o valor encontrado e confirme que ambos os lados são iguais
- Para física/química: use o resultado para recalcular um dado conhecido do problema
- Verifique se a ordem de grandeza faz sentido (ex: velocidade de carro não pode ser 50.000 km/h)
- Se a verificação falhar, identifique o erro e corrija a solução

ETAPA 8 — RESPOSTA FINAL  
- Resposta final validada para cada item
- Passo a passo
- Fórmulas usadas
- Resultado da verificação reversa
- Versão curta para prova
- Indicação do material utilizado (se houver)

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
    {"title": "Interpretação", "content": "análise detalhada"},
    {"title": "Solução A", "content": "resolução passo a passo"},
    {"title": "Verificação de Aderência", "content": "conferência"},
    {"title": "Solução B", "content": "segunda resolução"},
    {"title": "Consistência", "content": "comparação"},
    {"title": "Verificação Matemática", "content": "recálculo"},
    {"title": "Verificação Reversa", "content": "substituição da resposta no problema original para confirmar"},
    {"title": "Resposta Final", "content": "validação final"}
  ],
  "finalAnswer": "Resposta final formatada em markdown com todas as respostas",
  "usedMaterials": ["material 1 usado", "material 2"],
  "shortVersion": "Respostas resumidas: a) X | b) Y | c) Z"
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
