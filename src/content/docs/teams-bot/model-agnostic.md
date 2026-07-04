---
title: Model-Agnostic Architecture
description: How the Chukfi Teams Bot is designed to work with any LLM provider, not just Amazon Bedrock.
---

## Design Principle

The Teams Bot is designed to be **model-agnostic**. While the default configuration uses Amazon Bedrock with Claude 3.5 Haiku, the architecture supports swapping in any LLM provider that supports tool-use (function calling).

## Current Architecture

```
agent.py (tool definitions + tool loop)
    │
    ├── bedrock_client.py  ← Amazon Bedrock (default)
    ├── openai_client.py   ← OpenAI / Azure OpenAI (optional)
    ├── anthropic_client.py ← Anthropic Direct (optional)
    └── ollama_client.py   ← Local LLM (optional)
```

## Provider Abstraction

The `agent.py` file contains the tool definitions and tool loop logic. The provider-specific code is isolated in the `_get_bedrock_client()` function and the `client.converse()` call. To add a new provider:

### 1. Create a provider adapter

```python
# openai_client.py
from openai import OpenAI

def get_openai_client():
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def converse_openai(client, messages, tools, system):
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o"),
        messages=[{"role": "system", "content": system}] + messages,
        tools=tools,
        tool_choice="auto",
    )
    return response
```

### 2. Swap the provider in agent.py

```python
# agent.py — provider selection
PROVIDER = os.getenv("LLM_PROVIDER", "bedrock")

if PROVIDER == "bedrock":
    client = _get_bedrock_client()
    response = client.converse(...)
elif PROVIDER == "openai":
    client = get_openai_client()
    response = converse_openai(client, messages, TOOLS, SYSTEM_PROMPT)
```

### 3. No changes needed to executor.py or config.py

The tool definitions, guardrails, and CLI execution are all provider-agnostic. Only the API call changes.

## Supported Providers

| Provider | Model | Status | Notes |
|----------|-------|--------|-------|
| **Amazon Bedrock** | Claude 3.5 Haiku | ✅ Default | Best latency/cost balance |
| **Amazon Bedrock** | Claude 3.5 Sonnet | ✅ Supported | Better reasoning, higher cost |
| **Amazon Bedrock** | Llama 3.1 70B | ✅ Supported | Open source alternative |
| **OpenAI** | GPT-4o / GPT-4o-mini | ⚡ Easy swap | Different tool schema format |
| **Anthropic Direct** | Claude 3.5 Haiku/Sonnet | ⚡ Easy swap | Same model, different API |
| **Ollama** | Any local model | 🔧 Possible | Requires tool-use capable model |

## Why Bedrock Is the Default

1. **No API key management** — Uses IAM roles, which are more secure for production
2. **AWS integration** — Same account as the Chukfi CMS deployment
3. **No data sharing** — Bedrock doesn't train on your data
4. **Cost control** — Per-request pricing with no monthly commitments
5. **Haiku is fast** — ~3 second response time for typical tool-use requests
