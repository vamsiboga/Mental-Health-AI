#!/bin/bash
set -e

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
APP_NAME="mental-health-ai"
S3_BUCKET="${APP_NAME}-frontend-${AWS_ACCOUNT_ID}"
BACKEND_URL=${1:-"http://localhost:8000"}

echo "Deploying frontend to AWS S3..."
echo "S3 Bucket: $S3_BUCKET"
echo "Backend URL: $BACKEND_URL"

echo ""
echo "Step 1 - Building React app for production..."
cd ../frontend
echo "VITE_API_URL=${BACKEND_URL}" > .env.production
npm ci
npm run build

echo ""
echo "Step 2 - Syncing to S3..."
aws s3 sync dist/ s3://${S3_BUCKET} \
  --delete \
  --region $AWS_REGION

echo ""
echo "Step 3 - Setting cache headers..."
aws s3 cp s3://${S3_BUCKET}/index.html s3://${S3_BUCKET}/index.html \
  --metadata-directive REPLACE \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

echo ""
echo "Frontend deployed to S3!"
echo "URL: http://${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
echo ""
echo "To set up CloudFront CDN run: aws-deploy/setup-cloudfront.sh"
