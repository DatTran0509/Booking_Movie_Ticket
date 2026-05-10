#!/bin/bash
set -euo pipefail

# This script is executed by AWS EC2 instances on startup (Launch Template User Data).
# It pulls pre-built Docker images from ECR and starts the application.

APP_ROOT="/opt/booking-movie-ticket"
APP_DIR="$APP_ROOT/app"
BRANCH="main"
REGION="ap-southeast-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
SSM_ENV_PARAM_NAME="/booking-movie-ticket/prod/env"

# 1. Update and install dependencies
yum update -y
yum install -y docker git jq amazon-cloudwatch-agent
systemctl enable docker
systemctl start docker
usermod -a -G docker ec2-user || true

# 2. Configure and start CloudWatch Agent to ship Docker logs
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<'EOF'
{
  "agent": {
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/lib/docker/containers/**/*-json.log",
            "log_group_name": "/booking-movie-ticket/docker",
            "log_stream_name": "{instance_id}",
            "timezone": "UTC",
            "multi_line_start_pattern": "^\\{",
            "timestamp_format": "%Y-%m-%dT%H:%M:%S.%fZ"
          }
        ]
      }
    }
  }
}
EOF

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s

# 3. Install Docker Compose v2 system-wide
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/v2.26.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# 4. Setup Directories
mkdir -p "$APP_ROOT/shared"
chown -R ec2-user:ec2-user "$APP_ROOT"

# 5. Pull docker-compose.yml from repo (only config files needed, no build)
if [ ! -d "$APP_DIR/.git" ]; then
  git clone --branch "$BRANCH" --single-branch --depth 1 "https://github.com/DatTran0509/Booking_Movie_Ticket.git" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
fi

# 6. Fetch .env securely from AWS Systems Manager Parameter Store
echo "Fetching secrets from AWS SSM..."
aws ssm get-parameter \
  --name "$SSM_ENV_PARAM_NAME" \
  --with-decryption \
  --region "$REGION" \
  --query "Parameter.Value" \
  --output text > "$APP_DIR/.env"

# Append ECR registry for docker-compose image references
echo "" >> "$APP_DIR/.env"
echo "ECR_REGISTRY=$ECR_REGISTRY" >> "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

# 7. Login to ECR, pull pre-built images, and start application
export AWS_REGION="$REGION"
aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY"

cd "$APP_DIR"
docker compose pull
docker compose --project-name "booking-movie-ticket" up -d --remove-orphans

echo "User Data Bootstrap completed successfully."
