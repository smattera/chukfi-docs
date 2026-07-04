---
title: Cost Estimation
description: Estimated monthly costs for running the Chukfi Teams Bot with Amazon Bedrock Claude 3.5 Haiku.
---

## Monthly Cost Breakdown

### Bedrock API Costs (Claude 3.5 Haiku)

| Usage Scenario | Requests/Month | Input Tokens | Output Tokens | Est. Cost/Month |
|---------------|----------------|-------------|--------------|-----------------|
| **Light** (1-2 staff, occasional use) | 500 | 50K | 25K | **$0.05** |
| **Moderate** (3-5 staff, daily use) | 2,000 | 200K | 100K | **$0.20** |
| **Heavy** (10+ staff, frequent use) | 10,000 | 1M | 500K | **$1.00** |
| **Enterprise** (50+ staff, all-day use) | 50,000 | 5M | 2.5M | **$5.00** |

**Pricing (us-east-1):**
- Input: $0.25 per million tokens
- Output: $1.25 per million tokens
- Average request: ~100 input tokens + ~50 output tokens

### Infrastructure Costs

| Component | Light | Moderate | Heavy |
|-----------|-------|----------|-------|
| **ECS Fargate** (0.25 vCPU / 512 MB) | $4.38/mo | $4.38/mo | $4.38/mo |
| **ALB** (always-on) | $16.43/mo | $16.43/mo | $16.43/mo |
| **CloudWatch Logs** | ~$0.50/mo | ~$1.00/mo | ~$3.00/mo |
| **Total Infrastructure** | **~$21/mo** | **~$22/mo** | **~$24/mo** |

### Total Monthly Cost

| Scenario | Bedrock API | Infrastructure | **Total** |
|----------|------------|---------------|-----------|
| Light | $0.05 | $21 | **~$21** |
| Moderate | $0.20 | $22 | **~$22** |
| Heavy | $1.00 | $24 | **~$25** |

> **Note:** The ALB is the dominant cost. For very light usage, consider running the bot on a single EC2 t4g.nano instance (~$4/mo) without a load balancer.

## Cost Comparison by Model

| Model | Input $/1M tokens | Output $/1M tokens | Cost vs Haiku |
|-------|------------------|-------------------|---------------|
| **Claude 3.5 Haiku** | $0.25 | $1.25 | — (baseline) |
| **Claude 3.5 Sonnet** | $3.00 | $15.00 | **12x more** |
| **Llama 3.1 70B** | $0.59 | $0.79 | ~2x more |
| **Llama 3.1 8B** | $0.10 | $0.10 | ~0.5x less |
| **GPT-4o-mini** | $0.15 | $0.60 | ~0.5x less |

## Cost Optimization Tips

1. **Use Haiku for most requests** — It's fast enough for content management
2. **Keep responses concise** — The system prompt limits output to 1024 tokens
3. **Monitor with CloudWatch** — Set a budget alarm at $50/mo
4. **Consider Llama 3.1 8B** — If you need even lower cost, it's ~50% cheaper
5. **Cache common responses** — For FAQ-type queries, cache the response
6. **Use AWS Compute Savings Plans** — For 24/7 Fargate usage, save ~20%
