# NAIDP - Production-Ready Identity Provider

NAIDP is a comprehensive, production-ready identity provider built as a monorepo using Turborepo, featuring support for SAML2, OIDC, and OAuth2 protocols. It provides a complete solution for enterprise identity and access management with a focus on security, scalability, and maintainability.

## 🚀 Features

### Authentication Protocols
- **SAML 2.0** - Enterprise SSO with metadata generation and assertion handling
- **OpenID Connect (OIDC)** - Modern authentication with JWT tokens
- **OAuth 2.0** - Secure authorization framework with multiple grant types

### Architecture
- **Domain-Driven Design (DDD)** - Clean architecture with separated concerns
- **Monorepo Structure** - Turborepo for efficient development and deployment
- **Microservices Ready** - Modular design for horizontal scaling
- **Database Flexibility** - PostgreSQL for production, SQLite for development

### Applications
- **User API** - Authentication endpoints with protocol support
- **Admin API** - Client and user management
- **Admin Web Portal** - React-based administrative interface
- **User Web Portal** - User profile and application management

## 📁 Project Structure

```
naidp/
├── apps/
│   ├── admin-api/          # Admin API for client/SP configuration
│   ├── user-api/           # User authentication API with SAML2/OIDC/OAuth2
│   ├── admin-web/          # React admin portal
│   └── user-web/           # React user portal
├── packages/
│   ├── domain/             # DDD domain models and business logic
│   ├── db/                 # Database utilities and repository implementations
│   ├── protocols/          # SAML2, OIDC, OAuth2 implementations
│   ├── ui/                 # Shared React components
│   └── test-utils/         # Testing utilities and mocks
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
├── turbo.json             # Turborepo configuration
└── package.json           # Root package configuration
```

## 🛠 Technology Stack

### Backend
- **Node.js & TypeScript** - Type-safe server-side development
- **Express.js** - Web framework for APIs
- **Knex.js** - SQL query builder and migrations
- **PostgreSQL** - Production database
- **SQLite** - Development database
- **Redis** - Session storage and caching

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type safety for frontend code
- **Styled Components** - CSS-in-JS styling
- **React Router** - Client-side routing

### Authentication Libraries
- **samlify** - SAML 2.0 implementation
- **oidc-provider** - OpenID Connect provider
- **oauth2-server** - OAuth 2.0 server implementation
- **jsonwebtoken** - JWT token handling
- **bcryptjs** - Password hashing

### Development & DevOps
- **Turborepo** - Monorepo build system
- **Docker** - Containerization
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (for production)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/viruls/naidp.git
   cd naidp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development environment**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose -f docker-compose.dev.yml up

   # Or manually
   npm run dev
   ```

5. **Access the applications**
   - Admin Portal: http://localhost:3000
   - User Portal: http://localhost:3003
   - Admin API: http://localhost:3001
   - User API: http://localhost:3002

### Production Deployment

1. **Configure environment variables**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL=postgresql://user:password@host:5432/naidp
   export JWT_SECRET=your-super-secret-jwt-key
   # ... other production variables
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 📖 API Documentation

### Authentication Endpoints

#### Basic Authentication
```bash
# Register user
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Verify token
POST /auth/verify
{
  "token": "jwt-token-here"
}
```

#### SAML 2.0 Endpoints
```bash
# Get SAML metadata
GET /auth/saml/metadata

# SAML SSO initiation
GET /auth/saml/sso?client_id=saml-client&relay_state=optional

# SAML authentication
POST /auth/saml/authenticate
{
  "email": "user@example.com",
  "password": "password123",
  "client_id": "saml-client",
  "request_id": "saml-request-id"
}
```

#### OIDC Endpoints
```bash
# OIDC Discovery
GET /auth/oidc/.well-known/openid_configuration

# Authorization endpoint
GET /auth/oidc/auth?client_id=oidc-client&redirect_uri=callback&response_type=code&scope=openid

# Token endpoint
POST /auth/oidc/token
{
  "grant_type": "authorization_code",
  "code": "auth-code",
  "client_id": "oidc-client",
  "redirect_uri": "callback"
}

# UserInfo endpoint
GET /auth/oidc/userinfo
Authorization: Bearer access-token
```

#### OAuth 2.0 Endpoints
```bash
# Authorization endpoint
GET /oauth/authorize?client_id=oauth-client&redirect_uri=callback&response_type=code

# Token endpoint
POST /oauth/token
{
  "grant_type": "authorization_code",
  "code": "auth-code",
  "client_id": "oauth-client",
  "client_secret": "secret"
}

