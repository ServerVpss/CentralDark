import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Idiomas suportados pela interface
export type Lang = "pt-BR" | "en-US" | "es-ES";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "pt-BR", label: "Português", flag: "PT" },
  { code: "en-US", label: "English", flag: "EN" },
  { code: "es-ES", label: "Español", flag: "ES" },
];

type Dict = Record<string, string | string[]>;

const pt: Dict = {
  "nav.evolucao": "Evolução",
  "nav.principios": "Princípios",
  "nav.loop": "Loop",
  "nav.ledger": "Evidence Ledger",
  "nav.multimodal": "Multimodalidade",
  "nav.selo": "Selo do Castelo",
  "nav.pacotao": "Pacotão",

  "hero.badge": "Instinto Superior emergente",
  "hero.title": "CentralDark",
  "hero.subtitle": "Instinto Superior",
  "hero.lead":
    "Não é um assistente que obedece. É um sistema que duvida, testa contra si mesmo e só fecha o cadeado quando a prova sustenta o peso.",
  "hero.cta1": "Ver a evolução",
  "hero.cta2": "Entender o loop",
  "hero.stat1": "Estado vivo primeiro",
  "hero.stat1d": "Nada avança sobre suposição.",
  "hero.stat2": "Um Writer por escopo",
  "hero.stat2d": "Uma caneta, zero colisão.",
  "hero.stat3": "UNKNOWN não é PASS",
  "hero.stat3d": "Silêncio nunca é aprovação.",

  "evo.kicker": "Linha do tempo",
  "evo.title": "Seis camadas de amadurecimento",
  "evo.lead":
    "Cada camada não substitui a anterior: ela vira músculo permanente do sistema.",
  "evo.1.name": "Idealizador",
  "evo.1.desc":
    "A fase da intenção. Muita ideia, pouco atrito com a realidade. Aprende que desejo não é evidência.",
  "evo.2.name": "Operador",
  "evo.2.desc":
    "Passa a executar de verdade. Mão na massa, escopo estreito, entrega concreta — e a primeira dor de errar rápido.",
  "evo.3.name": "Auditor",
  "evo.3.desc":
    "Começa a exigir prova do próprio trabalho. Nasce a leitura de estado vivo antes de qualquer ação.",
  "evo.4.name": "Orquestrador",
  "evo.4.desc":
    "Coordena escopos, papéis e ordem. Um Writer por escopo, leitores à vontade, ninguém escreve em cima de ninguém.",
  "evo.5.name": "Designer de Contraprovas",
  "evo.5.desc":
    "Inverte o jogo: projeta o teste que derruba a própria tese. Se não caiu, começou a valer.",
  "evo.6.name": "Instinto Superior emergente",
  "evo.6.desc":
    "O reflexo já vem pronto: duvidar no lugar certo, cortar o excesso, provar onde dói e costurar o que ficou solto.",

  "prin.kicker": "Doutrina",
  "prin.title": "MENOS É MAIS",
  "prin.lead":
    "Menos superfície, menos ruído, menos promessa. Mais prova por unidade de esforço.",
  "prin.1.t": "Estado vivo primeiro",
  "prin.1.d":
    "Antes de agir, ler o que existe agora. Memória velha é rumor, não estado.",
  "prin.2.t": "Um Writer por escopo",
  "prin.2.d":
    "Só um agente escreve em cada território. Leitura é livre, escrita é exclusiva.",
  "prin.3.t": "UNKNOWN / SKIPPED não é PASS",
  "prin.3.d":
    "Não verificado é não verificado. Pulou? Fica marcado como pulado, e o cadeado não fecha.",
  "prin.4.t": "Meta Lupa",
  "prin.4.d":
    "A revisão da revisão. Olha o que a primeira checagem deixou passar e por quê.",
  "prin.5.t": "Fable Loop adversarial",
  "prin.5.d":
    "Um narrador hostil constrói histórias plausíveis de falha sobre a própria Meta Lupa.",
  "prin.6.t": "Cadeado derivado de prova",
  "prin.6.d":
    "O selo não é decisão de humor: ele é uma consequência aritmética das evidências.",

  "loop.kicker": "Diagrama",
  "loop.title": "O loop que fecha o cadeado",
  "loop.lead":
    "Fluxo circular: nada é PROVEN por atalho. Toda volta pode devolver o item para UNKNOWN.",
  "loop.s1.t": "Estado vivo",
  "loop.s1.d": "Leitura crua do que existe agora.",
  "loop.s2.t": "Execução mínima",
  "loop.s2.d": "Um Writer, um escopo, o menor passo útil.",
  "loop.s3.t": "Meta Lupa",
  "loop.s3.d": "Auditoria da auditoria: onde a checagem foi frouxa.",
  "loop.s4.t": "Fable Loop",
  "loop.s4.d": "Contra-histórias adversariais sobre a Meta Lupa.",
  "loop.s5.t": "Judge",
  "loop.s5.d": "Confronta tese e contraprova, atribui status.",
  "loop.s6.t": "Meta Lupa²",
  "loop.s6.d": "Audita o próprio Judge e o viés do veredito.",
  "loop.s7.t": "Revalidação causal",
  "loop.s7.d": "Refaz a cadeia causa→efeito no estado atual.",
  "loop.s8.t": "Cadeado",
  "loop.s8.d": "Derivado da prova. Sem prova, sem cadeado.",
  "loop.note":
    "Qualquer etapa pode reabrir o ciclo. Um cadeado antigo com estado novo vira STALE.",

  "ledger.kicker": "Evidence Ledger",
  "ledger.title": "Sete estados, zero ambiguidade",
  "ledger.lead":
    "Toda afirmação vive num destes estados. Nenhum deles é aberto à interpretação.",
  "ledger.pass": "Verificado agora contra estado vivo.",
  "ledger.fail": "Contraprova derrubou a tese.",
  "ledger.unknown": "Nunca foi verificado. Não conta como sucesso.",
  "ledger.skipped": "Deliberadamente não checado. Fica visível como dívida.",
  "ledger.stale": "Já passou, mas o estado mudou depois. Precisa revalidar.",
  "ledger.protected": "Travado sem prova suficiente — cadeado suspeito.",
  "ledger.proven": "Sobreviveu ao Fable Loop, ao Judge e à Meta Lupa².",
  "ledger.col.status": "Status",
  "ledger.col.meaning": "Significado",
  "ledger.col.lock": "Fecha cadeado?",
  "ledger.yes": "Sim",
  "ledger.no": "Não",

  "multi.kicker": "Multimodalidade",
  "multi.title": "Mesma doutrina, qualquer entrada",
  "multi.lead":
    "Texto, imagem, áudio, vídeo, código e dados tabulares entram no mesmo rito de prova.",
  "multi.text": "Texto",
  "multi.textd": "Especificações, logs, diffs e narrativas adversariais.",
  "multi.image": "Imagem",
  "multi.imaged": "Capturas de tela como evidência datada, não como enfeite.",
  "multi.audio": "Áudio",
  "multi.audiod": "Ditado de intenção e revisão falada de contraprovas.",
  "multi.video": "Vídeo",
  "multi.videod": "Reprodução de falha passo a passo, ponta a ponta.",
  "multi.code": "Código",
  "multi.coded": "Execução real com saída anexada ao ledger.",
  "multi.data": "Dados",
  "multi.datad": "Tabelas e métricas com origem declarada.",

  "lang.kicker": "Idiomas",
  "lang.title": "Interface completa em três idiomas",
  "lang.lead":
    "O conteúdo canônico é escrito em português padrão. A interface inteira responde em pt-BR, en-US e es-ES — não só os menus.",
  "lang.current": "Idioma ativo",

  "selo.kicker": "Selo do Castelo",
  "selo.title": "Um selo que você pode auditar",
  "selo.lead":
    "O Selo do Castelo não declara perfeição: declara exatamente o que foi provado, quando e contra qual estado.",
  "selo.i1": "Escopo coberto e escopo explicitamente fora",
  "selo.i2": "Contagem de PASS, FAIL, UNKNOWN e SKIPPED",
  "selo.i3": "Data e alvo da última revalidação causal",
  "selo.i4": "Contraprovas que sobreviveram ao Fable Loop",
  "selo.stamp": "PROVA ANTES DO SELO",

  "pack.kicker": "Pacotão",
  "pack.title": "Local, online e distribuível",
  "pack.lead":
    "O mesmo núcleo roda offline na sua máquina, hospedado na web ou empacotado para entregar a outra pessoa.",
  "pack.local": "Local-first",
  "pack.locald":
    "Roda sem backend obrigatório, sem chave e sem depender de serviço externo.",
  "pack.online": "Online",
  "pack.onlined":
    "Publicação estática, carregamento rápido e nenhuma sessão obrigatória.",
  "pack.dist": "Distribuível",
  "pack.distd":
    "Exportável como pacote fechado: doutrina, ledger e selo viajam juntos.",

  "prov.title": "Aviso de provenance",
  "prov.body":
    "Este site descreve doutrina, método e estados de prova. Ele NÃO afirma nada sobre o estado atual de repositórios, branches, commits, CI ou qualquer sistema externo. Qualquer alegação desse tipo permanece UNKNOWN até ser verificada contra o estado vivo, na hora, com evidência anexada.",
  "prov.tag": "Estado externo: UNKNOWN",

  "cta.line1": "NÃO FAZ MAIS.",
  "cta.line2": "FAZ CERTO ONDE DÓI.",
  "cta.line3": "PROVA. COSTURA. SEGUE.",
  "cta.sub": "Sem prova, é só opinião com boa iluminação.",

  "footer.rights": "CentralDark — doutrina de prova, não promessa.",

  "seo.title": "CentralDark",
  "seo.desc":
    "Doutrina dark-neon de prova adversarial: estado vivo primeiro, Meta Lupa, Fable Loop, Judge, evidence ledger e cadeado derivado de prova.",
  "seo.imageAlt":
    "Cadeado dourado em wireframe com rastros de luz neon sobre fundo preto",

  "skip.main": "Pular para o conteúdo",
  "a11y.skip": "Pular para o conteúdo",
  "nav.menu": "Navegação principal",
  "nav.langs": "Escolher idioma",

  "pdf.kicker": "Exportação",
  "pdf.title": "Levar a doutrina em PDF",
  "pdf.lead":
    "Gera um PDF com layout responsivo, legível em preto e branco, e marcas de provenance impressas em cada exportação.",
  "pdf.full": "Exportar PDF completo",
  "pdf.key": "Exportar seções-chave",
  "pdf.lang": "Idioma",
  "pdf.date": "Gerado em",
  "pdf.source": "Origem",
  "pdf.hint":
    "Seções-chave = evolução, loop, evidence ledger, Selo do Castelo e aviso de provenance.",
};


