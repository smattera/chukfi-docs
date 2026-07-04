---
title: Development Guide
description: Developing and extending the Chukfi Teams Bot — adding tools, testing, and debugging.
---

## Project Structure

```
chukfi-teams-bot/
├── main.py          # FastAPI server, routes, HMAC verification
├── agent.py         # Bedrock Converse API, tool definitions, tool loop
├── executor.py      # Guarded CLI subprocess wrapper (safety gate)
├── config.py        # Hardcoded guardrails + env-based settings
├── models.py        # Pydantic models (Teams payload, responses)
├── requirements.txt # Python dependencies
├── Dockerfile       # Multi-stage Docker build
├── .env.example     # Environment variable template
└── README.md        # Quick start guide
```

## Adding a New Tool

### 1. Add the executor function

In `executor.py`, add a new handler function:

```python
def handle_delete_entry(entry_id: str) -> dict:
    """Delete a content entry."""
    args = [
        "content", "delete",
        "--id", entry_id,
        "--json",
    ]
    return _run_cli(args)
```

### 2. Add the tool definition

In `agent.py`, add the tool spec to the `TOOLS` list:

```python
{
    "toolSpec": {
        "name": "delete_entry",
        "description": "Delete a content entry by its UUID. "
                       "Use this when staff asks to remove content.",
        "inputSchema": {
            "json": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "Entry UUID to delete",
                    },
                },
                "required": ["id"],
            }
        },
    }
},
```

### 3. Wire up the handler

In `agent.py`, add the tool call handler in `_handle_tool_call()`:

```python
elif tool_name == "delete_entry":
    result = handle_delete_entry(
        entry_id=tool_input["id"],
    )
```

### 4. Add guardrails (if needed)

If the new tool needs safety controls, add them in `config.py`:

```python
# Prevent deletion of published content
ALLOW_DELETE_PUBLISHED: ClassVar[bool] = False
```

## Testing

### Unit Tests

Test the executor functions directly (they don't need Bedrock):

```python
# test_executor.py
from executor import handle_create_entry, GuardrailViolation

def test_create_entry_rejects_unknown_type():
    with pytest.raises(GuardrailViolation):
        handle_create_entry(type_slug="malicious-type", title="test")

def test_create_entry_always_draft():
    result = handle_create_entry(type_slug="blog-posts", title="Test")
    assert result["success"]
```

### Integration Tests

Test the full pipeline with a local Bedrock endpoint:

```bash
# Start the server
TEAMS_WEBHOOK_SECRET="" uvicorn main:app --reload --port 8000

# Test create
curl -X POST http://localhost:8000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"text":"Create a blog post about test results","from":{"name":"test@example.com"}}'

# Test list
curl -X POST http://localhost:8000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"text":"Show me recent blog posts","from":{"name":"test@example.com"}}'
```

## Debugging

### Enable Debug Logging

```bash
LOG_LEVEL=DEBUG uvicorn main:app --reload
```

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `401 Invalid HMAC signature` | Wrong webhook secret | Check `TEAMS_WEBHOOK_SECRET` matches Teams config |
| `Bedrock API error` | No Bedrock access | Verify IAM permissions and model access in AWS console |
| `CLI failed (exit=1)` | Database unreachable | Check `DATABASE_URL` and PostgreSQL connectivity |
| `Access Denied` | Wrong tenant | Update `ALLOWED_TENANTS` in `config.py` |
| Bot not responding in Teams | Wrong callback URL | Verify the webhook URL is publicly accessible |

### Testing HMAC Locally

```python
# test_hmac.py
import base64, hashlib, hmac

secret = "your-teams-secret"
body = b'{"text":"test"}'

key = base64.b64decode(secret)
hashed = hmac.new(key, body, hashlib.sha256).digest()
sig = base64.b64encode(hashed).decode("utf-8")

print(f"Authorization: HMAC {sig}")
```

## Security Best Practices

1. **Never put secrets in code** — Use environment variables or AWS Secrets Manager
2. **Keep guardrails in Python, not prompts** — Prompt-based guardrails can be bypassed
3. **Use least-privilege IAM** — The bot only needs `bedrock:InvokeModel` for one model
4. **Enable HMAC in production** — Dev mode (`TEAMS_WEBHOOK_SECRET=""`) is for local testing only
5. **Monitor for unauthorized access** — Set up alerts on 401 responses
6. **Keep Claude's temperature low** — 0.3 ensures deterministic tool selection
7. **Limit tool rounds** — 5 max prevents runaway loops
