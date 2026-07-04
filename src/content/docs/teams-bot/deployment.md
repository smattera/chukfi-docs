---
title: Deployment Guide
description: Deploying the Chukfi Teams Bot to production — Docker, ECS Fargate, and CI/CD.
---

## Deployment Options

### Option 1: ECS Fargate (Recommended)

The bot is designed to run on AWS ECS Fargate alongside the Chukfi CMS backend.

#### Step 1: Build and Push to ECR

```bash
# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name chukfi-teams-bot

# Build and push
docker build -t chukfi-teams-bot -f chukfi-teams-bot/Dockerfile .
docker tag chukfi-teams-bot:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/chukfi-teams-bot:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/chukfi-teams-bot:latest
```

#### Step 2: Create ECS Task Definition

```json
{
    "family": "chukfi-teams-bot",
    "taskRoleArn": "arn:aws:iam::<account-id>:role/chukfi-teams-bot-task-role",
    "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "containerDefinitions": [
        {
            "name": "chukfi-teams-bot",
            "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/chukfi-teams-bot:latest",
            "portMappings": [{"containerPort": 8000, "protocol": "tcp"}],
            "environment": [
                {"name": "AWS_REGION", "value": "us-east-1"},
                {"name": "BEDROCK_MODEL_ID", "value": "anthropic.claude-3-5-haiku-20241022-v1:0"},
                {"name": "DATABASE_URL", "value": "postgresql://..."},
                {"name": "LOG_LEVEL", "value": "INFO"}
            ],
            "secrets": [
                {"name": "TEAMS_WEBHOOK_SECRET", "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:teams-webhook-secret"}
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/chukfi-teams-bot",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
```

#### Step 3: Deploy Behind ALB

1. Create an Application Load Balancer in the same VPC
2. Create a target group for port 8000 (health check path: `/health`)
3. Create an HTTPS listener with an ACM certificate
4. Register the ECS service with the target group
5. Point `teams-bot.yourdomain.com` at the ALB DNS name

### Option 2: Cloud VM

Any Linux VM works. The bot is lightweight:

```bash
# Install dependencies
apt update && apt install -y python3 python3-pip
pip install -r requirements.txt

# Run as a systemd service
cat > /etc/systemd/system/chukfi-teams-bot.service << 'EOF'
[Unit]
Description=Chukfi Teams Bot
After=network.target

[Service]
Type=simple
User=chukfi
WorkingDirectory=/opt/chukfi-teams-bot
EnvironmentFile=/opt/chukfi-teams-bot/.env
ExecStart=/usr/local/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl enable --now chukfi-teams-bot
```

### Option 3: Docker Compose (Local/Staging)

```yaml
version: "3.8"
services:
  teams-bot:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file: .env
    restart: unless-stopped
```

## CI/CD

### GitHub Actions

```yaml
name: Deploy Teams Bot

on:
  push:
    branches: [main]
    paths:
      - 'chukfi-teams-bot/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Build and push to ECR
        run: |
          docker build -t chukfi-teams-bot -f chukfi-teams-bot/Dockerfile .
          docker tag chukfi-teams-bot:latest $ECR_REPO:latest
          docker push $ECR_REPO:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster chukfi \
            --service chukfi-teams-bot \
            --force-new-deployment
```

## Health Checks

The bot exposes a health check endpoint:

```bash
curl https://your-server.com/health
# {"status": "ok", "version": "0.1.0"}
```

Configure your load balancer or orchestrator to use `GET /health` with a 30-second interval.

## Monitoring

### CloudWatch Logs

The bot logs structured JSON to stdout. Key things to monitor:

- **`Message from %s (Tenant: %s)`** — Incoming requests
- **`Tool call: %s(%s)`** — Every tool execution
- **`CLI failed (exit=%d)`** — CLI errors
- **`Bedrock API error`** — Bedrock connectivity issues
- **`Unauthorized access attempt`** — Security events

### Alarms

Set up CloudWatch alarms for:

- **5xx errors** on the ALB → Bedrock or CLI failure
- **401 responses** → Possible HMAC misconfiguration or intrusion attempt
- **Zero requests in 1 hour** → Bot may be down
