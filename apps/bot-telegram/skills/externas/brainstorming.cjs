/**
 * Skill: brainstorming
 * 
 * Geração de ideias e soluções criativas.
 * Futuramente conectável com IA (Central de IA).
 * 
 * Uso via executor:
 *   executor.run('brainstorming', { topic: 'melhorar chat', count: 5 })
 */

module.exports = {
  name: 'brainstorming',
  description: 'Geração de ideias e soluções criativas',
  category: 'ai',

  async execute(params = {}) {
    const { topic, count = 5, context = '' } = params;

    if (!topic) {
      return { error: 'Informe um tópico: { topic: "..." }' };
    }

    // Templates de brainstorming (sem IA — estrutura pura)
    const frameworks = [
      { name: 'SCAMPER', questions: ['Substituir?', 'Combinar?', 'Adaptar?', 'Modificar?', 'Outro uso?', 'Eliminar?', 'Reverter?'] },
      { name: '5 Porquês', questions: ['Por que isso acontece?', 'Por que esse motivo existe?', 'Por que essa causa?', 'Por que esse fator?', 'Qual a raiz?'] },
      { name: 'Mapa Mental', questions: ['Ideia central?', 'Ramos principais?', 'Sub-ramos?', 'Conexões?', 'Prioridades?'] },
    ];

    const selectedFramework = frameworks[Math.floor(Math.random() * frameworks.length)];

    return {
      topic,
      framework: selectedFramework.name,
      prompts: selectedFramework.questions.slice(0, count).map((q, i) => ({
        step: i + 1,
        question: q,
        appliedTo: `${q} → aplicado a "${topic}"`,
      })),
      context: context || null,
      note: 'Para respostas com IA, ative a skill ai-central e conecte um provider.',
      aiReady: false,
    };
  },
};
