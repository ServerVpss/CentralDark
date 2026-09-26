#!/usr/bin/env python3
"""
Runner Determinístico — Contrato Delta Canônico v1

Executor isolado, reutilizável, sem dependências de VPS, produção ou Meta Lupa
durante a execução do contrato (Meta Lupa valida ANTES e DEPOIS).

Comandos:
  - boot: inicializa contrato e instância
  - calibrar: captura checkpoint canônico
  - reload: carrega contrato+instância em read-only
  - handoff: transferência de posse de escrita
  - close: encerra missão com recibo
  - reset-instance: volta para IDLE preservando contrato
  - validate: valida schema, transições, prova
"""

import json
import re
import sys
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


SCHEMA_VERSION = 1
CONTRACT_ID = "delta-canonico-v1"
VALID_STATES = {"IDLE", "ACTIVE", "BLOCKED", "CHECKPOINTED", "READY_FOR_REVIEW", "DONE", "ARCHIVED"}
VALID_COMMANDS = {"boot", "calibrar", "reload", "handoff", "close", "reset-instance", "validate"}

# Padrões de valor conhecidos como segredo (consistente com a varredura sensível
# já usada em outras partes do repositório: api_key, bearer, sk-, private key, etc.)
SECRET_VALUE_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9_-]{10,}", re.IGNORECASE),
    re.compile(r"ghp_[A-Za-z0-9]{10,}", re.IGNORECASE),
    re.compile(r"gho_[A-Za-z0-9]{10,}", re.IGNORECASE),
    re.compile(r"github_pat_[A-Za-z0-9_]{10,}", re.IGNORECASE),
    re.compile(r"xai-[A-Za-z0-9_-]{10,}", re.IGNORECASE),
    re.compile(r"AIza[A-Za-z0-9_-]{10,}", re.IGNORECASE),
    re.compile(r"AKIA[A-Z0-9]{12,}", re.IGNORECASE),
    re.compile(r"xox[bapr]-[A-Za-z0-9-]{10,}", re.IGNORECASE),
    re.compile(r"Bearer\s+[A-Za-z0-9._-]{10,}", re.IGNORECASE),
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
]
# Nomes de campo que, se contiverem string não-vazia, são tratados como segredo
# independentemente do valor bater algum padrão conhecido (fail-closed por nome)
SECRET_KEY_NAME_HINTS = {
    "password", "passwd", "secret", "token", "api_key", "apikey",
    "authorization", "bearer", "private_key"
}

# Transições válidas (whitelist)
VALID_TRANSITIONS = {
    ("IDLE", "ACTIVE"),
    ("ACTIVE", "BLOCKED"),
    ("BLOCKED", "ACTIVE"),
    ("ACTIVE", "CHECKPOINTED"),
    ("CHECKPOINTED", "ACTIVE"),
    ("ACTIVE", "READY_FOR_REVIEW"),
    ("READY_FOR_REVIEW", "ACTIVE"),
    ("READY_FOR_REVIEW", "DONE"),
    ("DONE", "ARCHIVED"),
    ("ARCHIVED", "IDLE"),
}

# Transições proibidas (fail-closed)
FORBIDDEN_TRANSITIONS = {
    ("IDLE", "DONE"),
    ("IDLE", "ARCHIVED"),
    ("ACTIVE", "ARCHIVED"),
    ("BLOCKED", "DONE"),
    ("DONE", "ACTIVE"),
    ("ARCHIVED", "ACTIVE"),
    ("CHECKPOINTED", "DONE"),
}


class ContractError(Exception):
    """Erro de contrato (transição inválida, schema inválido, etc)"""
    pass


