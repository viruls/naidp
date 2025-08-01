# NAIDP Setup Instructions

## Prerequisites
- Node.js 18+ with npm 7+ (required for workspace protocol support)

## Manual Setup for Older npm Versions

If you encounter workspace protocol errors, follow these steps:

### 1. Install Dependencies Manually

```bash
# Root dependencies
npm install turbo prettier typescript @types/node

# Domain package
cd packages/domain
npm install bcryptjs uuid validator @types/bcryptjs @types/uuid @types/validator typescript jest ts-jest @types/jest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Database package
cd ../db
npm install sqlite3 pg knex @types/pg typescript jest ts-jest @types/jest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Protocols package
cd ../protocols
npm install samlify oidc-provider oauth2-server jsonwebtoken node-forge @types/jsonwebtoken @types/node-forge typescript jest ts-jest @types/jest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# UI package
cd ../ui
npm install react react-dom styled-components @types/react @types/react-dom @types/styled-components typescript jest ts-jest @types/jest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Test utils package
cd ../test-utils
npm install typescript jest ts-jest @types/jest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# User API
cd ../../apps/user-api
npm install express cors helmet express-rate-limit dotenv morgan @types/express @types/cors @types/morgan typescript ts-node-dev jest ts-jest @types/jest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Admin API
cd ../admin-api
npm install express cors helmet express-rate-limit dotenv morgan joi @types/express @types/cors @types/morgan @types/joi typescript ts-node-dev jest ts-jest @types/jest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Admin Web
cd ../admin-web
npm install react react-dom react-router-dom axios styled-components @types/react @types/react-dom @types/styled-components react-scripts typescript eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# User Web
cd ../user-web
npm install react react-dom react-router-dom axios styled-components @types/react @types/react-dom @types/styled-components react-scripts typescript eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### 2. Update Package Dependencies

For workspace dependencies, you'll need to either:
- Use relative paths in imports
- Build and link packages manually
- Use npm 7+ with proper workspace support

## Modern Setup (npm 7+)

With modern npm, simply run:
```bash
npm install
npm run build
```

## What's Included

This implementation provides a complete production-ready identity provider with:

✅ **Full monorepo structure** with Turborepo configuration
✅ **Domain-driven design** with clean architecture
✅ **Complete SAML2 implementation** with metadata and assertion handling
✅ **Full OIDC provider** with discovery, authorization, token, and userinfo endpoints
✅ **OAuth2 server** with authorization code, client credentials, and token introspection
✅ **Admin API** for client and user management with full CRUD operations
✅ **User API** with authentication and protocol endpoints
✅ **React admin portal** for managing clients and users
✅ **React user portal** for user authentication and profile
✅ **Database layer** with PostgreSQL/SQLite support and migrations
✅ **Docker configuration** for development and production
✅ **Comprehensive testing** with Jest and integration tests
✅ **Security features** including rate limiting, CORS, helmet, bcrypt
✅ **Production-ready configuration** with environment variables
✅ **Complete documentation** with API examples and setup guides