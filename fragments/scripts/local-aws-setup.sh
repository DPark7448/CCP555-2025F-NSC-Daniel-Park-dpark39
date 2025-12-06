#!/bin/sh

set -euo pipefail

# Allow overriding AWS_CLI (default: aws on PATH) so this script works on Linux and WSL
AWS_CLI="${AWS_CLI:-aws}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "Setting AWS environment variables for LocalStack"

echo "AWS_ACCESS_KEY_ID=test"
export AWS_ACCESS_KEY_ID=test

echo "AWS_SECRET_ACCESS_KEY=test"
export AWS_SECRET_ACCESS_KEY=test

echo "AWS_SESSION_TOKEN=test"
export AWS_SESSION_TOKEN=test

export AWS_DEFAULT_REGION=$AWS_REGION
echo "AWS_DEFAULT_REGION=$AWS_REGION"

# Wait for LocalStack S3 to be ready (health endpoint)
echo 'Waiting for LocalStack S3...'
until (curl -s http://localhost:4566/_localstack/health 2>/dev/null | grep "\"s3\": \"\\(running\\|available\\)\"" > /dev/null); do
  sleep 5
done
echo 'LocalStack S3 Ready'

# Create our S3 bucket with LocalStack (unsigned is fine here)
echo "Creating LocalStack S3 bucket: fragments"
"$AWS_CLI" \
  --no-sign-request \
  --region "$AWS_REGION" \
  --endpoint-url=http://localhost:4566 \
  s3api create-bucket \
  --bucket fragments || true

# Setup DynamoDB Table with dynamodb-local
echo "Creating DynamoDB-Local DynamoDB table: fragments"
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_SESSION_TOKEN=test \
"$AWS_CLI" \
  --region "$AWS_REGION" \
  --endpoint-url=http://localhost:8000 \
  dynamodb create-table \
    --table-name fragments \
    --attribute-definitions \
      AttributeName=ownerId,AttributeType=S \
      AttributeName=id,AttributeType=S \
    --key-schema \
      AttributeName=ownerId,KeyType=HASH \
      AttributeName=id,KeyType=RANGE \
    --provisioned-throughput \
      ReadCapacityUnits=10,WriteCapacityUnits=5 || true

# Wait until the Fragments table exists
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_SESSION_TOKEN=test \
"$AWS_CLI" \
  --region "$AWS_REGION" \
  --endpoint-url=http://localhost:8000 \
  dynamodb wait table-exists --table-name fragments

echo "DynamoDB table fragments is ready"
