# Frontend LocalStack Deployment Guide

This guide explains how to deploy the Vue.js frontend to LocalStack for local development and testing.

## Prerequisites

1. **LocalStack**: Ensure LocalStack is running via Docker Compose
2. **awslocal CLI**: Install the LocalStack AWS CLI wrapper
3. **Node.js**: Version 18+ for building the Vue.js application

## Installation

Install the LocalStack AWS CLI wrapper:
```bash
pip install awscli-local
```

## Deployment Commands

### Deploy to LocalStack
```bash
# Full deployment (infrastructure + build + upload)
npm run deploy

# Upload only (after initial deployment)
npm run upload

# Delete stack
npm run delete-stack
```

## Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run deploy` | Full LocalStack deployment (build + infrastructure + upload) |
| `npm run build` | Build Vue.js application only |
| `npm run upload` | Upload built files to existing S3 bucket |
| `npm run delete-stack` | Delete LocalStack CloudFormation stack |

## LocalStack Configuration

### CloudFormation Template
- **File**: `template-local.yaml`
- **Stack Name**: `vue-app-stack`
- **S3 Bucket**: Auto-generated with LocalStack-compatible configuration
- **Website URL**: `http://{bucket}.s3-website.localhost.localstack.cloud:4566`

### Build Configuration
- **Environment File**: `.env`
- **Output**: `dist/` directory
- **Source Maps**: Enabled for debugging

## Troubleshooting

### LocalStack Not Running
Ensure LocalStack is running:
```bash
docker-compose up -d localstack
```

### awslocal Command Not Found
Install the LocalStack CLI wrapper:
```bash
pip install awscli-local
```

### Build Errors
Check Node.js version and dependencies:
```bash
node --version  # Should be 18+
npm install
```

### Stack Creation Fails
Verify LocalStack is healthy:
```bash
awslocal health
```

## URLs and Endpoints

After successful deployment:
- **Website URL**: Retrieved from CloudFormation outputs
- **S3 Bucket**: `vue-app-vue-app-stack`
- **LocalStack Console**: http://localhost:4566/_localstack/health

## Integration with Backend

The frontend is configured to work with the LocalStack backend deployment:
- **API Endpoints**: Uses LocalStack API Gateway URLs
- **WebSocket**: Connects to LocalStack WebSocket API
- **Authentication**: Uses LocalStack Cognito service

## Development Workflow

1. Start LocalStack:
   ```bash
   docker-compose up -d localstack
   ```

2. Deploy backend to LocalStack (from backend directory):
   ```bash
   samlocal deploy --template-file template-local.yaml
   ```

3. Deploy frontend to LocalStack:
   ```bash
   npm run deploy
   ```

4. Access the application via the provided LocalStack URL

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://localhost.localstack.cloud:4566/` | API Gateway base URL |
| `VITE_WEBSOCKET_URL` | `wss://localhost.localstack.cloud:4510/` | WebSocket API URL |
| `VITE_S3_ENDPOINT` | `http://localhost.localstack.cloud:4566/` | S3 service endpoint |
| `VITE_ENVIRONMENT` | `localstack` | Environment identifier |
| `VITE_ENABLE_DEBUG` | `true` | Enable debug mode |
