# COMANDO - memory_synthesizer.py
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_agi-self-improvement-main\agi-self-improvement-main\agents\memory_synthesizer.py
**SHA:** 77346cba18e379d6
**Timestamp:** 2026-08-26T19:43:45.296645
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt = f"""You are an expert memory synthesizer for an autonomous AI agent.
- prompt = f"""You are Hermes' MemorySynthesizer. Generate a thoughtful, concise periodic reflection

### Ouro Bruto (primeiros 5000 chars)
```
"""
MemorySynthesizer Sub-Agent for Hermes
======================================

A specialized MCP-enabled sub-agent whose job is to maintain and improve
the long-term Vector Memory of the Hermes system.

Core Responsibilities:
- Periodic or on-demand memory consolidation
- Semantic deduplication and clustering
- Importance scoring and prioritization
- Creation of higher-level synthesized insights / summaries
- Archiving or soft-deletion of low-value / redundant memories
- Generating memory health reports and reflections

This agent is critical for turning raw accumulated knowledge into
high-quality, queryable, and compact long-term memory — a key requirement
for self-sustaining AGI.

It communicates exclusively via MCP and reads/writes to the shared VectorMemory.
"""

import logging
import re
import time
from typing import Any, Dict, List, Optional, cast

from mcp.protocol import BaseMCPAgent, MessageType, MCPMessage
from vector_memory import VectorMemory

# Shared Task Queue support
try:
    from tasks.task_queue import (
        list_pending_tasks, claim_task, complete_task, fail_task
    )
    TASK_QUEUE_AVAILABLE = True
except ImportError:
    TASK_QUEUE_AVAILABLE = False

    def list_pending_tasks() -> list[dict[str, Any]]:
        return []

    def claim_task(task_id: str) -> bool:
        return False

    def complete_task(task_id: str, result: dict[str, Any] | None = None) -> bool:
        return False

    def fail_task(task_id: str, error: str) -> bool:
        return False

try:
    from config import get_ollama_client, OLLAMA_DEFAULT_MODEL, configure_ollama_env
    configure_ollama_env()
    ollama = get_ollama_client()
except Exception:
    ollama = None
    OLLAMA_DEFAULT_MODEL = "qwen2.5:32b"

logger = logging.getLogger("MemorySynthesizer")


class MemorySynthesizerAgent(BaseMCPAgent):
    """
    Sub-agent specialized in memory maintenance and synthesis.
    """

    def __init__(self, name: str = "memory_synthesizer"):
        super().__init__(name=name)
        try:
            from config import configure_ollama_env
            configure_ollama_env()
        except Exception:
            pass
        try:
            self.vm = VectorMemory()  # Shared persistent vector memory
        except Exception as e:
            logger.error(f"VectorMemory init failed: {e}")
            self.vm = cast(Any, None)

        # Register custom handler
        self.mcp.register_handler(MessageType.TASK_REQUEST, self.handle_task_request)

    def get_capabilities(self) -> List[str]:
        return [
            "memory_synthesis",
            "consolidation",
            "deduplication",
            "importance_scoring",
            "memory_health_reporting",
            "reflection_generation"
        ]

    # -------------------------------------------------------------------------
    # Main Task Handler
    # -------------------------------------------------------------------------

    def handle_task_request(self, msg: MCPMessage):
        task_type = msg.payload.get("task_type", "full_synthesis")
        context = msg.payload.get("context", {})
        project = context.get("project", "general")

        logger.info(f"MemorySynthesizer received task: {task_type} | project={project}")

        result = {"status": "started", "task_type": task_type}

        if task_type in ["full_synthesis", "consolidate_all"]:
            result = self._run_full_synthesis(context)
        elif task_type == "project_synthesis":
            result = self._run_project_synthesis(project, context)
        elif task_type == "importance_scoring":
            result = self._run_importance_scoring(context)
        elif task_type == "generate_reflection":
            result = self._generate_periodic_reflection(context)
        elif task_type == "health_report":
            result = self._generate_memory_health_report(context)
        elif task_type in ["advanced_clustering", "cluster_and_synthesize"]:
            result = self._run_advanced_semantic_clustering(context)
        else:
            result = {"status": "error", "message": f"Unknown task_type: {task_type}"}

        # Report result back
        self.mcp.report_result(
            to_agent=msg.from_agent,
            correlation_id=msg.correlation_id,
            result=result
        )

        # Optionally store a high-level summary of what was done
        if result.get("status") == "success" and getattr(self, "vm", None) is not None:
            self.vm.add(
                content=f"MemorySynthesizer completed {task_type}. Summary: {result.get('summary', '')}",
                metadata={
                    "type": "synthesis_log",
                    "task_type": task_type,
                    "project": project,
                    "agent": self.name,
                    "timestamp": time.time()
                }
            )

    # -------------------------------------------------------------------------
    # Synthesis Logic
    # --------------------
```