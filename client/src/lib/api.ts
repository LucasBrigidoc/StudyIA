import { apiRequest } from "./queryClient";

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

export async function solveQuestion(
  questionText: string,
  contextMaterials: string[]
): Promise<SolveResponse> {
  const response = await apiRequest("POST", "/api/solve", {
    questionText,
    contextMaterials,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao resolver questão");
  }

  return response.json();
}

export async function extractTextFromImage(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const response = await apiRequest("POST", "/api/extract-text", {
    imageBase64,
    mimeType,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao extrair texto");
  }

  const data = await response.json();
  return data.text;
}
