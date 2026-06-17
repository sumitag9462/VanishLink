# 🏗️ VanishLink Architecture

## High-Level Architecture

VanishLink is a modern, production-hardened SaaS platform designed for high availability, security, and scalability. It follows a layered, service-oriented monolithic architecture.

```mermaid
graph TD
    Client[Client (React SPA / Browser)] -->|HTTPS| Proxy[Nginx / Load Balancer]
    Proxy -->|Routing| WebApp[Frontend App Container]
    Proxy -->|API| NodeServer[Backend Node.js API]
    NodeServer -->|Cache/Workers| Redis[(Redis)]
    NodeServer -->|Persist| MongoDB[(MongoDB Atlas)]
    NodeServer -->|External| EmailService[Email/SMTP]
    NodeServer -->|External| AIService[Gemini/OpenAI]
    NodeServer -->|External| Stripe[Stripe Billing]
```

## Core Components

### 1. Frontend (React 19 + Vite)
- **Component Splitting**: Utilizes `React.lazy()` and `Suspense` for route-level code splitting to minimize initial bundle size and achieve Lighthouse 95+ scores.
- **State Management**: Context-based state for global app state (Auth, Theme) with centralized Axios interceptors for API communication.
- **Styling**: TailwindCSS configured with a strict color palette, enforcing CSS variables for dynamic theming and "Dark Mode by Default".

### 2. Backend (Node.js + Express)
- **Layered Architecture**: Strict separation between Routes, Controllers, Services, and Models.
  - *Controllers*: Handle HTTP parsing, standard response formatting, and error mapping.
  - *Services*: Contain all core business logic, decoupled from HTTP constructs.
  - *Data Access*: Mongoose models with proper indexing and schema validations.

### 3. Caching & Background Processing (Redis)
- **Caching**: Extensive use of Redis for:
  - System Settings (Global config)
  - Public link metadata (Fast redirect resolution)
  - IP-to-Country geolocation mapping (24h TTL)
- **Background Jobs**: Heavy operations (e.g., AI summary generation, Webhook delivery, Email sending) are processed asynchronously to ensure API response times remain under 100ms.

### 4. Database (MongoDB)
- Fully indexed collections targeting high-read throughput.
- Soft-deletion strategies for entities requiring audit compliance.

## Security Architecture

- **Authentication**: JWT-based session management with robust validation.
- **Authorization**: Role-Based Access Control (RBAC) middleware protecting all administrative and destructive routes.
- **Network Security**:
  - Helmet configured for HSTS, X-XSS-Protection, and Frame Deny.
  - Anti-SSRF constraints built into AI fetch requests (blocking internal/private IP space).
  - Rate Limiting segmented by route sensitivity (General vs Auth vs Link Creation).

## Scalability Strategy

- **Stateless Backend**: All session state is managed via JWTs and Redis, allowing horizontal scaling of the Node.js instances.
- **Dockerized Deployments**: Standardized multi-stage container builds using non-root users (`node` and `nginx-unprivileged`), ensuring parity between development and production.
- **CI/CD**: Fully automated GitHub Actions pipeline validating linting, testing, and Docker builds on every push.