const en: Dict = {
  "nav.evolucao": "Evolution",
  "nav.principios": "Principles",
  "nav.loop": "Loop",
  "nav.ledger": "Evidence Ledger",
  "nav.multimodal": "Multimodality",
  "nav.selo": "Castle Seal",
  "nav.pacotao": "Full Bundle",

  "hero.badge": "Emergent Superior Instinct",
  "hero.title": "CentralDark",
  "hero.subtitle": "Superior Instinct",
  "hero.lead":
    "Not an assistant that obeys. A system that doubts itself, attacks its own thesis and only locks the seal when the proof carries the weight.",
  "hero.cta1": "See the evolution",
  "hero.cta2": "Understand the loop",
  "hero.stat1": "Live state first",
  "hero.stat1d": "Nothing moves on assumption.",
  "hero.stat2": "One Writer per scope",
  "hero.stat2d": "One pen, zero collisions.",
  "hero.stat3": "UNKNOWN is not PASS",
  "hero.stat3d": "Silence is never approval.",

  "evo.kicker": "Timeline",
  "evo.title": "Six layers of maturing",
  "evo.lead":
    "No layer replaces the previous one: it becomes permanent muscle in the system.",
  "evo.1.name": "Ideator",
  "evo.1.desc":
    "The intention phase. Plenty of ideas, little friction with reality. Learns that desire is not evidence.",
  "evo.2.name": "Operator",
  "evo.2.desc":
    "Starts actually shipping. Hands dirty, narrow scope, concrete output — and the first pain of failing fast.",
  "evo.3.name": "Auditor",
  "evo.3.desc":
    "Begins demanding proof of its own work. Reading live state before acting is born here.",
  "evo.4.name": "Orchestrator",
  "evo.4.desc":
    "Coordinates scopes, roles and order. One Writer per scope, readers welcome, nobody overwrites anybody.",
  "evo.5.name": "Counterproof Designer",
  "evo.5.desc":
    "Flips the game: designs the test that kills its own thesis. If it survives, it starts to count.",
  "evo.6.name": "Emergent Superior Instinct",
  "evo.6.desc":
    "The reflex arrives ready: doubt in the right place, cut the excess, prove where it hurts, stitch what was left loose.",

  "prin.kicker": "Doctrine",
  "prin.title": "LESS IS MORE",
  "prin.lead":
    "Less surface, less noise, less promise. More proof per unit of effort.",
  "prin.1.t": "Live state first",
  "prin.1.d":
    "Before acting, read what exists now. Old memory is rumor, not state.",
  "prin.2.t": "One Writer per scope",
  "prin.2.d":
    "Only one agent writes in each territory. Reading is free, writing is exclusive.",
  "prin.3.t": "UNKNOWN / SKIPPED is not PASS",
  "prin.3.d":
    "Unverified stays unverified. Skipped stays visibly skipped, and the seal does not lock.",
  "prin.4.t": "Meta Lens",
  "prin.4.d":
    "The review of the review. Looks at what the first check let through, and why.",
  "prin.5.t": "Adversarial Fable Loop",
  "prin.5.d":
    "A hostile narrator builds plausible failure stories about the Meta Lens itself.",
  "prin.6.t": "Proof-derived lock",
  "prin.6.d":
    "The seal is not a mood call: it is an arithmetic consequence of the evidence.",

  "loop.kicker": "Diagram",
  "loop.title": "The loop that locks the seal",
  "loop.lead":
    "A circular flow: nothing is PROVEN by shortcut. Every pass can send an item back to UNKNOWN.",
  "loop.s1.t": "Live state",
  "loop.s1.d": "Raw reading of what exists right now.",
  "loop.s2.t": "Minimal execution",
  "loop.s2.d": "One Writer, one scope, the smallest useful step.",
  "loop.s3.t": "Meta Lens",
  "loop.s3.d": "Audit of the audit: where the check went soft.",
  "loop.s4.t": "Fable Loop",
  "loop.s4.d": "Adversarial counter-stories over the Meta Lens.",
  "loop.s5.t": "Judge",
  "loop.s5.d": "Confronts thesis and counterproof, assigns status.",
  "loop.s6.t": "Meta Lens²",
  "loop.s6.d": "Audits the Judge itself and the bias in the verdict.",
  "loop.s7.t": "Causal revalidation",
  "loop.s7.d": "Rebuilds the cause→effect chain against current state.",
  "loop.s8.t": "Lock",
  "loop.s8.d": "Derived from proof. No proof, no lock.",
  "loop.note":
    "Any stage can reopen the cycle. An old lock over new state becomes STALE.",

  "ledger.kicker": "Evidence Ledger",
  "ledger.title": "Seven states, zero ambiguity",
  "ledger.lead":
    "Every claim lives in one of these states. None of them is open to interpretation.",
  "ledger.pass": "Verified now against live state.",
  "ledger.fail": "A counterproof brought the thesis down.",
  "ledger.unknown": "Never verified. Does not count as success.",
  "ledger.skipped": "Deliberately unchecked. Stays visible as debt.",
  "ledger.stale": "Passed once, but state changed after. Needs revalidation.",
  "ledger.protected": "Locked without sufficient proof — suspicious seal.",
  "ledger.proven": "Survived the Fable Loop, the Judge and Meta Lens².",
  "ledger.col.status": "Status",
  "ledger.col.meaning": "Meaning",
  "ledger.col.lock": "Locks the seal?",
  "ledger.yes": "Yes",
  "ledger.no": "No",

  "multi.kicker": "Multimodality",
  "multi.title": "Same doctrine, any input",
  "multi.lead":
    "Text, image, audio, video, code and tabular data enter the same proof ritual.",
  "multi.text": "Text",
  "multi.textd": "Specs, logs, diffs and adversarial narratives.",
  "multi.image": "Image",
  "multi.imaged": "Screenshots as dated evidence, not decoration.",
  "multi.audio": "Audio",
  "multi.audiod": "Spoken intent and spoken review of counterproofs.",
  "multi.video": "Video",
  "multi.videod": "Step-by-step failure reproduction, end to end.",
  "multi.code": "Code",
  "multi.coded": "Real execution with output attached to the ledger.",
  "multi.data": "Data",
  "multi.datad": "Tables and metrics with declared provenance.",

  "lang.kicker": "Languages",
  "lang.title": "Full interface in three languages",
  "lang.lead":
    "Canonical content is written in standard Portuguese. The whole interface answers in pt-BR, en-US and es-ES — not just the menus.",
  "lang.current": "Active language",

  "selo.kicker": "Castle Seal",
  "selo.title": "A seal you can audit",
  "selo.lead":
    "The Castle Seal does not declare perfection: it declares exactly what was proven, when, and against which state.",
  "selo.i1": "Covered scope and explicitly out-of-scope",
  "selo.i2": "Counts of PASS, FAIL, UNKNOWN and SKIPPED",
  "selo.i3": "Date and target of the last causal revalidation",
  "selo.i4": "Counterproofs that survived the Fable Loop",
  "selo.stamp": "PROOF BEFORE SEAL",

  "pack.kicker": "Full Bundle",
  "pack.title": "Local, online and distributable",
  "pack.lead":
    "The same core runs offline on your machine, hosted on the web, or packaged to hand to someone else.",
  "pack.local": "Local-first",
  "pack.locald":
    "Runs with no mandatory backend, no key and no external service dependency.",
  "pack.online": "Online",
  "pack.onlined": "Static publishing, fast load, no mandatory session.",
  "pack.dist": "Distributable",
  "pack.distd":
    "Exportable as a closed bundle: doctrine, ledger and seal travel together.",

  "prov.title": "Provenance notice",
  "prov.body":
    "This site describes doctrine, method and proof states. It does NOT claim anything about the current state of repositories, branches, commits, CI or any external system. Any such claim stays UNKNOWN until verified against live state, at that moment, with evidence attached.",
  "prov.tag": "External state: UNKNOWN",

  "cta.line1": "NO MORE VOLUME.",
  "cta.line2": "DO IT RIGHT WHERE IT HURTS.",
  "cta.line3": "PROVE. STITCH. MOVE ON.",
  "cta.sub": "Without proof, it is just opinion under good lighting.",

  "footer.rights": "CentralDark — a doctrine of proof, not promise.",

  "seo.title": "CentralDark",
  "seo.desc":
    "Dark-neon doctrine of adversarial proof: live state first, Meta Lens, Fable Loop, Judge, evidence ledger and a proof-derived lock.",
  "seo.imageAlt":
    "Golden wireframe padlock with neon light trails over a black background",

  "skip.main": "Skip to content",
  "a11y.skip": "Skip to content",
  "nav.menu": "Main navigation",
  "nav.langs": "Choose language",

  "pdf.kicker": "Export",
  "pdf.title": "Take the doctrine as PDF",
  "pdf.lead":
    "Generates a PDF with responsive layout, readable in black and white, with provenance marks printed on every export.",
  "pdf.full": "Export full PDF",
  "pdf.key": "Export key sections",
  "pdf.lang": "Language",
  "pdf.date": "Generated at",
  "pdf.source": "Source",
  "pdf.hint":
    "Key sections = evolution, loop, evidence ledger, Castle Seal and provenance notice.",
};


