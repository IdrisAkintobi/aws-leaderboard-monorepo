# AWS Leaderboard Application

A serverless leaderboard application with user authentication and real-time notifications, built with AWS SAM (Serverless Application Model) using a monorepo structure.

## Features

- **User Authentication**: Registration, login, and verification using AWS Cognito
- **Score Submission**: Submit and track user scores
- **Real-time Leaderboard**: Live leaderboard updates via WebSockets
- **High-score Notifications**: Real-time notifications for new high scores
- **Local Development**: Full local development environment with LocalStack

## Technology Stack

### Backend

- **Runtime**: Node.js 20.x with TypeScript
- **Framework**: AWS SAM (Serverless Application Model)
- **Authentication**: AWS Cognito
- **Database**: Amazon DynamoDB
- **API**: AWS API Gateway (REST + WebSocket)
- **Compute**: AWS Lambda
- **Local Development**: LocalStack, Docker

### Frontend

- **Framework**: Vue.js 3
- **Build Tool**: Vite
- **Language**: TypeScript
- **Deployment**: AWS S3 (Static Website)

### Development Tools

- **Package Manager**: npm workspaces
- **Code Quality**: ESLint, Prettier
- **Infrastructure**: AWS CloudFormation (via SAM)

## Project Structure

```
aws-leaderboard-monorepo/
├── packages/
│   ├── backend/         # Serverless backend (Lambda functions, API Gateway)
│   └── frontend/        # Vue.js frontend application
├── .gitignore          # Root .gitignore
├── package.json        # Root package.json with npm workspaces
└── README.md           # This file
```

## Prerequisites

- Node.js 20.x or later
- npm 7+ (for workspaces support)
- Docker (for LocalStack Pro)
- AWS SAM CLI
- **samlocal CLI** (LocalStack wrapper for SAM CLI)
- AWS CLI configured with appropriate credentials
- **LocalStack Pro License** (required for AWS Cognito support)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd aws-leaderboard-monorepo
   ```

2. **Install samlocal CLI**

   ```bash
   npm install -g @localstack/samlocal
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **LocalStack Pro Setup**

   - Get your LocalStack Pro license from [LocalStack](https://localstack.cloud/)
   - Set your LocalStack Auth Token:
     ```bash
     export LOCALSTACK_AUTH_TOKEN=your-auth-token-here
     ```
   - Start LocalStack Pro:
     ```bash
     docker-compose up -d
     ```

5. **Environment Setup**
   - Copy `.env.example` to `.env` in both `packages/backend` and `packages/frontend`
   - Update the environment variables as needed

## Development

### Backend (Local Development)

⚠️ **Note**: The backend requires LocalStack Pro to be running for Cognito authentication to work.

```bash
# Make sure LocalStack Pro is running
docker-compose up -d

# Deploy backend to LocalStack
cd packages/backend
npm run deploy:local
```

### Frontend

```bash
npm run dev:frontend
```

## Deployment

### Backend

```bash
cd packages/backend
npm run deploy:local    # Deploy to LocalStack
npm run deploy:prod     # Deploy to AWS
```

### Frontend

```bash
cd packages/frontend
npm run build
make deploy            # Deploy to AWS S3
```

## Testing & User Verification

### Manual User Verification (LocalStack)

Since LocalStack doesn't send actual emails, you'll need to manually verify users after registration:

1. **Get the Cognito User Pool ID** from the deployment output
2. **Verify a user manually**:
   ```bash
   awslocal cognito-idp admin-confirm-sign-up \
     --user-pool-id the-user-pool-id-here \
     --username user@email.here \
     --region us-east-1
   ```

## Available Scripts

- `npm run deploy:backend` - Deploy backend to LocalStack/AWS
- `npm run dev:frontend` - Start frontend development server
- `npm run build:all` - Build all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code using Prettier

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Commit and push your changes
4. Create a Pull Request

## License

MIT
