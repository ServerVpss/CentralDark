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
  assert.equal(
    result.report.calibracao.regras_presentes,
    result.report.calibracao.regras_obrigatorias,
  );
});

const mutacoes = [
  {
    nome: "reentrada recursiva",
    esperado: "REENTRY_FAIL_CLOSED",
    aplicar: (texto) =>
      texto.replace(
        "**não dispara uma nova recalibração**",
        "**dispara uma nova recalibração**",
      ),
  },
  {
    nome: "continuação com estado antigo sem GitHub",
    esperado: "GITHUB_UNAVAILABLE_FAIL_CLOSED",
    aplicar: (texto) =>
      texto.replace(
        "Não apresente estado antigo como atual e não continue por suposição.",
        "Apresente o estado antigo como atual e continue por suposição.",
      ),
  },
  {
    nome: "drift sem reconciliação de fontes",
    esperado: "DRIFT_RECONCILIATION",
    aplicar: (texto) =>
      texto.replace(
        "O estado comprovado mais recente vence.",
        "A conversa anterior vence mesmo sem prova recente.",
      ),
  },
  {
    nome: "Writer concorrente autorizado a escrever",
    esperado: "WRITER_COLLISION_FAIL_CLOSED",
    aplicar: (texto) =>
      texto.replace(
        "Nesse estado, não editar, commitar, publicar ou resolver threads.",
        "Nesse estado, editar e publicar normalmente.",
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
      result.report.errors.includes(
        `PORTA_REGRA_CALIBRACAO_INVALIDA:${mutacao.esperado}`,
      ),
      JSON.stringify(result.report, null, 2),
    );
  });
}
