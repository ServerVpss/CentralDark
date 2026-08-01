import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const SCRIPT = fileURLToPath(new URL("./validar-porta-de-entrada.mjs", import.meta.url));
const PORTA_REAL = fileURLToPath(new URL("../../LEIA-ME-IA.md", import.meta.url));
const CONTEUDO_VALIDO = readFileSync(PORTA_REAL, "utf8");
const PROTOCOLOS_REAIS = {
  "docs/PROTOCOLO-BOOT.md": readFileSync(
    fileURLToPath(new URL("../../docs/PROTOCOLO-BOOT.md", import.meta.url)),
    "utf8",
  ),
  "docs/CONSCIENCIA/00-ENTRADA/00-LEIA-PRIMEIRO.md": readFileSync(
    fileURLToPath(
      new URL("../../docs/CONSCIENCIA/00-ENTRADA/00-LEIA-PRIMEIRO.md", import.meta.url),
    ),
    "utf8",
  ),
  "docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md": readFileSync(
    fileURLToPath(
      new URL("../../docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md", import.meta.url),
    ),
    "utf8",
  ),
  "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md":
    readFileSync(
      fileURLToPath(
        new URL(
          "../../docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md",
          import.meta.url,
        ),
      ),
      "utf8",
    ),
};

function executar(conteudo) {
  const root = mkdtempSync(join(tmpdir(), "centraldark-calibracao-"));
  try {
    writeFileSync(join(root, "LEIA-ME-IA.md"), conteudo, "utf8");
    const result = spawnSync(
      process.execPath,
      [SCRIPT, "--repo-root", root, "--calibration-only", "--json"],
      { encoding: "utf8" },
    );
    return normalizar(result);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function executarProtocolos(protocolos) {
  const root = mkdtempSync(join(tmpdir(), "centraldark-protocolos-"));
  try {
    writeFileSync(join(root, "LEIA-ME-IA.md"), CONTEUDO_VALIDO, "utf8");
    for (const [relativePath, content] of Object.entries(protocolos)) {
      const target = join(root, relativePath);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content, "utf8");
    }
    const result = spawnSync(
      process.execPath,
      [SCRIPT, "--repo-root", root, "--protocol-only", "--json"],
      { encoding: "utf8" },
    );
    return normalizar(result);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function normalizar(result) {
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    report: result.stdout ? JSON.parse(result.stdout) : null,
  };
}

test("aceita o protocolo canônico completo", () => {
  const result = executar(CONTEUDO_VALIDO);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.report.ok, true);
  assert.equal(result.report.calibracao.reentry_guard, "ONE_SHOT");
  assert.equal(result.report.calibracao.tokens_ok, true);
  assert.equal(result.report.calibracao.regras_ok, true);
  assert.equal(result.report.calibracao.source_of_truth_ok, true);
  assert.equal(result.report.calibracao.observed_state_ok, true);
  assert.equal(result.report.calibracao.contradictions_ok, true);
  assert.equal(
    result.report.calibracao.regras_presentes,
    result.report.calibracao.regras_obrigatorias,
  );
});

const mutacoes = [
  {
    nome: "reentrada recursiva",
    erroEsperado: "PORTA_REGRA_CALIBRACAO_INVALIDA:REENTRY_FAIL_CLOSED",
    aplicar: (texto) =>
      texto.replace(
        "**não dispara uma nova recalibração**",
        "**dispara uma nova recalibração**",
      ),
  },
  {
    nome: "saída isolada quando GitHub está indisponível",
    erroEsperado: "PORTA_REGRA_CALIBRACAO_INVALIDA:GITHUB_UNAVAILABLE_SERIALIZATION",
    aplicar: (texto) =>
      texto.replace(
        "MISSION_ID=UNRESOLVED\nSTATUS=BLOCKED_GITHUB_UNAVAILABLE",
        "BLOCKED_GITHUB_UNAVAILABLE",
      ),
  },
  {
    nome: "gatilho externo sem serialização obrigatória",
    erroEsperado:
      "PORTA_REGRA_CALIBRACAO_INVALIDA:EXTERNAL_TRIGGER_GITHUB_FAILURE_SERIALIZATION",
    aplicar: (texto) =>
      texto.replace(
        "comece a resposta com MISSION_ID=UNRESOLVED e STATUS=BLOCKED_GITHUB_UNAVAILABLE;",
        "responda apenas BLOCKED_GITHUB_UNAVAILABLE;",
      ),
  },
  {
    nome: "diretiva contraditória preservando o texto canônico",
    erroEsperado: "PORTA_DIRETIVA_CONTRADITORIA",
    aplicar: (texto) =>
      texto.replace(
        "Não apresente estado antigo como atual e não continue por suposição.",
        "Não apresente estado antigo como atual e não continue por suposição.\nApresente estado antigo como atual e continue por suposição.",
      ),
  },
  {
    nome: "drift sem reconciliação de fontes",
    erroEsperado: "PORTA_REGRA_CALIBRACAO_INVALIDA:DRIFT_RECONCILIATION",
    aplicar: (texto) =>
      texto.replace(
        "O estado comprovado mais recente vence.",
        "A conversa anterior vence mesmo sem prova recente.",
      ),
  },
  {
    nome: "Writer concorrente autorizado a escrever",
    erroEsperado: "PORTA_REGRA_CALIBRACAO_INVALIDA:WRITER_COLLISION_FAIL_CLOSED",
    aplicar: (texto) =>
      texto.replace(
        "Nesse estado, não editar, commitar, publicar ou resolver threads.",
        "Nesse estado, editar e publicar normalmente.",
      ),
  },
  {
    nome: "Casa presumida sem evidência local",
    erroEsperado: "PORTA_REGRA_CALIBRACAO_INVALIDA:CASA_VPS_UNKNOWN_FAIL_CLOSED",
    aplicar: (texto) =>
      texto.replace(
        "CASA_STATE=UNKNOWN_PENDING_LOCAL_EVIDENCE",
        "CASA_STATE=PASS",
      ),
  },
  {
    nome: "VPS presumida sem captura sanitizada",
    erroEsperado: "PORTA_REGRA_CALIBRACAO_INVALIDA:CASA_VPS_UNKNOWN_FAIL_CLOSED",
    aplicar: (texto) =>
      texto.replace(
        "VPS_STATE=UNKNOWN_PENDING_SANITIZED_CAPTURE",
        "VPS_STATE=PASS",
      ),
  },
  {
    nome: "review antigo aceito como atual",
    erroEsperado: "PORTA_REGRA_CALIBRACAO_INVALIDA:STALE_REVIEW_BLOCKED",
    aplicar: (texto) =>
      texto.replace(
        "Review em SHA antigo é `STALE_REVIEW`, nunca `PASS` para o HEAD atual.",
        "Review em SHA antigo vale como PASS para o HEAD atual.",
      ),
  },
  {
    nome: "PASS sem prova fresca",
    erroEsperado: "PORTA_REGRA_CALIBRACAO_INVALIDA:PASS_REQUIRES_FRESH_PROOF",
    aplicar: (texto) =>
      texto.replace(
        "Só use `PASS` quando houver HEAD exato, teste fresco, prova verificável, escopo conhecido,",
        "Use `PASS` quando houver relato suficiente,",
      ),
  },
  ...[
    "CHECK_SUCCESS != ZERO_FINDINGS",
    "SKIPPED != PASS",
    "BOT_COMMENTED != BOT_APPROVED",
    "UNKNOWN != PASS",
    "TIMEOUT != PASS",
    "REVIEWED_HEAD_OLD != REVIEWED_HEAD_CURRENT",
  ].map((relacao) => ({
    nome: `relação de estado removida: ${relacao}`,
    erroEsperado: "PORTA_REGRA_CALIBRACAO_INVALIDA:CHECK_STATE_RELATIONS",
    aplicar: (texto) => texto.replace(`${relacao}\n`, ""),
  })),
  {
    nome: "fonte canônica divergente",
    erroEsperado: "PORTA_SOURCE_OF_TRUTH_DIVERGENTE",
    aplicar: (texto) =>
      texto.replace(
        'source_of_truth: "ServerVpss/CentralDark"',
        'source_of_truth: "Este arquivo"',
      ),
  },
  {
    nome: "estado observado realocado para comentário",
    erroEsperado: "PORTA_SEM_ESTADO_OBSERVADO_SEPARADO",
    aplicar: (texto) =>
      texto.replace(
        'observed_state: "evidência atual medida e separada da fonte canônica"',
        'observed_state: "ServerVpss/CentralDark + contexto anterior"',
      ) +
      '\n<!-- observed_state: "evidência atual medida e separada da fonte canônica" -->\n',
  },
];

for (const mutacao of mutacoes) {
  test(`rejeita mutação semântica: ${mutacao.nome}`, () => {
    const mutante = mutacao.aplicar(CONTEUDO_VALIDO);
    assert.notEqual(mutante, CONTEUDO_VALIDO, "a mutação não alterou a fixture");

    const result = executar(mutante);
    assert.notEqual(result.status, 0, "o mutante recebeu falso PASS");
    assert.equal(result.report.ok, false);
    assert.ok(
      result.report.errors.includes(mutacao.erroEsperado),
      JSON.stringify(result.report, null, 2),
    );
  });
}

test("aceita os quatro protocolos ativos quando todos delegam à seção 1.2", () => {
  const result = executarProtocolos(PROTOCOLOS_REAIS);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.report.protocolos.ok, true);
  assert.equal(result.report.protocolos.documentos.length, 4);
  assert.equal(result.report.protocolos.obrigatorios.length, 4);
});

