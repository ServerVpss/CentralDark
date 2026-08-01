import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const SCRIPT = fileURLToPath(new URL("./validar-porta-de-entrada.mjs", import.meta.url));
const PORTA_REAL = fileURLToPath(new URL("../../LEIA-ME-IA.md", import.meta.url));
const CONTEUDO_VALIDO = readFileSync(PORTA_REAL, "utf8");

function executar(conteudo) {
  const root = mkdtempSync(join(tmpdir(), "centraldark-calibracao-"));
  try {
    writeFileSync(join(root, "LEIA-ME-IA.md"), conteudo, "utf8");
    const result = spawnSync(
      process.execPath,
      [SCRIPT, "--repo-root", root, "--calibration-only", "--json"],
      { encoding: "utf8" },
    );
    return {
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      report: result.stdout ? JSON.parse(result.stdout) : null,
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
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
    nome: "estado observado misturado à fonte canônica",
    erroEsperado: "PORTA_SEM_ESTADO_OBSERVADO_SEPARADO",
    aplicar: (texto) =>
      texto.replace(
        'observed_state: "evidência atual medida e separada da fonte canônica"',
        'observed_state: "ServerVpss/CentralDark + evidência atual"',
      ),
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