const es: Dict = {
  "nav.evolucao": "Evolución",
  "nav.principios": "Principios",
  "nav.loop": "Loop",
  "nav.ledger": "Evidence Ledger",
  "nav.multimodal": "Multimodalidad",
  "nav.selo": "Sello del Castillo",
  "nav.pacotao": "Paquete completo",

  "hero.badge": "Instinto Superior emergente",
  "hero.title": "CentralDark",
  "hero.subtitle": "Instinto Superior",
  "hero.lead":
    "No es un asistente que obedece. Es un sistema que duda de sí mismo, ataca su propia tesis y solo cierra el sello cuando la prueba sostiene el peso.",
  "hero.cta1": "Ver la evolución",
  "hero.cta2": "Entender el loop",
  "hero.stat1": "Estado vivo primero",
  "hero.stat1d": "Nada avanza sobre suposiciones.",
  "hero.stat2": "Un Writer por ámbito",
  "hero.stat2d": "Una pluma, cero colisiones.",
  "hero.stat3": "UNKNOWN no es PASS",
  "hero.stat3d": "El silencio nunca es aprobación.",

  "evo.kicker": "Cronología",
  "evo.title": "Seis capas de madurez",
  "evo.lead":
    "Ninguna capa reemplaza a la anterior: se vuelve músculo permanente del sistema.",
  "evo.1.name": "Idealizador",
  "evo.1.desc":
    "La fase de la intención. Muchas ideas, poco roce con la realidad. Aprende que el deseo no es evidencia.",
  "evo.2.name": "Operador",
  "evo.2.desc":
    "Empieza a ejecutar de verdad. Manos a la obra, ámbito estrecho, entrega concreta — y el primer dolor de fallar rápido.",
  "evo.3.name": "Auditor",
  "evo.3.desc":
    "Empieza a exigir prueba de su propio trabajo. Aquí nace leer el estado vivo antes de actuar.",
  "evo.4.name": "Orquestador",
  "evo.4.desc":
    "Coordina ámbitos, roles y orden. Un Writer por ámbito, lectores bienvenidos, nadie escribe sobre nadie.",
  "evo.5.name": "Diseñador de Contrapruebas",
  "evo.5.desc":
    "Invierte el juego: diseña la prueba que mata su propia tesis. Si sobrevive, empieza a valer.",
  "evo.6.name": "Instinto Superior emergente",
  "evo.6.desc":
    "El reflejo ya viene listo: dudar en el lugar correcto, cortar el exceso, probar donde duele y coser lo que quedó suelto.",

  "prin.kicker": "Doctrina",
  "prin.title": "MENOS ES MÁS",
  "prin.lead":
    "Menos superficie, menos ruido, menos promesa. Más prueba por unidad de esfuerzo.",
  "prin.1.t": "Estado vivo primero",
  "prin.1.d":
    "Antes de actuar, leer lo que existe ahora. La memoria vieja es rumor, no estado.",
  "prin.2.t": "Un Writer por ámbito",
  "prin.2.d":
    "Solo un agente escribe en cada territorio. Leer es libre, escribir es exclusivo.",
  "prin.3.t": "UNKNOWN / SKIPPED no es PASS",
  "prin.3.d":
    "Lo no verificado sigue no verificado. Lo omitido queda visible, y el sello no cierra.",
  "prin.4.t": "Meta Lupa",
  "prin.4.d":
    "La revisión de la revisión. Mira lo que dejó pasar el primer control, y por qué.",
  "prin.5.t": "Fable Loop adversarial",
  "prin.5.d":
    "Un narrador hostil construye historias plausibles de fallo sobre la propia Meta Lupa.",
  "prin.6.t": "Cerradura derivada de prueba",
  "prin.6.d":
    "El sello no es cuestión de humor: es una consecuencia aritmética de la evidencia.",

  "loop.kicker": "Diagrama",
  "loop.title": "El loop que cierra el sello",
  "loop.lead":
    "Flujo circular: nada es PROVEN por atajo. Cada vuelta puede devolver un ítem a UNKNOWN.",
  "loop.s1.t": "Estado vivo",
  "loop.s1.d": "Lectura cruda de lo que existe ahora.",
  "loop.s2.t": "Ejecución mínima",
  "loop.s2.d": "Un Writer, un ámbito, el paso útil más pequeño.",
  "loop.s3.t": "Meta Lupa",
  "loop.s3.d": "Auditoría de la auditoría: dónde se aflojó el control.",
  "loop.s4.t": "Fable Loop",
  "loop.s4.d": "Contra-historias adversariales sobre la Meta Lupa.",
  "loop.s5.t": "Judge",
  "loop.s5.d": "Confronta tesis y contraprueba, asigna estado.",
  "loop.s6.t": "Meta Lupa²",
  "loop.s6.d": "Audita al propio Judge y el sesgo del veredicto.",
  "loop.s7.t": "Revalidación causal",
  "loop.s7.d": "Rehace la cadena causa→efecto contra el estado actual.",
  "loop.s8.t": "Cerradura",
  "loop.s8.d": "Derivada de la prueba. Sin prueba, sin cerradura.",
  "loop.note":
    "Cualquier etapa puede reabrir el ciclo. Una cerradura vieja con estado nuevo se vuelve STALE.",

  "ledger.kicker": "Evidence Ledger",
  "ledger.title": "Siete estados, cero ambigüedad",
  "ledger.lead":
    "Toda afirmación vive en uno de estos estados. Ninguno queda abierto a interpretación.",
  "ledger.pass": "Verificado ahora contra el estado vivo.",
  "ledger.fail": "Una contraprueba derribó la tesis.",
  "ledger.unknown": "Nunca verificado. No cuenta como éxito.",
  "ledger.skipped": "Deliberadamente no verificado. Queda visible como deuda.",
  "ledger.stale": "Pasó una vez, pero el estado cambió después. Requiere revalidación.",
  "ledger.protected": "Cerrado sin prueba suficiente — sello sospechoso.",
  "ledger.proven": "Sobrevivió al Fable Loop, al Judge y a la Meta Lupa².",
  "ledger.col.status": "Estado",
  "ledger.col.meaning": "Significado",
  "ledger.col.lock": "¿Cierra el sello?",
  "ledger.yes": "Sí",
  "ledger.no": "No",

  "multi.kicker": "Multimodalidad",
  "multi.title": "Misma doctrina, cualquier entrada",
  "multi.lead":
    "Texto, imagen, audio, video, código y datos tabulares entran en el mismo rito de prueba.",
  "multi.text": "Texto",
  "multi.textd": "Especificaciones, logs, diffs y narrativas adversariales.",
  "multi.image": "Imagen",
  "multi.imaged": "Capturas como evidencia fechada, no como adorno.",
  "multi.audio": "Audio",
  "multi.audiod": "Dictado de intención y revisión hablada de contrapruebas.",
  "multi.video": "Video",
  "multi.videod": "Reproducción del fallo paso a paso, de punta a punta.",
  "multi.code": "Código",
  "multi.coded": "Ejecución real con salida adjunta al ledger.",
  "multi.data": "Datos",
  "multi.datad": "Tablas y métricas con origen declarado.",

  "lang.kicker": "Idiomas",
  "lang.title": "Interfaz completa en tres idiomas",
  "lang.lead":
    "El contenido canónico se escribe en portugués estándar. Toda la interfaz responde en pt-BR, en-US y es-ES — no solo los menús.",
  "lang.current": "Idioma activo",

  "selo.kicker": "Sello del Castillo",
  "selo.title": "Un sello que puedes auditar",
  "selo.lead":
    "El Sello del Castillo no declara perfección: declara exactamente qué se probó, cuándo y contra qué estado.",
  "selo.i1": "Ámbito cubierto y ámbito explícitamente fuera",
  "selo.i2": "Conteo de PASS, FAIL, UNKNOWN y SKIPPED",
  "selo.i3": "Fecha y objetivo de la última revalidación causal",
  "selo.i4": "Contrapruebas que sobrevivieron al Fable Loop",
  "selo.stamp": "PRUEBA ANTES DEL SELLO",

  "pack.kicker": "Paquete completo",
  "pack.title": "Local, online y distribuible",
  "pack.lead":
    "El mismo núcleo corre offline en tu máquina, alojado en la web o empaquetado para entregar a otra persona.",
  "pack.local": "Local-first",
  "pack.locald":
    "Corre sin backend obligatorio, sin clave y sin depender de servicios externos.",
  "pack.online": "Online",
  "pack.onlined": "Publicación estática, carga rápida y ninguna sesión obligatoria.",
  "pack.dist": "Distribuible",
  "pack.distd":
    "Exportable como paquete cerrado: doctrina, ledger y sello viajan juntos.",

  "prov.title": "Aviso de provenance",
  "prov.body":
    "Este sitio describe doctrina, método y estados de prueba. NO afirma nada sobre el estado actual de repositorios, ramas, commits, CI ni ningún sistema externo. Cualquier afirmación así permanece UNKNOWN hasta ser verificada contra el estado vivo, en ese momento, con evidencia adjunta.",
  "prov.tag": "Estado externo: UNKNOWN",

  "cta.line1": "NO HACE MÁS.",
  "cta.line2": "HACE BIEN DONDE DUELE.",
  "cta.line3": "PRUEBA. COSE. SIGUE.",
  "cta.sub": "Sin prueba, es solo opinión con buena iluminación.",

  "footer.rights": "CentralDark — doctrina de prueba, no de promesa.",

  "seo.title": "CentralDark",
  "seo.desc":
    "Doctrina dark-neon de prueba adversarial: estado vivo primero, Meta Lupa, Fable Loop, Judge, evidence ledger y sello derivado de prueba.",
  "seo.imageAlt":
    "Candado dorado en wireframe con trazos de luz neón sobre fondo negro",

  "skip.main": "Saltar al contenido",
  "a11y.skip": "Saltar al contenido",
  "nav.menu": "Navegación principal",
  "nav.langs": "Elegir idioma",

  "pdf.kicker": "Exportación",
  "pdf.title": "Llevar la doctrina en PDF",
  "pdf.lead":
    "Genera un PDF con diseño responsivo, legible en blanco y negro, con marcas de provenance impresas en cada exportación.",
  "pdf.full": "Exportar PDF completo",
  "pdf.key": "Exportar secciones clave",
  "pdf.lang": "Idioma",
  "pdf.date": "Generado el",
  "pdf.source": "Origen",
  "pdf.hint":
    "Secciones clave = evolución, loop, evidence ledger, Sello del Castillo y aviso de provenance.",
};


const DICTS: Record<Lang, Dict> = { "pt-BR": pt, "en-US": en, "es-ES": es };

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("pt-BR");

  // Restaura a escolha do visitante somente após a hidratação
  // (?lang= na URL tem prioridade, pois é o link compartilhável por idioma)
  useEffect(() => {
    try {
      const daUrl = new URLSearchParams(window.location.search).get(
        "lang",
      ) as Lang | null;
      if (daUrl && daUrl in DICTS) {
        setLang(daUrl);
        return;
      }
      const saved = localStorage.getItem("centraldark-lang") as Lang | null;
      if (saved && saved in DICTS) setLang(saved);
    } catch {
      /* armazenamento indisponível: mantém pt-BR */
    }
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem("centraldark-lang", lang);
    } catch {
      /* ignora */
    }
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key: string) => {
        const v = DICTS[lang][key] ?? DICTS["pt-BR"][key] ?? key;
        return Array.isArray(v) ? v.join(" ") : v;
      },
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n precisa estar dentro de I18nProvider");
  return ctx;
}
