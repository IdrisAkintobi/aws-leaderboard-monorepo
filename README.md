# AWS Mock Full-Stack App

A serverless application with user authentication and a leaderboard, built for AWS Lambda.

## Key Features

- User registration, login, and verification.
- Score submission and leaderboard.
- Real-time high-score notifications via WebSockets.
- Local development with LocalStack and Docker.

## Tech Stack

- **Backend**: Node.js, TypeScript
- **AWS**: Lambda, API Gateway, Cognito, DynamoDB
- **Local**: LocalStack, Docker, AWS SAM CLI

## Prerequisites

- Docker
- AWS CLI
- AWS SAM CLI
- Node.js (v20.x+)

## Getting Started

1.  **Clone & Install**: `git clone <url> && cd aws-mock-app && npm install`
2.  **Start LocalStack**: `docker-compose up`
3.  **Build**: `npm run build`
4.  **Deploy Locally**: `npm run deploy:local`

## Key Commands

- `npm run build`: Compile TypeScript.
- `npm run deploy:local`: Deploy to LocalStack.
- `npm run deploy:prod`: Deploy to AWS.
- `npm run teardown:local`: Remove from LocalStack.
- `npm run teardown:prod`: Remove from AWS.
