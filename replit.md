# SolveAI Educacional

Um aplicativo web para ajudar estudantes a resolver questões acadêmicas usando IA, com suporte a materiais de contexto organizados em pastas.

## Visão Geral

O SolveAI Educacional permite:
- Upload de questões via imagem, PDF ou texto
- Extração automática de texto usando Gemini Vision
- Organização de materiais de estudo em pastas de contexto
- Resolução de questões usando IA com fluxo estruturado em 7 etapas
- Exibição formatada da resposta com separação de itens (A, B, C)

## Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários e API
│   │   └── hooks/         # Custom hooks
├── server/                 # Backend Express
│   ├── gemini.ts          # Integração com Gemini AI
│   └── routes.ts          # Endpoints da API
└── shared/                 # Tipos compartilhados
```

## Tecnologias

- **Frontend**: React, Tailwind CSS, Shadcn UI, Wouter (routing)
- **Backend**: Express.js, TypeScript
- **IA**: Google Gemini AI (gemini-2.5-flash)
- **Armazenamento**: IndexedDB (pastas e arquivos no browser)

## Endpoints da API

- `POST /api/solve` - Resolve uma questão usando contexto
  - Body: `{ questionText: string, contextMaterials: string[] }`
  - Response: `SolveResponse` com questão, dados, itens, etapas e resposta final

- `POST /api/extract-text` - Extrai texto de imagem usando Gemini Vision
  - Body: `{ imageBase64: string, mimeType: string }`
  - Response: `{ text: string }`

## Fluxo de Resolução

1. **Interpretação**: Transcrição e análise do enunciado
2. **Solução A**: Primeira resolução passo a passo
3. **Verificação de Aderência**: Conferência com material de contexto
4. **Solução B**: Segunda resolução independente
5. **Consistência**: Comparação entre soluções
6. **Verificação Matemática**: Recálculo e verificação de unidades
7. **Resposta Final**: Resposta validada formatada

## Variáveis de Ambiente

- `GEMINI_API_KEY` - Chave da API do Google Gemini (obrigatória)