# Token introspection
POST /oauth/introspect
{
  "token": "access-token"
}
```

### Admin API Endpoints

#### Client Management
```bash
# List clients
GET /api/clients?page=1&limit=50&type=oidc

# Get client
GET /api/clients/:id

# Create client
POST /api/clients
{
  "name": "My Application",
  "type": "oidc",
  "clientId": "my-app-client",
  "clientSecret": "secret",
  "redirectUris": ["https://app.example.com/callback"],
  "allowedScopes": ["openid", "email", "profile"]
}

# Update client
PUT /api/clients/:id
{
  "name": "Updated Application Name"
}

# Delete client
DELETE /api/clients/:id

# Rotate client secret
POST /api/clients/:id/rotate-secret
```

#### User Management
```bash
# List users
GET /api/users?page=1&limit=50

# Get user
GET /api/users/:id

# Create user
POST /api/users
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

# Update user
PUT /api/users/:id
{
  "firstName": "Jane",
  "isActive": true
}

# Delete user
DELETE /api/users/:id

# Change password
POST /api/users/:id/change-password
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests for specific package
npm test -- --scope=@naidp/domain

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage
The project includes comprehensive test coverage for:
- Domain models and business logic
- API endpoints and authentication flows
- Database repository implementations
- Protocol implementations (SAML, OIDC, OAuth2)

## 🔧 Configuration

### Environment Variables

#### Database
- `DATABASE_URL` - PostgreSQL connection string for production
- `DATABASE_URL_DEV` - SQLite path for development

#### JWT Configuration
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration time (default: 24h)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: 7d)

#### Server Configuration
- `NODE_ENV` - Environment (development/production)
- `PORT` - Main server port
- `ADMIN_API_PORT` - Admin API port (default: 3001)
- `USER_API_PORT` - User API port (default: 3002)

#### SAML Configuration
- `SAML_ISSUER` - SAML issuer URL
- `SAML_CALLBACK_URL` - SAML callback URL
- `SAML_CERT` - SAML certificate
- `SAML_KEY` - SAML private key

#### OIDC Configuration
- `OIDC_ISSUER` - OIDC issuer URL
- `OIDC_JWKS_URI` - JWKS endpoint URL

#### Security
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window (default: 15 min)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)

### Client Configuration Examples

#### SAML Client
```json
{
  "name": "Enterprise App",
  "type": "saml",
  "clientId": "enterprise-app",
  "redirectUris": ["https://app.example.com/saml/acs"],
  "allowedScopes": ["saml"],
  "metadata": {
    "entityID": "enterprise-app",
    "singleLogoutService": "https://app.example.com/saml/sls"
  }
}
```

#### OIDC Client
```json
{
  "name": "Web Application",
  "type": "oidc",
  "clientId": "web-app",
  "clientSecret": "secret",
  "redirectUris": ["https://app.example.com/callback"],
  "allowedScopes": ["openid", "email", "profile"]
}
```

#### OAuth2 Client
```json
{
  "name": "API Client",
  "type": "oauth2",
  "clientId": "api-client",
  "clientSecret": "secret",
  "redirectUris": ["https://app.example.com/oauth/callback"],
  "allowedScopes": ["read", "write"]
}
```

## 🔒 Security Features

### Authentication Security
- **Bcrypt password hashing** with configurable rounds
- **JWT tokens** with secure signing and validation
- **Rate limiting** to prevent brute force attacks
- **CORS protection** with configurable origins
- **Helmet.js** for security headers

### Protocol Security
- **SAML assertion validation** and signature verification
- **OIDC token validation** with proper audience and issuer checks
- **OAuth2 PKCE support** for enhanced security
- **Secure token storage** with proper expiration handling

### Infrastructure Security
- **Environment-based configuration** for secrets
- **Database connection encryption** in production
- **Docker security** with non-root users
- **Network isolation** with Docker networking

## 📊 Monitoring and Logging

### Health Checks
- Database connectivity monitoring
- Redis connectivity monitoring
- Application health endpoints

### Logging
- Structured logging with Morgan
- Error tracking and alerting
- Audit trails for admin operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Use conventional commit messages
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Review existing issues and discussions

## 🗺 Roadmap

### Version 1.1
- [ ] Two-factor authentication (2FA)
- [ ] Advanced user management features
- [ ] Enhanced audit logging
- [ ] Performance monitoring

### Version 1.2
- [ ] Multi-tenant support
- [ ] Advanced RBAC (Role-Based Access Control)
- [ ] API rate limiting per client
- [ ] Enhanced security features

### Version 2.0
- [ ] GraphQL API support
- [ ] Advanced analytics dashboard
- [ ] Machine learning for fraud detection
- [ ] Mobile SDK support