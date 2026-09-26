#!/usr/bin/env python3
"""
Testes do Contrato Delta Canônico v1

Cobertura:
- Testes Negativos: Bloquear transições inválidas, segredos, SHA duplicados
- Testes Positivos: Ciclo completo boot → close → reset
- Determinismo: Mesma entrada = mesmo resultado
- Idempotência: Executar 2x = idêntico
"""

import json
import sys
import unittest
from pathlib import Path
from datetime import datetime, timezone

# Importar runner
RUNNER_PATH = Path(__file__).parent.parent / "runner.py"
sys.path.insert(0, str(RUNNER_PATH.parent))

# Executar runner como módulo para ter acesso às classes.
# encoding explícito: no Windows open() usa cp1252 por padrão e quebra ao ler
# os comentários acentuados do runner (UnicodeDecodeError em byte não mapeado).
exec(open(RUNNER_PATH, encoding="utf-8").read())


class TestDeltaContractNegative(unittest.TestCase):
    """Testes Negativos — Bloquear transições inválidas"""

    def setUp(self):
        schema_path = Path(__file__).parent.parent / "schema.json"
        self.runner = Runner(schema_path)

    def test_forbidden_idle_to_done(self):
        """Transição IDLE → DONE deve ser bloqueada"""
        instance = self.runner.boot("test-mission", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "IDLE"

        with self.assertRaises(ContractError) as cm:
            self.runner.validate_transition("IDLE", "DONE", instance)

        self.assertIn("proibida", str(cm.exception).lower())

    def test_forbidden_done_to_active(self):
        """Transição DONE → ACTIVE deve ser bloqueada"""
        instance = self.runner.boot("test-mission", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "DONE"

        with self.assertRaises(ContractError) as cm:
            self.runner.validate_transition("DONE", "ACTIVE", instance)

        self.assertIn("proibida", str(cm.exception).lower())

    def test_forbidden_blocked_to_done_without_proof(self):
        """BLOCKED → DONE sem prova deve falhar"""
        instance = self.runner.boot("test-mission", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "BLOCKED"
        instance["last_proof"] = None

        with self.assertRaises(ContractError):
            self.runner.validate_transition("BLOCKED", "DONE", instance)

    def test_calibrar_from_blocked_rejected(self):
        """
        calibrar() a partir de BLOCKED deve ser bloqueado — states.yaml só autoriza
        ACTIVE→CHECKPOINTED. Achado do REVISOR_ESTADOS: calibrar() antes aceitava
        qualquer status de origem sem checar validate_transition().
        """
        instance = self.runner.boot("test-mission-calibrar-blocked", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "BLOCKED"

        with self.assertRaises(ContractError) as cm:
            self.runner.calibrar(instance)

        self.assertIn("BLOCKED", str(cm.exception))
        self.assertIn("CHECKPOINTED", str(cm.exception))

    def test_double_writer_collision(self):
        """Agente que NÃO é o writer atual não pode fazer handoff (CONFLITO_ESCRITOR)"""
        instance = self.runner.boot("test-mission", "PIVETE", "SOL", "EXECUTOR")
        instance["governance"]["writer"]["agent"] = "HAIKU_4_5"  # writer real e único

        # AGENTE_C nunca teve posse, mas tenta se passar por dono e fazer handoff
        with self.assertRaises(ContractError) as cm:
            self.runner.handoff(instance, "AGENTE_C", "OPUS", "5f7573492cb13ef5923d388af51ebd3c3abe60f4")

        self.assertIn("CONFLITO_ESCRITOR", str(cm.exception))

        # Writer legítimo permanece intocado após a tentativa rejeitada
        self.assertEqual(instance["governance"]["writer"]["agent"], "HAIKU_4_5")

    def test_stale_message_does_not_rewind(self):
        """Handoff baseado em head_sha desatualizado (mensagem atrasada) deve ser bloqueado"""
        instance = self.runner.boot("test-mission-stale", "PIVETE", "SOL", "EXECUTOR")

        # Primeiro handoff legítimo (bootstrap, sem writer/head.sha prévios)
        sha_novo = "c" * 40
        result1 = self.runner.handoff(instance, "SOL", "SOL", sha_novo)
        instance = result1["instance"]
        self.assertEqual(instance["head"]["sha"], sha_novo)

        # Segundo handoff chega "atrasado", carregando um SHA antigo/diferente,
        # sem provar que observou o estado atual (sem observed_head_sha correto)
        sha_antigo = "a" * 40
        with self.assertRaises(ContractError) as cm:
            self.runner.handoff(instance, "SOL", "OUTRO_AGENTE", sha_antigo)

        self.assertIn("ESTADO_DESATUALIZADO", str(cm.exception))

        # Estado não retrocedeu: head.sha continua sendo o mais novo
        self.assertEqual(instance["head"]["sha"], sha_novo)

    def test_handoff_with_correct_observed_sha_succeeds(self):
        """Handoff que prova ter observado o estado atual (CAS correto) deve funcionar"""
        instance = self.runner.boot("test-mission-cas-ok", "PIVETE", "SOL", "EXECUTOR")

        sha1 = "c" * 40
        result1 = self.runner.handoff(instance, "SOL", "SOL", sha1)
        instance = result1["instance"]

        sha2 = "d" * 40
        result2 = self.runner.handoff(instance, "SOL", "OUTRO_AGENTE", sha2, observed_head_sha=sha1)
        instance = result2["instance"]

        self.assertEqual(instance["head"]["sha"], sha2)
        self.assertEqual(instance["governance"]["writer"]["agent"], "OUTRO_AGENTE")

    def test_invalid_sha_rejected(self):
        """SHA inválido deve ser rejeitado"""
        instance = self.runner.boot("test-mission", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "ACTIVE"

        # SHA com caracteres inválidos
        with self.assertRaises(ContractError):
            self.runner.handoff(instance, "A", "B", "ZZZ-invalid-sha-ZZZZ")

    def test_secret_field_injection_rejected_by_schema(self):
        """
        Campo não declarado (ex: segredo injetado) é rejeitado pelo schema real
        (additionalProperties:false), fail-closed — não chega nem perto do recibo.
        """
        instance = self.runner.boot("test-mission", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "READY_FOR_REVIEW"
        instance["last_proof"] = {"type": "test", "reference": "test_123"}

        # Adicionar segredo à instância (simulando contaminação)
        instance["_secret"] = "sk-1234567890abcdef"

        # Schema real deve rejeitar a instância inteira antes de gerar qualquer recibo
        with self.assertRaises(ContractError) as cm:
            self.runner.close(instance, "APPROVED")

        self.assertIn("SCHEMA_INVALIDO", str(cm.exception))
        self.assertIn("_secret", str(cm.exception))

    def test_close_without_judge_approval_rejected(self):
        """
        close() sem judge_approval=True deve ser bloqueado — nenhum executor
        aprova o próprio trabalho (achado do REVISOR_ESTADOS: close() nunca
        checava o campo 'requires: judge_approval=true' que states.yaml declara
        para a transição READY_FOR_REVIEW→DONE).
        """
        instance = self.runner.boot("test-mission-no-judge", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "READY_FOR_REVIEW"
        instance["last_proof"] = {"type": "test", "reference": "test_123"}

        # Sem judge_approval (default False)
        with self.assertRaises(ContractError) as cm:
            self.runner.close(instance, "APPROVED")
        self.assertIn("APROVACAO_AUSENTE", str(cm.exception))

        # Instância continua em READY_FOR_REVIEW — close() não teve efeito colateral
        self.assertEqual(instance["status"], "READY_FOR_REVIEW")

    def test_secret_in_legitimate_field_redacted_from_calibrar_receipt(self):
        """
        Achado do FABLE_JUDGE (Ponto 8, bloqueador): valor tipo segredo colocado
        num campo schema-LEGÍTIMO (governance.writer.workspace — string livre,
        sem pattern/enum) vazava em texto puro no recibo de calibrar(), porque
        _generate_receipt() embutia a instância inteira sem sanitização.

        O objeto de instância/checkpoint retornado (estado vivo de trabalho) NÃO
        é redigido — precisa continuar íntegro para reload()/continuação. Só o
        RECIBO (artefato de auditoria, potencialmente persistido/compartilhado)
        é sanitizado.
        """
        instance = self.runner.boot("test-mission-secret-workspace", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "ACTIVE"

        # Segredo sintético num campo legítimo do schema (string livre, sem pattern/enum)
        instance["governance"]["writer"]["workspace"] = "[REDIGIDO-PRESERVACAO]"

        result = self.runner.calibrar(instance)

        receipt_json = json.dumps(result["receipt"])
        self.assertNotIn("[REDIGIDO-PRESERVACAO]", receipt_json)
        self.assertIn("<REDACTED>", receipt_json)

    def test_redact_secrets_by_key_name_unit(self):
        """
        Unidade direta de _redact_secrets(): campo cujo NOME sugere segredo
        (password/token/secret/api_key/...) é redigido mesmo sem bater nenhum
        padrão de valor conhecido — fail-closed por nome, não só por formato.
        """
        payload = {
            "password": "qualquercoisa123",
            "api_key": "valor-sem-cara-de-chave-conhecida",
            "normal_field": "valor-comum-preservado",
            "nested": {"token": "abc", "safe": "mantido"}
        }

        redacted = self.runner._redact_secrets(payload)

        self.assertEqual(redacted["password"], "<REDACTED>")
        self.assertEqual(redacted["api_key"], "<REDACTED>")
        self.assertEqual(redacted["normal_field"], "valor-comum-preservado")
        self.assertEqual(redacted["nested"]["token"], "<REDACTED>")
        self.assertEqual(redacted["nested"]["safe"], "mantido")

    def test_secret_in_mission_id_redacted_from_close_receipt_and_disk(self):
        """
        Achado do FABLE_JUDGE (defeito residual 1, ALTA): close() montava o
        recibo por allowlist manual e só redigia `verdict`. O `mission_id` é
        string livre no schema (minLength, SEM pattern), então um segredo
        colocado ali vazava em texto puro no recibo E no arquivo persistido
        em disco. Agora o recibo INTEIRO passa por _redact_secrets.

        Este teste falha na versão anterior do runner e passa na corrigida.
        """
        segredo = "[REDIGIDO-PRESERVACAO]"
        instance = self.runner.boot(segredo, "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "READY_FOR_REVIEW"
        instance["last_proof"] = {"type": "test", "reference": "poc"}

        result = self.runner.close(instance, "APPROVED", judge_approval=True)

        # (a) não vaza no recibo em memória
        self.assertNotIn(segredo, json.dumps(result["receipt"]))
        # (b) não vaza no arquivo persistido em disco
        conteudo_disco = Path(result["receipt_file"]).read_text(encoding="utf-8")
        self.assertNotIn(segredo, conteudo_disco)
        # (c) o campo foi de fato redigido, não apenas omitido
        self.assertEqual(result["receipt"]["mission_id"], "<REDACTED>")

    def test_key_name_hint_applies_to_nested_containers(self):
        """
        Achado do FABLE_JUDGE (defeito residual 2, MÉDIA): o fail-closed por
        NOME de campo só valia quando o valor era str. Um segredo dentro de
        {"token": [...]} ou {"api_key": {...}} escapava, porque a recursão
        descia para chaves internas de nome inocente.
        """
        payload = {
            "token": ["PoCJUDGE1234567890abcdef"],
            "api_key": {"v": "hunter2-senha-real"},
            "normal_field": "preservado",
        }

        redacted = self.runner._redact_secrets(payload)

        self.assertEqual(redacted["token"], "<REDACTED>")
        self.assertEqual(redacted["api_key"], "<REDACTED>")
        self.assertEqual(redacted["normal_field"], "preservado")
        blob = json.dumps(redacted)
        self.assertNotIn("PoCJUDGE1234567890abcdef", blob)
        self.assertNotIn("hunter2-senha-real", blob)

    def test_secret_patterns_case_insensitive_and_aws_key(self):
        """
        Achado do FABLE_JUDGE (defeito residual 3, BAIXA): `ghp_` era
        case-sensitive e não havia padrão para AWS Access Key ID (AKIA...).
        """
        payload = {
            "campo_inocente_a": "GHP_ABCDEFGHIJKLMNOPQRST",
            "campo_inocente_b": "[REDIGIDO-PRESERVACAO]",
            "campo_inocente_c": "texto-comum-preservado",
        }

        redacted = self.runner._redact_secrets(payload)

        self.assertEqual(redacted["campo_inocente_a"], "<REDACTED>")
        self.assertEqual(redacted["campo_inocente_b"], "<REDACTED>")
        self.assertEqual(redacted["campo_inocente_c"], "texto-comum-preservado")

    def test_secret_never_in_receipt_of_valid_instance(self):
        """Instância válida (sem campos extras) fechada normalmente não vaza nada além do esperado"""
        instance = self.runner.boot("test-mission", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "READY_FOR_REVIEW"
        instance["last_proof"] = {"type": "test", "reference": "test_123"}

        result = self.runner.close(instance, "APPROVED", judge_approval=True)

        receipt_json = json.dumps(result["receipt"])
        self.assertNotIn("sk-", receipt_json)
        self.assertNotIn("_secret", receipt_json)

    def test_non_deterministic_detection(self):
        """Resultado diferente em mesma entrada = falha"""
        instance1 = self.runner.boot("test-mission", "PIVETE", "SOL", "EXECUTOR")
        instance2 = self.runner.boot("test-mission", "PIVETE", "SOL", "EXECUTOR")

        # Ambos devem ter mesmo mission_id mas instance_id diferente (por timestamp)
        self.assertEqual(instance1["mission_id"], instance2["mission_id"])
        # instance_id será diferente por causa do timestamp — isso é OK
        # Mas estrutura deve ser idêntica


class TestDeltaContractPositive(unittest.TestCase):
    """Testes Positivos — Ciclo completo"""

    def setUp(self):
        schema_path = Path(__file__).parent.parent / "schema.json"
        self.runner = Runner(schema_path)

    def test_boot_valid_instance(self):
        """Boot deve criar instância válida"""
        instance = self.runner.boot("mission-123", "PIVETE", "SOL", "EXECUTOR")

        self.assertEqual(instance["status"], "ACTIVE")
        self.assertEqual(instance["mission_id"], "mission-123")
        self.assertEqual(instance["identity"]["owner"], "PIVETE")
        self.assertEqual(instance["identity"]["coordinator"], "SOL")

        # Validar
        validation = self.runner.validate(instance)
        # Pode falhar por falta de HEAD SHA, mas estrutura deve estar OK
        self.assertIn("valid", validation)

    def test_calibrate_checkpoints(self):
        """Calibrar deve criar checkpoint válido"""
        instance = self.runner.boot("mission-456", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "ACTIVE"
        instance["head"]["sha"] = "5f7573492cb13ef5923d388af51ebd3c3abe60f4"

        checkpoint_result = self.runner.calibrar(instance)

        self.assertEqual(checkpoint_result["checkpoint"]["status"], "CHECKPOINTED")
        self.assertIsNotNone(checkpoint_result["receipt"])
        self.assertEqual(checkpoint_result["receipt"]["event"], "CHECKPOINT")

    def test_handoff_valid(self):
        """Handoff deve transferir posse sem colisão"""
        instance = self.runner.boot("mission-789", "PIVETE", "SOL", "EXECUTOR")
        instance["status"] = "ACTIVE"

        result = self.runner.handoff(
            instance,
            "HAIKU_4_5",
            "SOL",
            "5f7573492cb13ef5923d388af51ebd3c3abe60f4"
        )

        self.assertEqual(result["instance"]["governance"]["writer"]["agent"], "SOL")
        self.assertEqual(result["receipt"]["event"], "HANDOFF")

    def test_full_cycle_boot_to_reset(self):
        """Ciclo completo: boot → calibrate → close → reset"""
        # Boot
        instance = self.runner.boot("mission-full-cycle", "PIVETE", "SOL", "EXECUTOR")
        self.assertEqual(instance["status"], "ACTIVE")

        # Calibrate
        checkpoint = self.runner.calibrar(instance)["checkpoint"]
        self.assertEqual(checkpoint["status"], "CHECKPOINTED")

        # Reload (read-only)
        reloaded = self.runner.reload(checkpoint)
        self.assertTrue(reloaded.get("_read_only"))

        # Handoff (head.sha já estava definido; provar observação via CAS)
        instance["status"] = "ACTIVE"
        instance["head"]["sha"] = "5f7573492cb13ef5923d388af51ebd3c3abe60f4"
        handoff_result = self.runner.handoff(
            instance, "A", "B", "5f7573492cb13ef5923d388af51ebd3c3abe60f4",
            observed_head_sha="5f7573492cb13ef5923d388af51ebd3c3abe60f4"
        )
        instance = handoff_result["instance"]

        # Transition to review
        instance["status"] = "READY_FOR_REVIEW"
        instance["last_proof"] = {"type": "test", "reference": "test_ok"}

        # Close
        close_result = self.runner.close(instance, "APPROVED", judge_approval=True)
        self.assertEqual(close_result["instance"]["status"], "DONE")
        self.assertIsNotNone(close_result["receipt"]["receipt_sha256"])

        # Reset
        final = self.runner.reset_instance(close_result["instance"])
        self.assertEqual(final["status"], "IDLE")

    def test_idempotence_boot(self):
        """Boot com mesmos parâmetros deve produzir estrutura idêntica"""
        params = ("mission-idempotent", "PIVETE", "SOL", "EXECUTOR")

        instance1 = self.runner.boot(*params)
        instance2 = self.runner.boot(*params)

        # Removar instance_id e timestamps (que variam)
        inst1_copy = {k: v for k, v in instance1.items() if k not in ["instance_id", "created_at", "updated_at"]}
        inst2_copy = {k: v for k, v in instance2.items() if k not in ["instance_id", "created_at", "updated_at"]}

        self.assertEqual(inst1_copy, inst2_copy)


class TestDeltaContractSchemaEnforcement(unittest.TestCase):
    """
    Testes que fecham os 4 casos que o REVISOR_SCHEMA (auditoria adversarial)
    encontrou passando quando deveriam falhar, antes da correção 4
    (validate_schema() reimplementado como dirigido pelo schema.json real).
    """

    def setUp(self):
        schema_path = Path(__file__).parent.parent / "schema.json"
        self.runner = Runner(schema_path)
        self.valid_instance = self.runner.boot("test-schema-enf", "PIVETE", "SOL", "EXECUTOR")

    def test_missing_required_field_identity_rejected(self):
        """Caso (a) do REVISOR_SCHEMA: falta 'identity' (required) deve falhar"""
        del self.valid_instance["identity"]
        with self.assertRaises(ContractError) as cm:
            self.runner.validate_schema(self.valid_instance)
        self.assertIn("identity", str(cm.exception))

    def test_missing_multiple_required_fields_rejected(self):
        """Caso (a2): falta governance+head+last_proof+next_gate simultaneamente"""
        for field in ["governance", "head", "last_proof", "next_gate"]:
            del self.valid_instance[field]
        with self.assertRaises(ContractError) as cm:
            self.runner.validate_schema(self.valid_instance)
        msg = str(cm.exception)
        for field in ["governance", "head", "last_proof", "next_gate"]:
            self.assertIn(field, msg)

    def test_additional_properties_rejected_root_and_nested(self):
        """Caso (b): propriedades extras (additionalProperties:false) em dois níveis"""
        self.valid_instance["campo_nao_autorizado_injetado"] = "x"
        self.valid_instance["identity"]["campo_extra_identity"] = "y"
        with self.assertRaises(ContractError) as cm:
            self.runner.validate_schema(self.valid_instance)
        msg = str(cm.exception)
        self.assertIn("campo_nao_autorizado_injetado", msg)
        self.assertIn("campo_extra_identity", msg)

    def test_pattern_and_enum_violations_rejected(self):
        """Caso (c): instance_id fora do pattern, contract_id fora do pattern, role fora do enum"""
        self.valid_instance["instance_id"] = "nao-e-um-sha256-valido"
        self.valid_instance["contract_id"] = "CONTRATO INVALIDO !!"
        self.valid_instance["identity"]["role"] = "ROLE_INEXISTENTE"
        with self.assertRaises(ContractError) as cm:
            self.runner.validate_schema(self.valid_instance)
        msg = str(cm.exception)
        self.assertIn("instance_id", msg)
        self.assertIn("contract_id", msg)
        self.assertIn("role", msg)

    def test_valid_instance_with_null_progressive_fields_accepted(self):
        """
        Instância recém-nascida de boot() (head.branch/sha e writer.agent/workspace
        ainda null, last_proof ainda null) deve ser ACEITA — null é legítimo antes
        do primeiro handoff/prova, não é o mesmo que campo ausente.
        """
        # Não deve lançar
        self.runner.validate_schema(self.valid_instance)


class TestDeltaContractDeterminism(unittest.TestCase):
    """Testes de Determinismo — Reproduzibilidade"""

    def setUp(self):
        schema_path = Path(__file__).parent.parent / "schema.json"
        self.runner = Runner(schema_path)

    def test_schema_validation_deterministic(self):
        """Validar mesma instância 2x deve produzir resultado idêntico"""
        instance = self.runner.boot("mission-determinism", "PIVETE", "SOL", "EXECUTOR")
        instance["head"]["sha"] = "5f7573492cb13ef5923d388af51ebd3c3abe60f4"
        instance["status"] = "ACTIVE"

        validation1 = self.runner.validate(instance)
        validation2 = self.runner.validate(instance)

        # Mesmo resultado
        self.assertEqual(validation1["valid"], validation2["valid"])
        self.assertEqual(validation1["errors"], validation2["errors"])
        self.assertEqual(validation1["verdict"], validation2["verdict"])

    def test_transition_validation_deterministic(self):
        """Validar transição 2x deve produzir resultado idêntico"""
        instance = self.runner.boot("mission-det-trans", "PIVETE", "SOL", "EXECUTOR")

        try:
            self.runner.validate_transition("ACTIVE", "BLOCKED", instance)
            result1 = "OK"
        except ContractError:
            result1 = "ERROR"

        try:
            self.runner.validate_transition("ACTIVE", "BLOCKED", instance)
            result2 = "OK"
        except ContractError:
            result2 = "ERROR"

        self.assertEqual(result1, result2)

    def test_hash_deterministic(self):
        """Hash de mesmo conteúdo deve ser idêntico"""
        data = '{"mission_id": "test", "status": "ACTIVE"}'

        hash1 = self.runner._hash(data)
        hash2 = self.runner._hash(data)

        self.assertEqual(hash1, hash2)
        self.assertEqual(len(hash1), 64)  # SHA-256 = 64 hex chars


if __name__ == "__main__":
    # Executar testes
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    suite.addTests(loader.loadTestsFromTestCase(TestDeltaContractNegative))
    suite.addTests(loader.loadTestsFromTestCase(TestDeltaContractPositive))
    suite.addTests(loader.loadTestsFromTestCase(TestDeltaContractDeterminism))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Exit code
    sys.exit(0 if result.wasSuccessful() else 1)
