import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Resposta = { id: string; texto: string };
type Questao = {
  id: string;
  contexto: string;
  enunciado: string;
  opcoes: readonly Resposta[];
  correta: string;
  explicacao: string;
  fonte: string;
};

const questoes: readonly Questao[] = [
  {
    id: "STALE",
    contexto: "Hermes / horário da evidência",
    enunciado:
      "O Hermes teve PASS às 10h. Agora são 15h e não houve nova medição. Qual estado atual pode ser afirmado?",
    opcoes: [
      { id: "pass", texto: "PASS, pois funcionava às 10h" },
      { id: "fail", texto: "FAIL, porque não foi medido novamente" },
      { id: "stale", texto: "STALE/UNKNOWN, preservando a prova das 10h" },
      { id: "nao-sei", texto: "Não sei ainda; quero entender" },
    ],
    correta: "stale",
    explicacao:
      "PASS histórico não comprova o presente. Sem nova medição, não há prova de falha nem de funcionamento atual.",
    fonte: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml",
  },
  {
    id: "FAIL",
    contexto: "Reality Judge / contraprova",
    enunciado:
      "O Cockpit ainda mostra verde, mas uma medição atual e válida confirmou falha do serviço. O que mostrar?",
    opcoes: [
      { id: "pass", texto: "PASS, porque o painel já estava verde" },
      { id: "fail", texto: "FAIL, com origem, horário e evidência da falha" },
      { id: "unknown", texto: "UNKNOWN, ignorando a medição da falha" },
      { id: "nao-sei", texto: "Não sei ainda; quero entender" },
    ],
    correta: "fail",
    explicacao:
      "A medida atual comprovada prevalece sobre a cor antiga. Exibir falha com fonte e horário, preservando o registro histórico.",
    fonte: "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md",
  },
  {
    id: "MERGED",
    contexto: "Forja / prova de integração",
    enunciado:
      "Uma PR foi mergeada com sucesso, mas não há teste da interface nem readback do runtime. O que está provado?",
    opcoes: [
      {
        id: "running",
        texto: "Que a funcionalidade já funciona para o cliente",
      },
      {
        id: "merged",
        texto: "Somente o merge; execução e deploy seguem não comprovados",
      },
      { id: "fail", texto: "Que a aplicação está quebrada" },
      { id: "nao-sei", texto: "Não sei ainda; quero entender" },
    ],
    correta: "merged",
    explicacao:
      "MERGED não é DEPLOYED ou UI_PROVEN. O recibo do Git prova a integração do código, não a execução no serviço.",
    fonte: "docs/CONSCIENCIA/ESCOLA-HERMES-CASA.md",
  },
];

type Props = { contexto?: "visao" | "forja" };

/**
 * Microestudo opt-in do Cockpit. Conteúdo estático demonstrativo:
 * não consulta o runtime, não registra respostas e nunca concede autorização.
 * A Escola, a Memória e o Reality Judge continuam nos seus owners existentes.
 */
export function EstudoPorCriterios({ contexto = "visao" }: Props) {
  const uid = useId();
  const [aberto, definirAberto] = useState(false);
  const [indice, definirIndice] = useState(0);
  const [resposta, definirResposta] = useState("");
  const [conferida, definirConferida] = useState(false);
  const [evidenciaAberta, definirEvidenciaAberta] = useState(false);
  const atual = questoes[indice] ?? questoes[0]!;
  const correta = resposta === atual.correta;
  const semResposta = resposta === "nao-sei";

  function proxima() {
    definirIndice((anterior) => (anterior + 1) % questoes.length);
    definirResposta("");
    definirConferida(false);
    definirEvidenciaAberta(false);
  }

  return (
    <section
      aria-label="Aprendizado por critérios"
      className="mt-6 rounded-xl border border-border bg-background/70 p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-neon-blue">
            Escola · Aprendizado por critérios
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {contexto === "forja"
              ? "Entenda a prova antes de operar na Forja."
              : "Entenda os indicadores sem sair do Cockpit."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => definirAberto(!aberto)}
          aria-expanded={aberto}
        >
          {aberto ? "Fechar estudo" : "Estudar por critérios"}
        </Button>
      </div>
      {!aberto ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Opcional, sem pontuação, sem gravar respostas e sem executar comandos.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Questão {indice + 1} de {questoes.length} · {atual.contexto}
          </p>
          <h3 className="text-base font-semibold leading-relaxed">{atual.enunciado}</h3>
          <RadioGroup
            value={resposta}
            onValueChange={(valor) => {
              definirResposta(valor);
              definirConferida(false);
              definirEvidenciaAberta(false);
            }}
            aria-label="Escolha sua resposta"
            disabled={conferida}
          >
            {atual.opcoes.map((opcao) => (
              <div
                key={opcao.id}
                className="flex min-h-11 items-center gap-3 rounded-md border border-border px-3 py-2"
              >
                <RadioGroupItem id={uid + "-" + opcao.id} value={opcao.id} />
                <label
                  htmlFor={uid + "-" + opcao.id}
                  className="flex min-h-9 flex-1 cursor-pointer items-center text-sm"
                >
                  {opcao.texto}
                </label>
              </div>
            ))}
          </RadioGroup>
          {!conferida ? (
            <Button type="button" disabled={!resposta} onClick={() => definirConferida(true)}>
              {semResposta ? "Me explica" : "Conferir resposta"}
            </Button>
          ) : (
            <div
              className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
              role="status"
              aria-live="polite"
            >
              <p className="font-semibold">
                {semResposta
                  ? "Entenda o critério:"
                  : correta
                    ? "Correto — critério reconhecido."
                    : "Veja o critério e tente a próxima:"}
              </p>
              <p className="text-sm">{atual.explicacao}</p>
              <p className="text-xs text-muted-foreground">
                Este é um exemplo didático, não uma medição real de serviços.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => definirEvidenciaAberta(!evidenciaAberta)}
                >
                  {evidenciaAberta ? "Ocultar fonte" : "Ver fonte"}
                </Button>
                <Button type="button" onClick={proxima}>
                  Próxima questão
                </Button>
              </div>
              {evidenciaAberta && (
                <p className="text-xs">
                  Fonte canônica:{" "}
                  <a
                    className="break-all underline"
                    href={"https://github.com/ServerVpss/CentralDark/blob/main/" + atual.fonte}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {atual.fonte}
                  </a>
                  . A explicação é derivada do contrato; o exercício não usa dados pessoais nem
                  prova o runtime.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
