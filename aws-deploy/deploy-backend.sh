#!/bin/bash
set -e

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
APP_NAME="mental-health-ai"
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_TAG=${1:-latest}

echo "Deploying backend to AWS..."
echo "Account: $AWS_ACCOUNT_ID"
echo "Region: $AWS_REGION"
echo "Tag: $IMAGE_TAG"

echo ""
echo "Step 1 - Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin ${ECR_URI}

echo ""
echo "Step 2 - Building backend Docker image..."
cd ..
docker build -f Dockerfile.backend \
  -t ${APP_NAME}-backend:${IMAGE_TAG} .

echo ""
echo "Step 3 - Tagging image for ECR..."
docker tag ${APP_NAME}-backend:${IMAGE_TAG} \
  ${ECR_URI}/${APP_NAME}-backend:${IMAGE_TAG}
docker tag ${APP_NAME}-backend:${IMAGE_TAG} \
  ${ECR_URI}/${APP_NAME}-backend:latest

echo ""
echo "Step 4 - Pushing image to ECR..."
docker push ${ECR_URI}/${APP_NAME}-backend:${IMAGE_TAG}
docker push ${ECR_URI}/${APP_NAME}-backend:latest

echo ""
echo "Step 5 - Updating ECS task definition..."
TASK_DEF=$(cat aws-deploy/ecs-task-definition.json | \
  sed "s/ACCOUNT_ID/${AWS_ACCOUNT_ID}/g")
echo $TASK_DEF > /tmp/task-def.json
aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-def.json \
  --region $AWS_REGION

echo ""
echo "Step 6 - Updating ECS service..."
aws ecs update-service \
  --cluster ${APP_NAME}-cluster \
  --service ${APP_NAME}-backend-service \
  --task-definition mental-health-ai-backend \
  --force-new-deployment \
  --region $AWS_REGION

echo ""
echo "Backend deployed successfully!"
echo "Monitor deployment: https://console.aws.amazon.com/ecs"
