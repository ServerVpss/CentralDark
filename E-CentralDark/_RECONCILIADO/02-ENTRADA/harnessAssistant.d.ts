export type SkillTier = 'scout' | 'builder' | 'reviewer';
export declare function deterministicTier(name: string): SkillTier | null;
export interface EnrichedIngredient {
    name: string;
    kind: 'agent' | 'skill';
    /** OBRIGATÓRIO para agent E skill: a qual dos 3 chefes fixos pertence (o filtro do 7b). */
    tier: SkillTier;
    blurb: string;
}
export interface RecipeActivation {
    /** SKILL REAL carregada (ex. overclock-design-dna) — não um papel (9b). */
    skill: string;
    /** UM agent por acionamento (9c). O agent É o worker — não há nome de worker separado (12d). */
    agent: string;
    /** Modelo·effort desta etapa (ponto 6). */
    model: string;
    /** Tools que a etapa usa (ponto 6). */
    tools: string[];
    /** O ARTEFATO concreto que este acionamento produz (9a). */
    produces: string;
    /** true = roda em PARALELO com os acionamentos irmãos marcados (d). */
    parallel: boolean;
    /**
     * C-081.13: agent/skill citado FORA da despensa real → gap EXPLÍCITO anotado aqui (F-105:
     * validar o retorno do LLM contra a lista em vez de confiar). O save aceita acionamento com
     * gap declarado (visível na receita); sem gap, nome inexistente é rejeitado no lint do save.
     */
    gap?: string;
}
export interface RecipeChefe {
    chefe: SkillTier;
    /** O que o orquestrador delega a este chefe (b). */
    receives: string;
    /** Sequência de acionamentos de worker dentro do chefe (c). */
    activations: RecipeActivation[];
}
export interface ProposedRecipe {
    name: string;
    deliverable: string;
    favoriteModel: string;
    /** (a) Perguntas que o ORQUESTRADOR faz ao usuário no início da missão. */
    questions: string[];
    /** (b)+(c) Delegações por chefe + acionamentos de worker, na ordem real. */
    chefes: RecipeChefe[];
    /** (e) A ENTREGA FINAL definida. */
    delivery: string;
}
export declare function harnessDefaultModel(): string;
export declare function harnessEngine(): {
    model: string;
    effort: string;
};
export declare function enrichCatalog(input: {
    agents: string[];
    skills: string[];
    model?: string;
    effort?: string;
}): Promise<EnrichedIngredient[]>;
export declare function proposeRecipes(input: {
    agents: string[];
    skills: string[];
    media: string[];
    llms: string[];
    model?: string;
    effort?: string;
}): Promise<ProposedRecipe[]>;
export interface EnrichedCatalog {
    version: 1;
    updatedAt: string;
    items: EnrichedIngredient[];
}
export declare function enrichedCatalogPath(dataDir: string): string;
export declare function loadEnrichedCatalog(dataDir: string): Record<string, EnrichedIngredient>;
export declare function saveEnrichedCatalog(dataDir: string, items: EnrichedIngredient[]): void;
//# sourceMappingURL=harnessAssistant.d.ts.map