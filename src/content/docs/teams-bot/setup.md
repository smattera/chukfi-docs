---
title: Setup Guide
description: How to set up the Chukfi Teams Bot — AWS Bedrock, Teams Outgoing Webhook, and deployment.
---

## Prerequisites

- Python 3.11+
- An **AWS account** with Bedrock access (Claude 3.5 Haiku)
- A **Microsoft 365 tenant** with Teams
- The **`chukfi` CLI binary** compiled and on PATH
- A **PostgreSQL database** for the Chukfi CMS

## Step 1: Enable Amazon Bedrock

### Request Claude 3.5 Haiku Access

1. Go to the [AWS Bedrock console](https://console.aws.amazon.com/bedrock/)
2. In the left sidebar, click **Model access**
3. Click **Manage model access**
4. Find **Claude 3.5 Haiku** by Anthropic and request access
5. Wait for approval (usually instant for Haiku)

### Configure AWS Credentials

The bot uses the standard AWS credential chain (env vars, `~/.aws/credentials`, or IAM role):

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
```

For production on ECS, attach an IAM role with the `BedrockRuntimeAccess` policy.

### Verify Bedrock Access

```bash
aws bedrock-runtime converse \
  --model-id anthropic.claude-3-5-haiku-20241022-v1:0 \
  --messages '[{"role":"user","content":[{"text":"Hello"}]}]'
```

## Step 2: Set Up the Teams Outgoing Webhook

1. Open **Microsoft Teams**
2. Go to your team → **Apps** → **Outgoing Webhook**
3. Configure:
   - **Name:** `Chukfi CMS Bot`
   - **Callback URL:** `https://your-server.com/api/webhook`
   - **Description:** `AI-powered content management`
4. Click **Create**
5. **Copy the HMAC secret** — you'll need it for the environment config

## Step 3: Configure the Bot

### Clone and Install

```bash
git clone https://github.com/smattera/chukfi-teams-bot.git
cd chukfi-teams-bot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Environment Variables

Copy the example config and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `AWS_REGION` | Yes | AWS region for Bedrock (default: `us-east-1`) |
| `BEDROCK_MODEL_ID` | No | Bedrock model ID (default: `anthropic.claude-3-5-haiku-20241022-v1:0`) |
| `TEAMS_WEBHOOK_SECRET` | Yes | HMAC secret from Teams Outgoing Webhook |
| `CHUKFI_BIN` | No | Path to `chukfi` binary (default: found on PATH) |
| `CHUKFI_CONFIG` | No | Path to `chukfi.config.json` (default: `./chukfi.config.json`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `LOG_LEVEL` | No | Logging level (default: `INFO`) |

### Update Tenant IDs

Edit `config.py` to set your actual Entra Tenant UUIDs:

```python
ALLOWED_TENANTS: ClassVar[set[str]] = {
    "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",  # Your tenant UUID
}
```

## Step 4: Run the Bot

### Development Mode

```bash
# Disable HMAC auth for local testing
TEAMS_WEBHOOK_SECRET="" uvicorn main:app --reload --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Test with curl

```bash
curl -X POST http://localhost:8000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"text":"Create a blog post about flu shots","from":{"name":"dev@nativeconsult.io"}}'
```

## Step 5: Deploy

### Docker

```bash
# Build the image (from the repo root)
docker build -t chukfi-teams-bot -f chukfi-teams-bot/Dockerfile .

# Run with env file
docker run -p 8000:8000 --env-file .env chukfi-teams-bot
```

### ECS Fargate (Recommended)

1. Push the Docker image to Amazon ECR
2. Create an ECS task definition with the image
3. Set environment variables in the task definition or AWS Secrets Manager
4. Attach an IAM task role with Bedrock runtime access
5. Deploy behind an Application Load Balancer
6. Point your domain's DNS at the ALB

### Cloud VM

Any Linux VM works. The bot is lightweight — 0.25 vCPU / 512 MB is sufficient.

## Step 6: Test in Teams

1. Go to your team channel in Microsoft Teams
2. Type `@Chukfi CMS Bot create a blog post about fall health tips`
3. The bot should respond with a confirmation and the entry ID
4. Check the admin UI — the entry should appear in **draft** status
5. Review and publish via the admin interface
