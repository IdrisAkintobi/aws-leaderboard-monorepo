# Frontend - Leaderboard Web Application

Modern Vue.js 3 frontend for the AWS Leaderboard application, providing an interactive user interface for authentication, score submission, and real-time leaderboard viewing.

## Features

- **User Authentication Interface**

  - Registration and login forms
  - Email verification workflow
  - Secure session management
  - Password reset functionality

- **Leaderboard Dashboard**

  - Real-time leaderboard display
  - Score submission interface
  - User profile management
  - Responsive design for all devices

- **Real-time Updates**

  - WebSocket integration for live updates
  - Instant leaderboard refreshes
  - Real-time notifications for high scores
  - Connection status indicators

- **Modern UI/UX**
  - Clean, responsive design
  - Dark/light theme support
  - Smooth animations and transitions
  - Mobile-first approach

## Technology Stack

- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite (fast development and optimized builds)
- **Language**: TypeScript for type safety
- **Styling**: CSS3 with modern features
- **State Management**: Vue 3 reactive system
- **HTTP Client**: Fetch API with custom wrappers
- **WebSocket**: Native WebSocket API
- **Deployment**: AWS S3 Static Website Hosting

## Prerequisites

- Node.js 20.x or later
- npm 7+ (for workspaces support)
- AWS CLI (for deployment)

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   # Update .env with your API endpoints
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run gen:cert` - Generate SSL certificates for HTTPS development
- `npm run lint` - Run ESLint on the codebase
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run check` - Run both linting and format checks

## Environment Variables

Create a `.env` file in the frontend package root:

```env
VITE_API_BASE_URL=https://your-api-gateway-url
VITE_WEBSOCKET_URL=wss://your-websocket-url
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=your-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
```

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── auth/           # Authentication components
│   ├── leaderboard/    # Leaderboard components
│   └── common/         # Shared components
├── views/              # Page-level components
├── composables/        # Vue 3 composables
├── services/           # API and WebSocket services
├── types/              # TypeScript type definitions
├── assets/             # Static assets
└── main.ts             # Application entry point
```

## Key Components

### Authentication

- `LoginForm.vue` - User login interface
- `RegisterForm.vue` - User registration
- `EmailVerification.vue` - Email verification workflow

### Leaderboard

- `LeaderboardTable.vue` - Main leaderboard display
- `ScoreSubmission.vue` - Score submission form
- `UserProfile.vue` - User profile and statistics

### Real-time Features

- `WebSocketService.ts` - WebSocket connection management
- `NotificationSystem.vue` - Real-time notifications
- `LiveUpdates.vue` - Live leaderboard updates

## Development

### Local Development with HTTPS

For testing with secure features (like WebSockets), generate SSL certificates:

```bash
npm run gen:cert
```

Then start the dev server with HTTPS:

```bash
npm run dev -- --https
```

### API Integration

The frontend communicates with the backend through:

1. **REST API**: For authentication and data operations
2. **WebSocket**: For real-time updates and notifications

### State Management

Uses Vue 3's reactive system with composables for:

- User authentication state
- Leaderboard data
- WebSocket connection status
- Application settings

## Building for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory with:

- Minified JavaScript and CSS
- Tree-shaken dependencies
- Optimized assets
- Service worker for caching

## Deployment

### AWS S3 Static Website

The application is deployed as a static website on AWS S3:

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Deploy infrastructure and upload**

   ```bash
   make deploy
   ```

3. **Upload updates only** (if infrastructure exists)
   ```bash
   make upload-only
   ```

### Deployment Commands

- `make deploy` - Create/update infrastructure and deploy
- `make upload-only` - Upload application files only
- `make website-url` - Get the website URL
- `make delete-stack` - Remove AWS infrastructure

## Performance Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization
- **Caching**: Browser caching with proper headers
- **Lazy Loading**: Components loaded on demand

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

```bash
npm run test              # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run test:coverage    # Generate coverage report
```
