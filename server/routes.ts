import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { solveQuestion, extractTextFromImage, validateApiKey } from "./gemini";

// Zod schemas for request validation
const folderInfoSchema = z.object({
  name: z.string(),
  bookReference: z.string().optional(),
  notes: z.string().optional(),
}).optional();

const solveRequestSchema = z.object({
  questionText: z.string().min(1, "O texto da questão é obrigatório"),
  contextMaterials: z.array(z.string()).optional().default([]),
  folderInfo: folderInfoSchema,
});

const extractTextRequestSchema = z.object({
  imageBase64: z.string().min(1, "A imagem em base64 é obrigatória"),
  mimeType: z.string().optional().default("image/jpeg"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check for API key
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      geminiConfigured: validateApiKey(),
    });
  });

  // Solve question endpoint
  app.post("/api/solve", async (req, res) => {
    try {
      // Validate request body
      const parseResult = solveRequestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: parseResult.error.errors[0]?.message || "Dados inválidos" 
        });
      }

      const { questionText, contextMaterials, folderInfo } = parseResult.data;

      const result = await solveQuestion(questionText, contextMaterials, folderInfo);
      
      res.json(result);
    } catch (error) {
      console.error("Error solving question:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Erro ao resolver questão" 
      });
    }
  });

  // Extract text from image using Gemini Vision
  app.post("/api/extract-text", async (req, res) => {
    try {
      // Validate request body
      const parseResult = extractTextRequestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: parseResult.error.errors[0]?.message || "Dados inválidos" 
        });
      }

      const { imageBase64, mimeType } = parseResult.data;

      const text = await extractTextFromImage(imageBase64, mimeType);
      
      res.json({ text });
    } catch (error) {
      console.error("Error extracting text:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Erro ao extrair texto" 
      });
    }
  });

  return httpServer;
}
