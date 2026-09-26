# PADRAO - ai-patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\temporal\skills\temporal-developer\references\python\ai-patterns.md
**SHA:** 64304435d8c47de0
**Timestamp:** 2026-08-26T18:42:20.363957
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- system_prompt: str
- async def run(self, prompt: str) -> str:
- system_prompt="You are a helpful assistant.",
- system_prompt="You are a helpful agent with tools.",

### Ouro Bruto (primeiros 5000 chars)
```
# Python AI/LLM Integration Patterns

## Overview

This document provides Python-specific implementation details for integrating LLMs with Temporal. For conceptual patterns, see `references/core/ai-patterns.md`.

## Pydantic Data Converter Setup

**Required** for handling complex types like OpenAI response objects:

```python
from temporalio.client import Client
from temporalio.contrib.pydantic import pydantic_data_converter

client = await Client.connect(
    "localhost:7233",
    namespace="default",
    data_converter=pydantic_data_converter,
)
```

## OpenAI Client Configuration

**Critical**: Disable client retries, let Temporal handle them:

```python
from openai import AsyncOpenAI

openai_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    max_retries=0,  # CRITICAL: Disable client retries
    timeout=30.0,
)
```

## LiteLLM Configuration

For multi-model support:

```python
import litellm

litellm.num_retries = 0  # Disable LiteLLM retries
```

## Generic LLM Activity

Flexible, reusable activity for LLM calls:

```python
import openai
from temporalio import activity
from temporalio.exceptions import ApplicationError
from pydantic import BaseModel
from typing import Optional, Any

class LLMRequest(BaseModel):
    model: str
    system_prompt: str
    user_input: str
    tools: Optional[list] = None
    response_format: Optional[type] = None
    temperature: float = 0.7

class LLMResponse(BaseModel):
    content: str
    tool_calls: Optional[list] = None
    usage: dict

@activity.defn
async def call_llm(request: LLMRequest) -> LLMResponse:
    """Generic LLM activity supporting multiple use cases."""
    try:
        # As an example, calling OpenAI. This could be any chat API you wish though...
        response = await openai_client.chat.completions.create(
            model=request.model,
            messages=[
                {"role": "system", "content": request.system_prompt},
                {"role": "user", "content": request.user_input},
            ],
            tools=request.tools,
            temperature=request.temperature,
        )
        return LLMResponse(
            content=response.choices[0].message.content or "",
            tool_calls=response.choices[0].message.tool_calls,
            usage=response.usage.model_dump(),
        )

    # Some example error cases to handle. These are not necessarily exhaustive, and depend on the API you are actually calling!
    except openai.AuthenticationError as e:
        # Invalid API key - permanent failure, don't retry
        raise ApplicationError(
            f"Invalid API key: {e}",
            type="AuthenticationError",
            non_retryable=True,
        )

    except openai.RateLimitError as e:
        # Rate limited - transient, let Temporal retry with backoff
        raise ApplicationError(
            f"Rate limited: {e}",
            type="RateLimitError",
            next_retry_delay=... # parse this from headers
        )

    except openai.APIStatusError as e:
        if e.status_code >= 500:
            # Server error - transient, retry
            raise ApplicationError(
                f"OpenAI server error ({e.status_code}): {e}",
                type="ServerError",
            )
        else:
            # Other client errors (400, etc.) - likely permanent
            raise ApplicationError(
                f"OpenAI client error ({e.status_code}): {e}",
                type="ClientError",
                non_retryable=True,
            )

    except openai.APIConnectionError as e:
        # Network error - transient, retry
        raise ApplicationError(
            f"Connection error: {e}",
            type="ConnectionError",
        )
```

## Activity Retry Policy

Configure retries at the workflow level:

```python
from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from activities.llm import call_llm, LLMRequest

@workflow.defn
class LLMWorkflow:
    @workflow.run
    async def run(self, prompt: str) -> str:
        # Note that because call_llm classfies different types of exceptions as retryable / non-retryable,
        # we automatically get correct retry behavior just by calling it.
        response = await workflow.execute_activity(
            call_llm,
            LLMRequest(
                model="gpt-4",
                system_prompt="You are a helpful assistant.",
                user_input=prompt,
            ),
            start_to_close_timeout=timedelta(seconds=30),
        )
        return response.content
```

## Tool-Calling Agent Workflow

```python
from temporalio import workflow
from datetime import timedelta
from pydantic import BaseModel

with workflow.unsafe.imports_passed_through():
    from activities.llm import call_llm, LLMRequest, LLMResponse
    from activities.tools import execute_tool
    from models.tools import ToolDefinition

class AgentWorkflowInput(BaseModel)
```