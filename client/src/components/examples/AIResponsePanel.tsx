import { AIResponsePanel } from "../AIResponsePanel";

export default function AIResponsePanelExample() {
  // todo: remove mock functionality
  const mockResponse = {
    originalQuestion: "Uma partícula com massa m = 2 kg está em repouso sobre uma superfície horizontal sem atrito. Uma força F = 10 N é aplicada horizontalmente sobre a partícula durante 5 segundos. Determine:\n\na) A aceleração da partícula\nb) A velocidade final da partícula\nc) O deslocamento da partícula",
    extractedData: [
      "Massa (m) = 2 kg",
      "Força (F) = 10 N",
      "Tempo (t) = 5 s",
      "Velocidade inicial (v₀) = 0 m/s (repouso)",
      "Superfície sem atrito",
    ],
    questionItems: [
      {
        letter: "a",
        description: "Calcular a aceleração que a partícula adquire quando a força é aplicada",
        solution: "Usando a Segunda Lei de Newton:\n\n**F = m · a**\n\na = F / m = 10 N / 2 kg\n\n**a = 5 m/s²**",
      },
      {
        letter: "b",
        description: "Calcular a velocidade que a partícula atinge ao final dos 5 segundos",
        solution: "Usando a equação do MRU:\n\n**v = v₀ + a · t**\n\nv = 0 + 5 · 5\n\n**v = 25 m/s**",
      },
      {
        letter: "c",
        description: "Calcular a distância percorrida pela partícula durante os 5 segundos",
        solution: "Usando a equação de Torricelli:\n\n**S = v₀ · t + (a · t²) / 2**\n\nS = 0 · 5 + (5 · 25) / 2\n\n**S = 62,5 m**",
      },
    ],
    steps: [
      {
        title: "Interpretação",
        content: "Identificamos um problema de dinâmica com força constante aplicada a uma partícula em repouso. O material da pasta indica uso da 2ª Lei de Newton e equações do MRUV.",
      },
      {
        title: "Solução A",
        content: "Resolvemos cada item usando as fórmulas do material: F=ma para aceleração, v=v₀+at para velocidade, e S=v₀t+at²/2 para deslocamento.",
      },
      {
        title: "Verificação de Aderência",
        content: "A solução segue exatamente o método do professor conforme slides da Aula 3. Todos os dados foram utilizados.",
      },
      {
        title: "Solução B",
        content: "Refazendo independentemente: a=5m/s², v=25m/s, S=62,5m. Resultados coincidem.",
      },
      {
        title: "Consistência",
        content: "Soluções A e B são idênticas. Não há necessidade de correção.",
      },
      {
        title: "Verificação Matemática",
        content: "10/2=5 ✓ | 0+5×5=25 ✓ | (5×25)/2=62,5 ✓ | Unidades corretas.",
      },
      {
        title: "Resposta Final",
        content: "Todos os valores foram validados e estão corretos.",
      },
    ],
    finalAnswer: "**a) a = 5 m/s²**\n\n**b) v = 25 m/s**\n\n**c) S = 62,5 m**",
    usedMaterials: ["Slide Aula 3 - Leis de Newton", "Fórmulas MRUV", "Exercícios Resolvidos Cap. 4"],
    shortVersion: "a) 5 m/s² | b) 25 m/s | c) 62,5 m",
  };

  return (
    <div className="max-w-2xl h-[600px]">
      <AIResponsePanel response={mockResponse} isLoading={false} />
    </div>
  );
}