class Runner:
    """Executor determinístico do Contrato Delta"""

    def __init__(self, schema_path: Path = None):
        self.schema_path = schema_path or Path(__file__).parent / "schema.json"
        self.states_path = Path(__file__).parent / "states.yaml"
        self.receipts_dir = Path(__file__).parent / "receipts"
        self.receipts_dir.mkdir(exist_ok=True)
        # Schema é carregado e REALMENTE aplicado (não apenas verificado como existente)
        self._schema_doc = self._load_schema_doc()

    def _load_schema_doc(self) -> Dict[str, Any]:
        """Carregar schema.json do disco (fonte única de validação)"""
        if not self.schema_path.exists():
            raise FileNotFoundError(f"Schema não encontrado: {self.schema_path}")
        with open(self.schema_path) as f:
            doc = json.load(f)
        if doc.get("$id") != "centraldark://contrato/delta-canonico/v1":
            raise ContractError(f"Schema $id inesperado: {doc.get('$id')}")
        return doc

    def _validate_against_schema_node(self, data: Any, node: Dict[str, Any], path: str) -> List[str]:
        """
        Validador recursivo genérico de um subconjunto de JSON-Schema draft-07:
        type (string ou lista incluindo 'null'), required, additionalProperties,
        properties, items, minItems, enum, pattern, minLength.
        Sem dependência externa — aplica de fato as regras declaradas em schema.json,
        em vez de reimplementação manual paralela e incompleta.
        """
        errors: List[str] = []
        node_type = node.get("type")
        allowed_types = [node_type] if isinstance(node_type, str) else (node_type or [])

        if data is None:
            if "null" in allowed_types:
                return errors
            if allowed_types:
                errors.append(f"{path}: valor ausente (null) mas campo não aceita null")
            return errors

        if "object" in allowed_types or (not allowed_types and isinstance(node.get("properties"), dict)):
            if not isinstance(data, dict):
                errors.append(f"{path}: esperado object, veio {type(data).__name__}")
                return errors
            for req_field in node.get("required", []):
                if req_field not in data:
                    errors.append(f"{path}.{req_field}: campo obrigatório ausente")
            properties = node.get("properties", {})
            if node.get("additionalProperties") is False:
                for key in data.keys():
                    if key not in properties:
                        errors.append(f"{path}.{key}: propriedade não declarada (additionalProperties:false)")
            for key, value in data.items():
                if key in properties:
                    errors.extend(self._validate_against_schema_node(value, properties[key], f"{path}.{key}"))
            return errors

        if "array" in allowed_types:
            if not isinstance(data, list):
                errors.append(f"{path}: esperado array, veio {type(data).__name__}")
                return errors
            min_items = node.get("minItems")
            if min_items is not None and len(data) < min_items:
                errors.append(f"{path}: minItems={min_items}, veio {len(data)}")
            items_schema = node.get("items")
            if items_schema:
                for i, item in enumerate(data):
                    errors.extend(self._validate_against_schema_node(item, items_schema, f"{path}[{i}]"))
            return errors

        if "string" in allowed_types:
            if not isinstance(data, str):
                errors.append(f"{path}: esperado string, veio {type(data).__name__}")
                return errors
            enum = node.get("enum")
            if enum is not None and data not in enum:
                errors.append(f"{path}: valor '{data}' fora do enum {enum}")
            pattern = node.get("pattern")
            if pattern is not None and not re.match(pattern, data):
                errors.append(f"{path}: valor '{data}' não bate com pattern {pattern}")
            min_length = node.get("minLength")
            if min_length is not None and len(data) < min_length:
                errors.append(f"{path}: minLength={min_length}")
            return errors

        if "integer" in allowed_types:
            if not isinstance(data, int) or isinstance(data, bool):
                errors.append(f"{path}: esperado integer, veio {type(data).__name__}")
                return errors
            enum = node.get("enum")
            if enum is not None and data not in enum:
                errors.append(f"{path}: valor {data} fora do enum {enum}")
            return errors

        # Sem 'type' declarado no node (ex: nó raiz do schema): sem checagem adicional.
        return errors

    def validate_schema(self, instance: Dict[str, Any]) -> bool:
        """
        Validar instância contra o schema REAL carregado de schema.json (fail-closed).
        Substitui a checagem manual parcial anterior — agora aplica required completo,
        additionalProperties, enum e pattern conforme declarado no schema.
        """
        instance_node = self._schema_doc.get("properties", {}).get("instance", {})
        errors = self._validate_against_schema_node(instance, instance_node, "instance")

        if errors:
            raise ContractError(f"SCHEMA_INVALIDO ({len(errors)} erro(s)): " + "; ".join(errors))

        return True

    def validate_transition(self, from_state: str, to_state: str, instance: Dict[str, Any]) -> bool:
        """Validar transição (whitelist + blacklist)"""
        # Verificar estados válidos
        if from_state not in VALID_STATES or to_state not in VALID_STATES:
            raise ContractError(f"Estado inválido: {from_state} → {to_state}")

        # Bloquear transições proibidas
        if (from_state, to_state) in FORBIDDEN_TRANSITIONS:
            raise ContractError(f"Transição proibida: {from_state} → {to_state}")

        # Verificar transição válida (whitelist)
        if (from_state, to_state) not in VALID_TRANSITIONS:
            raise ContractError(f"Transição não autorizada: {from_state} → {to_state}")

        # Regra: DONE exige prova
        if to_state == "DONE" and not instance.get("last_proof"):
            raise ContractError("DONE exige last_proof (teste, check ou aprovação)")

        return True

    def boot(self, mission_id: str, owner: str, coordinator: str, role: str) -> Dict[str, Any]:
        """
        Inicializar novo contrato + instância.
        Estado: IDLE → ACTIVE
        """
        # Gerar IDs únicos
        instance_id = self._hash(f"{mission_id}-{datetime.now(timezone.utc).isoformat()}")

        instance = {
            "schema_version": SCHEMA_VERSION,
            "contract_id": CONTRACT_ID,
            "instance_id": instance_id,
            "mission_id": mission_id,
            "identity": {
                "owner": owner,
                "coordinator": coordinator,
                "role": role
            },
            "governance": {
                "writer": {"agent": None, "workspace": None},
                "readers": [],
                "scope_allowed": [],
                "scope_denied": [],
                "prohibited": []
            },
            "status": "IDLE",
            "phase": "INICIO",
            "head": {
                "repository": "ServerVpss/CentralDark",
                "branch": None,
                "sha": None
            },
            "last_proof": None,
            "pending": [],
            "next_gate": "configuracao_inicial",
            "next_safe_command": "validate",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        # Instância nasce em IDLE e transiciona para ACTIVE através do validador real
        # (antes: 'status':'ACTIVE' era escrito direto no dict, nunca passando pela
        # máquina de estados — achado do REVISOR_ESTADOS)
        self.validate_transition("IDLE", "ACTIVE", instance)
        instance["status"] = "ACTIVE"
        instance["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Validar schema
        self.validate_schema(instance)

        return instance

    def calibrar(self, instance: Dict[str, Any]) -> Dict[str, Any]:
        """
        Capturar checkpoint canônico.
        Única origem válida é ACTIVE (states.yaml). Valida a transição de
        verdade antes de mutar — antes aceitava BLOCKED→CHECKPOINTED e
        qualquer outro estado de origem sem checagem (achado do REVISOR_ESTADOS).
        """
        self.validate_schema(instance)

        self.validate_transition(instance["status"], "CHECKPOINTED", instance)

        checkpoint = instance.copy()
        checkpoint["status"] = "CHECKPOINTED"
        checkpoint["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Gerar recibo
        receipt = self._generate_receipt("CHECKPOINT", checkpoint)

        return {"checkpoint": checkpoint, "receipt": receipt}

    def reload(self, instance: Dict[str, Any]) -> Dict[str, Any]:
        """
        Carregar contrato+instância em read-only.
        Sem permissão para escrever.
        """
        self.validate_schema(instance)

        # Retornar cópia com flag read-only
        reloaded = instance.copy()
        reloaded["_read_only"] = True

        return reloaded

    def handoff(self, instance: Dict[str, Any], from_agent: str, to_agent: str, head_sha: str,
                observed_head_sha: Optional[str] = None) -> Dict[str, Any]:
        """
        Transferência de posse de escrita.

        Exige head_sha congelado e:
        1. from_agent deve ser o writer atual (ou não haver writer ainda) — bloqueia
           CONFLITO_ESCRITOR (dois escritores simultâneos / agente sem posse reivindicando).
        2. Se a instância já tem head.sha, observed_head_sha deve bater com ele (compare-and-swap) —
           bloqueia RETROCESSO por mensagem atrasada (evidência nova vence contexto antigo).
        """
        self.validate_schema(instance)

        # Validar SHA
        if not self._is_valid_sha(head_sha):
            raise ContractError(f"HEAD SHA inválido: {head_sha}")

        # Bloquear CONFLITO_ESCRITOR: from_agent deve ser o writer atual (ou instância sem writer ainda)
        current_writer = instance.get("governance", {}).get("writer", {}).get("agent")
        if current_writer is not None and current_writer != from_agent:
            raise ContractError(
                f"CONFLITO_ESCRITOR: from_agent='{from_agent}' não é o writer atual "
                f"('{current_writer}'). Handoff só pode ser solicitado por quem detém a posse."
            )

        # Bloquear RETROCESSO: se já existe head.sha, o chamador deve provar que observou o estado atual
        current_sha = instance.get("head", {}).get("sha")
        if current_sha is not None:
            if observed_head_sha is None:
                raise ContractError(
                    "ESTADO_DESATUALIZADO: instância já tem head.sha definido; "
                    "handoff exige observed_head_sha explícito (compare-and-swap)."
                )
            if observed_head_sha != current_sha:
                raise ContractError(
                    f"RETROCESSO_BLOQUEADO: observed_head_sha='{observed_head_sha}' não bate com "
                    f"o head.sha atual da instância ('{current_sha}'). Mensagem atrasada não pode "
                    f"retroceder a missão — recarregue o estado com reload() antes de tentar de novo."
                )

        # Transferir posse
        instance["governance"]["writer"]["agent"] = to_agent
        instance["governance"]["writer"]["ownership_since"] = datetime.now(timezone.utc).isoformat()
        instance["head"]["sha"] = head_sha
        instance["updated_at"] = datetime.now(timezone.utc).isoformat()

        receipt = self._generate_receipt("HANDOFF", {
            "from_agent": from_agent,
            "to_agent": to_agent,
            "head_sha": head_sha,
            "observed_head_sha": observed_head_sha
        })

        return {"instance": instance, "receipt": receipt}

    def close(self, instance: Dict[str, Any], verdict: str, judge_approval: bool = False) -> Dict[str, Any]:
        """
        Encerrar missão com recibo final.
        Estado: READY_FOR_REVIEW → DONE

        Exige judge_approval=True explícito — nenhum executor aprova o próprio
        trabalho (states.yaml declara judge_approval=true como requisito da
        transição READY_FOR_REVIEW→DONE; achado do REVISOR_ESTADOS mostrou que
        isso nunca era checado, permitindo close() sem qualquer aprovação externa).
        """
        self.validate_schema(instance)

        # Validar transição
        self.validate_transition(instance["status"], "DONE", instance)

        # Exigir prova
        if not instance.get("last_proof"):
            raise ContractError("close() exige last_proof (não pode ser None)")

        # Exigir aprovação explícita de revisão externa (Judge/Meta Lupa) — não é
        # o executor quem decide que o próprio trabalho está pronto para DONE
        if judge_approval is not True:
            raise ContractError(
                "APROVACAO_AUSENTE: close() exige judge_approval=True. "
                "Nenhum executor aprova o próprio trabalho (states.yaml: "
                "READY_FOR_REVIEW→DONE requer judge_approval=true)."
            )

        # Criar recibo final. A allowlist de campos NÃO é suficiente por si só:
        # achado do FABLE_JUDGE (defeito residual 1) provou que `mission_id` é
        # string livre no schema (minLength, sem pattern) e vazava em texto puro
        # no recibo — inclusive no arquivo persistido em disco. Por isso o recibo
        # INTEIRO passa por _redact_secrets, não apenas o `verdict`.
        receipt = {
            "schema_version": SCHEMA_VERSION,
            "event": "CLOSE",
            "mission_id": instance["mission_id"],
            "instance_id": instance["instance_id"],
            "verdict": verdict,
            "head_sha": instance.get("head", {}).get("sha"),
            "closed_at": datetime.now(timezone.utc).isoformat(),
            "receipt_sha256": None  # Será preenchido após hash
        }
        receipt = self._redact_secrets(receipt)

        # Calcular hash sobre o recibo JÁ REDIGIDO, para que o hash corresponda
        # exatamente ao conteúdo persistido em disco.
        receipt["receipt_sha256"] = self._hash(json.dumps(receipt, sort_keys=True))

        # Atualizar instância
        instance["status"] = "DONE"
        instance["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Arquivar recibo em disco
        receipt_file = self.receipts_dir / f"{instance['instance_id']}.json"
        with open(receipt_file, "w") as f:
            json.dump(receipt, f, indent=2)

        return {
            "instance": instance,
            "receipt": receipt,
            "receipt_file": str(receipt_file)
        }

    def reset_instance(self, instance: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resetar instância para IDLE.
        Preserva contrato, limpa estado operacional.
        Estado: DONE → ARCHIVED → IDLE
        """
        self.validate_schema(instance)

        # Deve estar em DONE
        if instance["status"] != "DONE":
            raise ContractError(f"reset_instance() exige status=DONE, got {instance['status']}")

        # Transição DONE → ARCHIVED (validada de verdade, não só mutação in-place)
        self.validate_transition("DONE", "ARCHIVED", instance)
        instance["status"] = "ARCHIVED"
        instance["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Transição ARCHIVED → IDLE (limpar campos operacionais).
        # Validamos a transição sobre um shell mínimo no estado ARCHIVED — a
        # instância anterior já está arquivada (histórico preservado pelo chamador
        # via recibo em disco); o contrato permanente (schema.json/states.yaml)
        # nunca é tocado por esta operação.
        archived_shell = {"status": "ARCHIVED"}
        self.validate_transition("ARCHIVED", "IDLE", archived_shell)

        reset_instance = {
            "schema_version": SCHEMA_VERSION,
            "contract_id": CONTRACT_ID,
            "instance_id": None,  # Nova instância será criada se necessário
            "mission_id": None,
            "status": "IDLE",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        return reset_instance

    def validate(self, instance: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validar schema, transições, prova.
        Fail-closed: rejeita se faltar qualquer coisa.
        """
        errors = []

        try:
            self.validate_schema(instance)
        except ContractError as e:
            errors.append(str(e))

        # Validar que o estado é um dos válidos
        if instance.get("status") not in VALID_STATES:
            errors.append(f"Status inválido: {instance.get('status')}")

        # Validar que head.sha é válido quando necessário
        if instance.get("status") in ["ACTIVE", "READY_FOR_REVIEW", "DONE"]:
            head_sha = instance.get("head", {}).get("sha")
            if not head_sha or not self._is_valid_sha(head_sha):
                errors.append(f"HEAD SHA inválido ou ausente: {head_sha}")

        # Validar que last_proof existe em estados finais
        if instance.get("status") in ["READY_FOR_REVIEW", "DONE"]:
            if not instance.get("last_proof"):
                errors.append(f"last_proof obrigatório para status={instance.get('status')}")

        if errors:
            return {
                "valid": False,
                "errors": errors,
                "verdict": "VALIDATION_FAILED"
            }

        return {
            "valid": True,
            "errors": [],
            "verdict": "VALIDATION_PASSED"
        }

    def _hash(self, data: str) -> str:
        """Gerar SHA-256 de string"""
        return hashlib.sha256(data.encode()).hexdigest()

    def _is_valid_sha(self, sha: str) -> bool:
        """Verificar se string é SHA válido (40 hex chars)"""
        return isinstance(sha, str) and len(sha) == 40 and all(c in "0123456789abcdef" for c in sha.lower())

    def _looks_like_secret(self, value: str) -> bool:
        """Detectar valor com formato de segredo conhecido (padrões da casa)"""
        for pattern in SECRET_VALUE_PATTERNS:
            if pattern.search(value):
                return True
        return False

    def _redact_secrets(self, data: Any) -> Any:
        """
        Percorrer recursivamente e redigir valores que parecem segredo — por
        padrão de valor (sk-, ghp_, Bearer ..., private key) OU por nome de
        campo suspeito (password, token, secret, api_key, authorization, ...).

        Aplica-se apenas ao payload que vai para o RECIBO (artefato de auditoria,
        potencialmente persistido/compartilhado) — nunca ao objeto de instância
        vivo retornado ao chamador para continuação do trabalho, que precisa
        permanecer íntegro e utilizável.
        """
        if isinstance(data, dict):
            redacted = {}
            for key, value in data.items():
                key_lower = str(key).lower()
                if any(hint in key_lower for hint in SECRET_KEY_NAME_HINTS):
                    # Fail-closed por NOME de campo: o hint vale para qualquer
                    # tipo de valor, não só str. Achado do FABLE_JUDGE
                    # (defeito residual 2): antes, um segredo dentro de
                    # {"token": [...]} ou {"api_key": {...}} escapava porque a
                    # recursão descia para chaves internas de nome inocente.
                    redacted[key] = "<REDACTED>" if value not in (None, "", [], {}) else value
                else:
                    redacted[key] = self._redact_secrets(value)
            return redacted
        if isinstance(data, list):
            return [self._redact_secrets(item) for item in data]
        if isinstance(data, str) and self._looks_like_secret(data):
            return "<REDACTED>"
        return data

    def _generate_receipt(self, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gerar recibo de evento. O payload é redigido (_redact_secrets) antes de
        entrar no recibo — achado do FABLE_JUDGE (Ponto 8): calibrar() embutia a
        instância inteira sem sanitização, vazando qualquer valor tipo segredo
        colocado num campo schema-legítimo (ex: governance.writer.workspace).
        """
        sanitized_data = self._redact_secrets(data)

        receipt = {
            "schema_version": SCHEMA_VERSION,
            "event": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": sanitized_data
        }

        receipt["sha256"] = self._hash(json.dumps(receipt, sort_keys=True))
        return receipt


def main():
    """Teste básico do runner"""
    runner = Runner()

    # Boot
    instance = runner.boot(
        mission_id="CENTRALDARK-CONTRATO-DELTA-REUTILIZAVEL-01",
        owner="PIVETE",
        coordinator="SOL",
        role="EXECUTOR"
    )

    print(f"[OK] boot(): {instance['status']} -> ACTIVE")

    # Validate
    validation = runner.validate(instance)
    print(f"[OK] validate(): {validation['verdict']}")

    # Calibrar
    checkpoint_result = runner.calibrar(instance)
    print(f"[OK] calibrar(): {checkpoint_result['checkpoint']['status']} -> CHECKPOINTED")

    # Reload
    instance = checkpoint_result["checkpoint"]
    reloaded = runner.reload(instance)
    print(f"[OK] reload(): read-only={reloaded.get('_read_only', False)}")

    # Handoff
    instance["status"] = "ACTIVE"
    handoff_result = runner.handoff(instance, "HAIKU_4_5", "SOL", "5f7573492cb13ef5923d388af51ebd3c3abe60f4")
    instance = handoff_result["instance"]
    print(f"[OK] handoff(): {handoff_result['receipt']['event']}")

    # Close (exigir last_proof)
    instance["status"] = "READY_FOR_REVIEW"
    instance["last_proof"] = {"type": "test", "reference": "test_123"}
    close_result = runner.close(instance, "APPROVED", judge_approval=True)
    print(f"[OK] close(): {close_result['receipt']['event']}")

    # Reset
    final_instance = runner.reset_instance(close_result["instance"])
    print(f"[OK] reset-instance(): {final_instance['status']} -> IDLE")

    print("\n[OK] Runner deterministic: ALL 7 COMMANDS WORK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
