# GitHub Secrets Required for AWS Deployment

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add each of these secrets:

## Required Secrets

| Secret Name | Where to Find It | Description |
|-------------|-----------------|-------------|
| OPENAI_API_KEY | platform.openai.com → API Keys | Your OpenAI API key |
| AWS_ACCESS_KEY_ID | AWS Console → IAM → Users → Your user → Security credentials | AWS access key |
| AWS_SECRET_ACCESS_KEY | Same place as above — only shown once when created | AWS secret key |
| ECR_BACKEND_URI | Run: aws ecr describe-repositories --query repositories[0].repositoryUri | Full ECR URI for backend |
| S3_BUCKET | mental-health-ai-frontend-YOUR_ACCOUNT_ID | S3 bucket name |
| CF_DISTRIBUTION_ID | Output from setup-cloudfront.sh | CloudFront distribution ID |

## How to Get AWS Keys

1. Go to https://console.aws.amazon.com
2. Click your name in the top right corner
3. Click Security credentials
4. Scroll to Access keys section
5. Click Create access key
6. Choose CLI as the use case
7. Download the CSV file — it has both keys
8. Add them as GitHub secrets immediately

## After Adding All Secrets

Push any change to main branch and watch the Actions tab.
The deploy-aws job will automatically:
1. Build and push Docker image to ECR
2. Update ECS service with new image
3. Build React app and sync to S3
4. Invalidate CloudFront cache
