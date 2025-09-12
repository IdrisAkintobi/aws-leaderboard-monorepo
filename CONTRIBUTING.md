# Contributing to AWS Leaderboard Monorepo

Thank you for your interest in contributing to the AWS Leaderboard application! Here's how you can get started:

## Prerequisites

- Node.js 20.x or later
- npm 7+ (for workspaces support)
- Docker (for LocalStack Pro)
- AWS SAM CLI
- **samlocal CLI** (LocalStack wrapper for SAM CLI)
- AWS CLI configured with appropriate credentials
- **LocalStack Pro License** (required for AWS Cognito support)

## Getting Started

1. **Fork the Repository**
   Fork the repository to your GitHub account and clone it locally.

2. **Install samlocal CLI**

   ```bash
   npm install -g @localstack/samlocal
   ```

3. **Install Dependencies**

   ```bash
   # Install root dependencies and all workspace dependencies
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

## Development Workflow

### Available Scripts

From the root directory, you can run:

- `npm run dev:frontend` - Start the frontend development server
- `npm run deploy:backend` - Deploy backend to LocalStack/AWS
- `npm run build:all` - Build all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code using Prettier

### Working with Workspaces

- To run a script in a specific workspace:

  ```bash
  npm run <script> --workspace=<workspace-name>
  ```

  Example:

  ```bash
  npm run test --workspace=@aws-sam/backend
  ```

- To install a dependency in a specific workspace:
  ```bash
  npm install <package> --workspace=<workspace-name>
  ```

## Making Changes

1. Create a new branch for your feature or bugfix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them with a descriptive message:

   ```bash
   git commit -m "feat: add new feature"
   ```

3. Push your changes to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request against the main branch

## Code Style

- Follow the existing code style
- Run `npm run lint` before committing
- Run `npm run format` to format your code

## Testing & User Verification

### Running Tests

Make sure all tests pass before submitting a PR:

```bash
npm test --workspaces
```

### Manual User Verification (LocalStack)

When testing authentication features locally, you'll need to manually verify users since LocalStack doesn't send actual emails:

1. **Register a user** through the frontend or API
2. **Get the Cognito User Pool ID** from the deployment output
3. **Manually verify the user**:
   ```bash
   awslocal cognito-idp admin-confirm-sign-up \
     --user-pool-id the-user-pool-id-here \
     --username user@email.here \
     --region us-east-1
   ```
4. **The user can now login** with their credentials

## License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.
