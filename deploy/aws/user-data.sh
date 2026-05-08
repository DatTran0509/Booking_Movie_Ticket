#!/bin/bash
set -euo pipefail

# This script is executed by AWS EC2 instances on startup (Launch Template User Data).
# It installs dependencies, fetches secrets securely from AWS SSM Parameter Store, and starts the app.

APP_ROOT="/opt/booking-movie-ticket"
APP_DIR="$APP_ROOT/app"
BRANCH="main"
REGION="ap-southeast-1" # Replace with your target region
SSM_ENV_PARAM_NAME="/booking-movie-ticket/prod/env"

# 1. Update and install dependencies
yum update -y
yum install -y docker git jq
systemctl enable docker
systemctl start docker
usermod -a -G docker ec2-user || true

# Install Docker Compose v2 system-wide
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/v2.26.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# 2. Setup Directories
mkdir -p "$APP_ROOT/shared"
chown -R ec2-user:ec2-user "$APP_ROOT"

# 3. Clone / Update Repository
if [ ! -d "$APP_DIR/.git" ]; then
  git clone --branch "$BRANCH" --single-branch "https://github.com/DatTran0509/Booking_Movie_Ticket.git" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
fi

# 4. Fetch .env securely from AWS Systems Manager Parameter Store
# The EC2 instance must have an IAM Role attached with ssm:GetParameter permission.
echo "Fetching secrets from AWS SSM..."
aws ssm get-parameter \
  --name "$SSM_ENV_PARAM_NAME" \
  --with-decryption \
  --region "$REGION" \
  --query "Parameter.Value" \
  --output text > "$APP_DIR/.env"

chmod 600 "$APP_DIR/.env"

# 5. Start Application via Docker Compose
cd "$APP_DIR"

docker compose \
  --project-name "booking-movie-ticket" \
  up -d --build --remove-orphans

echo "User Data Bootstrap completed successfully."
