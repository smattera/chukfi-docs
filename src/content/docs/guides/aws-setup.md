---
title: AWS Setup
description: Configure your AWS environment for Chukfi CMS development — CLI credentials, IAM permissions, and cost overview
---

# AWS Setup for Chukfi CMS

Every Chukfi developer gets their own AWS RDS PostgreSQL instance for local development. This guide walks you through the one-time setup.

## Step 1: Install the AWS CLI

```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

## Step 2: Create an IAM user (if you don't have one)

1. Go to the [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Create a new user with **Programmatic access**
3. Attach this policy — the minimum permissions `chukfi db` needs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds:CreateDBInstance",
        "rds:DeleteDBInstance",
        "rds:DescribeDBInstances",
        "rds:ListTagsForResource"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Copy the **Access Key ID** and **Secret Access Key**.

## Step 3: Run `aws configure`

```bash
aws configure
```

You'll be prompted for:
- **AWS Access Key ID**: paste from step 2
- **AWS Secret Access Key**: paste from step 2
- **Default region name**: `us-east-1` (or your preferred region)
- **Default output format**: `json` (or leave blank)

This creates `~/.aws/credentials` and `~/.aws/config` — `chukfi` reads these automatically.

## Step 4: Create your database

```bash
chukfi db create --name my-chukfi-dev --region us-east-1
```

This creates a `db.t4g.micro` PostgreSQL 16 instance tagged `Project=chukfi-dev`. Takes ~10 minutes. When it finishes, you'll get a `DATABASE_URL` to paste into your `.env` file.

## Security

`chukfi db create` makes your instance publicly accessible, secured by an auto-generated 32-character random password. When you're done working, destroy it:

```bash
chukfi db destroy --id my-chukfi-dev --yes
```

IP-locking via security groups ships in a future release — track progress on the [Roadmap](/project/roadmap/).

## Cost

Each `db.t4g.micro` RDS instance costs approximately **$15/month** while running. Tear down when not in use to avoid charges. For production deployments, see [Deployment](/deployment/overview/).
