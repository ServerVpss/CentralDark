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
    contexto: "Hermes / hor??rio da evid??ncia",
    enunciado:
      "O Hermes teve PASS ??s 10h. Agora s??o 15h e n??o houve nova medi????o. Qual estado atual pode ser afirmado?",
    opcoes: [
      { id: "pass", texto: "PASS, pois funcionava ??s 10h" },
      { id: "fail", texto: "FAIL, porque n??o foi medido novamente" },
      { id: "stale", texto: "STALE/UNKNOWN, preservando a prova das 10h" },
      { id: "nao-sei", texto: "N??o sei ainda; quero entender" },
    ],
    correta: "stale",
    explicacao:
      "PASS hist??rico n??o comprova o presente. Sem nova medi????o, n??o h?? prova de falha nem de funcionamento atual.",
    fonte: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml",
  },
  {
    id: "FAIL",
    contexto: "Reality Judge / contraprova",
    enunciado:
      "O Cockpit ainda mostra verde, mas uma medi????o atual e v??lida confirmou falha do servi??o. O que mostrar?",
    opcoes: [
      { id: "pass", texto: "PASS, porque o painel j?? estava verde" },
      { id: "fail", texto: "FAIL, com origem, hor??rio e evid??ncia da falha" },
      { id: "unknown", texto: "UNKNOWN, ignorando a medi????o da falha" },
      { id: "nao-sei", texto: "N??o sei ainda; quero entender" },
    ],
    correta: "fail",
    explicacao:
      "A medida atual comprovada prevalece sobre a cor antiga. Exibir falha com fonte e hor??rio, preservando o registro hist??rico.",
    fonte: "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md",
  },
  {
    id: "MERGED",
    contexto: "Forja / prova de integra????o",
    enunciado:
      "Uma PR foi mergeada com sucesso, mas n??o h?? teste da interface nem readback do runtime. O que est?? provado?",
    opcoes: [
      {
        id: "running",
        texto: "Que a funcionalidade j?? funciona para o cliente",
      },
      {
        id: "merged",
        texto: "Somente o merge; execu????o e deploy seguem n??o comprovados",
      },
      { id: "fail", texto: "Que a aplica????o est?? quebrada" },
      { id: "nao-sei", texto: "N??o sei ainda; quero entender" },
    ],
    correta: "merged",
    explicacao:
      "MERGED n??o ?? DEPLOYED ou UI_PROVEN. O recibo do Git prova a integra????o do c??digo, n??o a execu????o no servi??o.",
    fonte: "docs/CONSCIENCIA/ESCOLA-HERMES-CASA.md",
  },
];

type Props = { contexto?: "visao" | "forja" };

/**
 * Microestudo opt-in do Cockpit. Conte??do est??tico demonstrativo:
 * n??o consulta o runtime, n??o registra respostas e nunca concede autoriza????o.
 * A Escola, a Mem??ria e o Reality Judge continuam nos seus owners existentes.
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
      aria-label="Aprendizado por crit??rios"
      className="mt-6 rounded-xl border border-border bg-background/70 p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-neon-blue">
            Escola ?? Aprendizado por crit??rios
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
          {aberto ? "Fechar estudo" : "Estudar por crit??rios"}
        </Button>
      </div>
      {!aberto ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Opcional, sem pontua????o, sem gravar respostas e sem executar comandos.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Quest??o {indice + 1} de {questoes.length} ?? {atual.contexto}
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
                  ? "Entenda o crit??rio:"
                  : correta
                    ? "Correto ??? crit??rio reconhecido."
                    : "Veja o crit??rio e tente a pr??xima:"}
              </p>
              <p className="text-sm">{atual.explicacao}</p>
              <p className="text-xs text-muted-foreground">
                Este ?? um exemplo did??tico, n??o uma medi????o real de servi??os.
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
                  Pr??xima quest??o
                </Button>
              </div>
              {evidenciaAberta && (
                <p className="text-xs">
                  Fonte can??nica:{" "}
                  <a
                    className="break-all underline"
                    href={"https://github.com/ServerVpss/CentralDark/blob/main/" + atual.fonte}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {atual.fonte}
                  </a>
                  . A explica????o ?? derivada do contrato; o exerc??cio n??o usa dados pessoais nem
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
