# Environment Variables Setup

This document describes all environment variables that can be configured for the Finance Hub frontend.

## Quick Start

1. Create a `.env` file in the `finance-hub-frontend` directory
2. Copy the variables below and set your values
3. All variables must be prefixed with `VITE_` to be accessible in the browser

## Required Environment Variables

### API Configuration

#### Option 1: Full URL (Recommended)
```bash
# Full API Base URL
VITE_API_BASE_URL=http://localhost:3001
```

#### Option 2: Separate Components
```bash
# API Host (e.g., localhost, api.example.com)
VITE_API_HOST=localhost

# API Port (default: 3001)
VITE_API_PORT=3001

# API Protocol (http or https)
VITE_API_PROTOCOL=http
```

**Note:** If `VITE_API_BASE_URL` is set, it will override the separate components.

### Optional Environment Variables

```bash
# API Request Timeout in milliseconds (default: 30000 = 30 seconds)
VITE_API_TIMEOUT=30000

# Application Name (default: Finance Hub)
VITE_APP_NAME=Finance Hub

# Application Version (default: 1.0.0)
VITE_APP_VERSION=1.0.0

# LocalStorage key for auth token (default: authToken)
VITE_AUTH_TOKEN_KEY=authToken

# Token refresh interval in milliseconds (default: 3600000 = 1 hour)
VITE_AUTH_REFRESH_INTERVAL=3600000

# Frontend dev server port (default: 3000)
VITE_DEV_PORT=3000
```

## Example .env File

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Or use separate components:
# VITE_API_HOST=localhost
# VITE_API_PORT=3001
# VITE_API_PROTOCOL=http

# Optional: API Timeout
VITE_API_TIMEOUT=30000

# Optional: App Configuration
VITE_APP_NAME=Finance Hub
VITE_APP_VERSION=1.0.0

# Optional: Auth Configuration
VITE_AUTH_TOKEN_KEY=authToken
VITE_AUTH_REFRESH_INTERVAL=3600000

# Optional: Dev Server Port
VITE_DEV_PORT=3000
```

## Environment-Specific Files

Vite supports environment-specific files:

- `.env` - Default for all environments
- `.env.local` - Local overrides (git-ignored)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.development.local` - Local development overrides (git-ignored)
- `.env.production.local` - Local production overrides (git-ignored)

## Default Values

If environment variables are not set, the following defaults are used:

| Variable | Default Value |
|----------|---------------|
| `VITE_API_BASE_URL` | `http://localhost:3001` |
| `VITE_API_HOST` | `localhost` |
| `VITE_API_PORT` | `3001` |
| `VITE_API_PROTOCOL` | `http` |
| `VITE_API_TIMEOUT` | `30000` (30 seconds) |
| `VITE_APP_NAME` | `Finance Hub` |
| `VITE_APP_VERSION` | `1.0.0` |
| `VITE_AUTH_TOKEN_KEY` | `authToken` |
| `VITE_AUTH_REFRESH_INTERVAL` | `3600000` (1 hour) |
| `VITE_DEV_PORT` | `3000` |

## Important Notes

1. **VITE_ Prefix**: All environment variables must be prefixed with `VITE_` to be accessible in the browser code.

2. **Security**: Never commit `.env.local` or `.env.production.local` files with sensitive data. These files are git-ignored.

3. **Build Time**: Environment variables are embedded at build time, not runtime. You need to rebuild the app if you change environment variables.

4. **API URL Priority**: 
   - If `VITE_API_BASE_URL` is set, it takes priority
   - Otherwise, URL is built from `VITE_API_HOST`, `VITE_API_PORT`, and `VITE_API_PROTOCOL`

## Usage in Code

Environment variables are accessed via `import.meta.env`:

```typescript
// Direct access
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Or use the config helper
import { config, getApiUrl } from './config/env';
const apiUrl = getApiUrl();
```

## Production Setup

For production, set:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_PROTOCOL=https
```

Make sure your backend API is accessible at the configured URL.