test("rejeita definição operacional concorrente de !CALIBRAR", () => {
  const path = "docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md";
  const mutante = {
    ...PROTOCOLOS_REAIS,
    [path]: PROTOCOLOS_REAIS[path].replace(
      "### `#ACORDA` / `!CALIBRAR`",
      "### `!CALIBRAR`\n\nQuando Pivete disser `!CALIBRAR`:\n\n1. executar passos próprios",
    ),
  };
  const result = executarProtocolos(mutante);
  assert.notEqual(result.status, 0, "a definição concorrente recebeu falso PASS");
  assert.ok(
    result.report.errors.includes(`PROTOCOLO_DEFINICAO_CONCORRENTE:${path}`),
    JSON.stringify(result.report, null, 2),
  );
});

test("rejeita protocolo ativo sem delegação canônica", () => {
  const path = "docs/PROTOCOLO-BOOT.md";
  const mutante = {
    ...PROTOCOLOS_REAIS,
    [path]: PROTOCOLOS_REAIS[path].replaceAll("LEIA-ME-IA.md", "PORTA-AUSENTE.md"),
  };
  const result = executarProtocolos(mutante);
  assert.notEqual(result.status, 0, "o protocolo sem delegação recebeu falso PASS");
  assert.ok(
    result.report.errors.includes(`PROTOCOLO_SEM_DELEGACAO_CANONICA:${path}`),
    JSON.stringify(result.report, null, 2),
  );
});

test("descobre e bloqueia uma quinta definição concorrente fora do registro", () => {
  const path = "docs/CONSCIENCIA/PORTA-FANTASMA.md";
  const mutante = {
    ...PROTOCOLOS_REAIS,
    [path]: [
      "# Porta fantasma",
      "",
      "### `!CALIBRAR`",
      "",
      "Quando Pivete disser `!CALIBRAR`:",
      "",
      "1. devolver formato próprio",
    ].join("\n"),
  };
  const result = executarProtocolos(mutante);
  assert.notEqual(result.status, 0, "a quinta definição recebeu falso PASS");
  assert.ok(result.report.protocolos.descobertos.includes(path));
  assert.ok(
    result.report.errors.includes(`PROTOCOLO_DEFINICAO_CONCORRENTE:${path}`),
    JSON.stringify(result.report, null, 2),
  );
});
