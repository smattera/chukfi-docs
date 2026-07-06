---
title: Troubleshooting
description: Common issues and solutions for the Chukfi Teams Bot — HMAC, Bedrock, CLI, and connectivity problems.
---

## Quick Reference

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `401 Invalid HMAC signature` | Wrong webhook secret | Verify `TEAMS_WEBHOOK_SECRET` matches Teams config |
| `Bedrock API error` | No Bedrock access | Check IAM permissions and model access in AWS console |
| `CLI failed (exit=1)` | Database unreachable | Check `DATABASE_URL` and PostgreSQL connectivity |
| `Access Denied` | Wrong tenant | Update `ALLOWED_TENANTS` in `config.py` |
| Bot not responding in Teams | Wrong callback URL | Verify the webhook URL is publicly accessible |
| `502 Bad Gateway` from ALB | Bot process crashed | Check CloudWatch logs for startup errors |
| Empty response from bot | Claude returned no text | Check Bedrock model access and quota |

## HMAC Signature Issues

### Symptom: `401 Invalid HMAC signature`

The HMAC secret in your environment doesn't match what Teams configured.

**Check the secret:**

```bash
# Verify the secret is set
echo $TEAMS_WEBHOOK_SECRET

# If empty, check your .env file
grep TEAMS_WEBHOOK_SECRET .env
```

**Test HMAC locally:**

```python
# Save as test_hmac.py and run
import base64, hashlib, hmac

secret = "your-teams-secret"
body = b'{"text":"test"}'

key = base64.b64decode(secret)
hashed = hmac.new(key, body, hashlib.sha256).digest()
sig = base64.b64encode(hashed).decode("utf-8")

print(f"Authorization: HMAC {sig}")
```

**Common mistakes:**
- Copying the secret with extra whitespace
- Using the wrong secret (Teams generates a new one if you recreate the webhook)
- Secret is base64-encoded — don't decode it before passing to the bot

## Bedrock Connectivity

### Symptom: `Bedrock API error`

**Check AWS credentials:**

```bash
aws sts get-caller-identity
```

**Verify Bedrock model access:**

```bash
aws bedrock list-foundation-models \
  --query 'modelSummaries[?modelId==`anthropic.claude-3-5-haiku-20241022-v1:0`]'
```

**Test the Converse API directly:**

```bash
aws bedrock-runtime converse \
  --model-id anthropic.claude-3-5-haiku-20241022-v1:0 \
  --messages '[{"role":"user","content":[{"text":"Hello"}]}]'
```

**Check IAM policy:**

```json
{
    "Effect": "Allow",
    "Action": "bedrock:InvokeModel",
    "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-haiku-20241022-v1:0"
}
```

### Symptom: Throttling / Rate Limited

Claude 3.5 Haiku has a default quota of 4 requests per second (RPS) in us-east-1.

**Check your quota:**

```bash
aws service-quotas get-service-quota \
  --service-code bedrock \
  --quota-code L-9B2A3D5C
```

**Solutions:**
- Request a quota increase via the AWS console
- Add retry logic in `agent.py` for `ThrottlingException`
- Reduce concurrent users by adding a request queue

## CLI / Database Issues

### Symptom: `CLI failed (exit=1)`

**Check the CLI works standalone:**

```bash
chukfi --version
chukfi content list --type blog-posts --limit 1 --json
```

**Verify database connectivity:**

```bash
# Test with psql
psql "$DATABASE_URL" -c "SELECT 1"

# Check if migrations have been run
chukfi serve  # Runs migrations on startup
```

**Common causes:**
- `DATABASE_URL` is not set or incorrect
- PostgreSQL is not running or not accessible from the bot's network
- Migrations haven't been applied
- The `chukfi` binary is not on PATH or not executable

## Teams Connectivity

### Symptom: Bot not responding in Teams

**Check the callback URL is publicly accessible:**

```bash
curl -X POST https://your-server.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"text":"test","from":{"name":"test@example.com"}}'
```

**Verify DNS resolution:**

```bash
nslookup your-server.com
```

**Check the bot's health endpoint:**

```bash
curl https://your-server.com/health
# Should return: {"status": "ok", "version": "0.2.0"}
```

**Teams Outgoing Webhook requirements:**
- The callback URL must be HTTPS (not HTTP)
- The URL must be publicly accessible (not behind a VPN)
- The bot must respond within 5 seconds (Teams timeout)
- The response must match the expected format

### Symptom: `502 Bad Gateway` from ALB

The bot process crashed or is not responding.

**Check CloudWatch logs:**

```bash
aws logs get-log-events \
  --log-group-name /ecs/chukfi-teams-bot \
  --log-stream-name ecs/main/123456789
```

**Common causes:**
- Out of memory (Fargate tasks need at least 512 MB)
- Database connection pool exhausted
- Unhandled exception in the tool loop

## Monitoring & Alerts

### CloudWatch Logs Query

```sql
# Find errors in the last hour
fields @timestamp, @message
| filter @message like /ERROR|error|failed|exception/
| sort @timestamp desc
| limit 50
```

### Recommended Alarms

| Alarm | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| Bot Down | ALB 5xx count | > 0 for 2 minutes | PagerDuty / email |
| Auth Failures | 401 response count | > 5 in 5 minutes | Security team alert |
| Bedrock Errors | Bedrock API error count | > 3 in 5 minutes | Check AWS status |
| High Latency | ALB p99 latency | > 3 seconds | Scale up or optimize |

## Getting Help

If you've checked everything above and the issue persists:

1. **Check the GitHub issues** — [smattera/chukfi-docs/issues](https://github.com/smattera/chukfi-docs/issues)
2. **Enable debug logging** — Set `LOG_LEVEL=DEBUG` and reproduce the issue
3. **Collect logs** — Share CloudWatch log excerpts (redact secrets)
4. **Open an issue** — Include the log output, environment details, and steps to reproduce
