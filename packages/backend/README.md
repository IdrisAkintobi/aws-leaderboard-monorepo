# Backend - AWS Leaderboard API

Serverless backend for the AWS Leaderboard application, providing user authentication, score management, and real-time notifications.

## Features

-   **User Authentication**: Complete user management with AWS Cognito
    -   User registration and email verification
    -   Secure login/logout functionality
    -   JWT token validation
-   **Score Management**: RESTful API for leaderboard operations
    -   Submit user scores
    -   Retrieve leaderboard rankings
    -   Score validation and processing
-   **Real-time Notifications**: WebSocket integration for live updates
    -   Real-time high-score notifications
    -   Live leaderboard updates
    -   Connection management
-   **Local Development**: Full offline development environment

## Technology Stack

-   **Runtime**: Node.js 20.x with TypeScript
-   **Framework**: AWS SAM (Serverless Application Model)
-   **Authentication**: AWS Cognito User Pools
-   **Database**: Amazon DynamoDB
-   **API**: AWS API Gateway (REST + WebSocket APIs)
-   **Compute**: AWS Lambda Functions
-   **Local Development**: LocalStack with Docker

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │────│  Lambda Functions │────│    DynamoDB     │
│  (REST + WS)    │    │                  │    │   (Users &      │
└─────────────────┘    │  - Auth Handler  │    │    Scores)      │
                       │  - Score Handler │    └─────────────────┘
┌─────────────────┐    │  - WS Handler    │    ┌─────────────────┐
│  AWS Cognito    │────│                  │────│  CloudFormation │
│  (User Pools)   │    └──────────────────┘    │   (Infrastructure)
└─────────────────┘                            └─────────────────┘
```

## Prerequisites

-   Docker (for LocalStack Pro)
-   AWS CLI configured
-   AWS SAM CLI
-   **samlocal CLI** (LocalStack wrapper for SAM CLI)
-   Node.js 20.x+
-   npm 7+
-   **LocalStack Pro License** (required for AWS Cognito support)

## Getting Started

1. **Install samlocal CLI**

    ```bash
    npm install -g @localstack/samlocal
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **LocalStack Pro Setup**

    - Get your LocalStack Pro license from [LocalStack](https://localstack.cloud/)
    - Set your LocalStack Auth Token:
        ```bash
        export LOCALSTACK_AUTH_TOKEN=your-auth-token-here
        ```

4. **Environment Setup**

    ```bash
    cp .env.example .env
    # Update .env with your configuration
    ```

5. **Start LocalStack Pro** (for local development)

    ```bash
    # From the project root
    docker-compose up -d
    ```

6. **Build and Deploy Locally**
    ```bash
    npm run build
    npm run deploy:local
    ```

## Available Scripts

-   `npm run build` - Compile TypeScript to JavaScript
-   `npm run deploy:local` - Deploy to LocalStack environment
-   `npm run deploy:prod` - Deploy to AWS production
-   `npm run teardown:local` - Remove LocalStack deployment
-   `npm run teardown:prod` - Remove AWS deployment
-   `npm run lint` - Run ESLint
-   `npm run lint:fix` - Fix ESLint issues automatically
-   `npm run format` - Format code with Prettier
-   `npm run format:check` - Check code formatting
-   `npm run check` - Run both linting and format checks

## API Endpoints

### Authentication

-   `POST /auth/register` - Register new user
-   `POST /auth/login` - User login
-   `POST /auth/verify` - Verify email address
-   `POST /auth/refresh` - Refresh JWT token

### Leaderboard

-   `GET /leaderboard` - Get current leaderboard
-   `POST /scores` - Submit new score
-   `GET /scores/{userId}` - Get user's scores

### WebSocket

-   `wss://api-url/ws` - WebSocket connection for real-time updates

## Local Development

The backend uses LocalStack Pro to simulate AWS services locally. **LocalStack Pro is required** because the free version doesn't support AWS Cognito.

1. **Start LocalStack Pro**

    ```bash
    # From project root
    docker-compose up -d
    ```

2. **Deploy to LocalStack**

    ```bash
    npm run deploy:local
    ```

3. **Test API**
    ```bash
    curl http://localhost:4566/restapis/{api-id}/local/_user_request_/leaderboard
    ```

## User Verification (LocalStack)

Since LocalStack doesn't send actual emails, you must manually verify users after registration:

1. **Register a user** through your frontend or API
2. **Get the Cognito User Pool ID** from the deployment output
3. **Manually verify the user**:

    ```bash
    awslocal cognito-idp admin-confirm-sign-up \
      --user-pool-id the-user-pool-id-here \
      --username user@email.here \
      --region us-east-1
    ```

4. **The user can now login** with their credentials

## Environment Variables

Create a `.env` file with:

```env
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
DYNAMODB_TABLE_NAME=leaderboard-table
WEBSOCKET_API_ENDPOINT=your-websocket-endpoint
```

## Deployment

### Local (LocalStack)

```bash
npm run deploy:local
```

### Production (AWS)

```bash
npm run deploy:prod
```

## Testing

```bash
npm test                    # Run all tests
npm run test:unit          # Run unit tests
npm run test:integration   # Run integration tests
```
