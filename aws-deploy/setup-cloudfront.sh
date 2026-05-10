#!/bin/bash
set -e

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
APP_NAME="mental-health-ai"
S3_BUCKET="${APP_NAME}-frontend-${AWS_ACCOUNT_ID}"

echo "Setting up CloudFront distribution..."

DISTRIBUTION=$(aws cloudfront create-distribution \
  --origin-domain-name "${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com" \
  --default-root-object index.html \
  --output json)

DISTRIBUTION_ID=$(echo $DISTRIBUTION | python3 -c "import sys,json; print(json.load(sys.stdin)['Distribution']['Id'])")
DISTRIBUTION_URL=$(echo $DISTRIBUTION | python3 -c "import sys,json; print(json.load(sys.stdin)['Distribution']['DomainName'])")

echo ""
echo "CloudFront distribution created!"
echo "Distribution ID: $DISTRIBUTION_ID"
echo "CloudFront URL: https://$DISTRIBUTION_URL"
echo ""
echo "Save these values as GitHub secrets:"
echo "CF_DISTRIBUTION_ID = $DISTRIBUTION_ID"
