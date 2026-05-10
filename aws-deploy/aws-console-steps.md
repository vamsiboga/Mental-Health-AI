# AWS Console Setup Steps

## Step 1 - Create ECS Task Execution Role

1. Go to https://console.aws.amazon.com/iam
2. Click Roles in the left sidebar
3. Click Create role
4. Select AWS service as trusted entity type
5. Select Elastic Container Service from the dropdown
6. Select Elastic Container Service Task as the use case
7. Click Next
8. Search for and attach these policies:
   - AmazonECSTaskExecutionRolePolicy
   - AmazonSSMReadOnlyAccess
   - SecretsManagerReadWrite
9. Click Next
10. Name the role: ecsTaskExecutionRole
11. Click Create role
12. Copy the Role ARN — you will need it for the task definition

## Step 2 - Update Task Definition with Your Account ID

1. Open aws-deploy/ecs-task-definition.json
2. Replace all instances of ACCOUNT_ID with your actual AWS account ID
3. Your account ID is the 12-digit number shown when you run:
   aws sts get-caller-identity --query Account --output text

## Step 3 - Run the AWS Setup Script

From PowerShell in your project root:
bash aws-deploy/setup-aws.sh

Or run each AWS CLI command manually if bash is not available on Windows.

## Step 4 - Register the ECS Task Definition

aws ecs register-task-definition --cli-input-json file://aws-deploy/ecs-task-definition.json

## Step 5 - Create ECS Service

Replace SUBNET_ID and SECURITY_GROUP_ID with values from your VPC:

aws ecs create-service \
  --cluster mental-health-ai-cluster \
  --service-name mental-health-ai-backend-service \
  --task-definition mental-health-ai-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[SUBNET_ID],securityGroups=[SECURITY_GROUP_ID],assignPublicIp=ENABLED}"

To find your subnet ID:
aws ec2 describe-subnets --query "Subnets[0].SubnetId" --output text

To find your default security group:
aws ec2 describe-security-groups --filters Name=group-name,Values=default --query "SecurityGroups[0].GroupId" --output text

## Step 6 - Build and Push Docker Image to ECR

Run from your project root:
bash aws-deploy/deploy-backend.sh

## Step 7 - Deploy Frontend to S3

Run from your project root:
bash aws-deploy/deploy-frontend.sh YOUR_ECS_PUBLIC_IP

## Step 8 - Set Up CloudFront

bash aws-deploy/setup-cloudfront.sh

## Step 9 - Add All GitHub Secrets

Follow the instructions in aws-deploy/github-secrets-needed.md

## Step 10 - Verify Everything Works

Backend health check:
curl http://YOUR_ECS_PUBLIC_IP:8000/health

Frontend:
Open your CloudFront URL in browser

GitHub Actions auto-deploy:
Push any change to main branch and watch the Actions tab
