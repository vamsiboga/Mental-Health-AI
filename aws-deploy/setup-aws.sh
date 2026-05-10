#!/bin/bash
set -e

echo "================================================"
echo "Mental Health AI Assistant - AWS Setup Script"
echo "================================================"

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
APP_NAME="mental-health-ai"

echo "Account ID: $AWS_ACCOUNT_ID"
echo "Region: $AWS_REGION"

echo ""
echo "STEP 1 - Creating ECR repositories..."
aws ecr create-repository \
  --repository-name ${APP_NAME}-backend \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true \
  2>/dev/null || echo "Backend ECR repo already exists"

aws ecr create-repository \
  --repository-name ${APP_NAME}-frontend \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true \
  2>/dev/null || echo "Frontend ECR repo already exists"

echo "ECR repositories ready."

echo ""
echo "STEP 2 - Creating S3 bucket for frontend..."
aws s3 mb s3://${APP_NAME}-frontend-${AWS_ACCOUNT_ID} \
  --region $AWS_REGION \
  2>/dev/null || echo "S3 bucket already exists"

aws s3 website s3://${APP_NAME}-frontend-${AWS_ACCOUNT_ID} \
  --index-document index.html \
  --error-document index.html

echo "S3 bucket ready."

echo ""
echo "STEP 3 - Storing OpenAI API key in Secrets Manager..."
echo "Enter your OpenAI API key:"
read -s OPENAI_KEY
aws secretsmanager create-secret \
  --name "${APP_NAME}/openai-api-key" \
  --secret-string "{\"OPENAI_API_KEY\":\"${OPENAI_KEY}\"}" \
  --region $AWS_REGION \
  2>/dev/null || echo "Secret already exists. Updating..."
  aws secretsmanager update-secret \
    --secret-id "${APP_NAME}/openai-api-key" \
    --secret-string "{\"OPENAI_API_KEY\":\"${OPENAI_KEY}\"}" \
    --region $AWS_REGION

echo "Secret stored securely."

echo ""
echo "STEP 4 - Creating CloudWatch log group..."
aws logs create-log-group \
  --log-group-name /ecs/${APP_NAME} \
  --region $AWS_REGION \
  2>/dev/null || echo "Log group already exists"

echo "CloudWatch log group ready."

echo ""
echo "STEP 5 - Creating ECS cluster..."
aws ecs create-cluster \
  --cluster-name ${APP_NAME}-cluster \
  --capacity-providers FARGATE \
  --region $AWS_REGION \
  2>/dev/null || echo "ECS cluster already exists"

echo "ECS cluster ready."

echo ""
echo "================================================"
echo "AWS Infrastructure Setup Complete!"
echo ""
echo "Next values you will need:"
echo "ECR Backend URI: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-backend"
echo "ECR Frontend URI: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}-frontend"
echo "S3 Bucket: ${APP_NAME}-frontend-${AWS_ACCOUNT_ID}"
echo "ECS Cluster: ${APP_NAME}-cluster"
echo "================================================"
