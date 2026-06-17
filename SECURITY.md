# 🛡️ Security Posture & Standards

VanishLink has been hardened to meet Enterprise SaaS security standards, mitigating all OWASP Top 10 vulnerabilities.

## Threat Mitigations

### 1. Cross-Site Scripting (XSS)
- Strict Content Security Policy (CSP) headers applied via Helmet.
- React's built-in DOM escaping combined with strict ESLint rules (`react/no-danger`).

### 2. Server-Side Request Forgery (SSRF)
The AI Summary generation relies on fetching external URLs. To mitigate SSRF:
- Input validation: All URLs must pass strict Regex parsing (`urlSafety.js`).
- Pre-flight DNS Resolution: `dns.lookup` resolves the hostname before fetching.
- IP Blacklisting: Any IP falling into private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`) is actively blocked.

### 3. NoSQL Injection
- Comprehensive use of `mongoose` schemas with strongly typed fields.
- Request payloads mapped explicitly rather than spreading `req.body` directly into queries.
- Implementation of `express-mongo-sanitize` on all incoming JSON payloads.

### 4. Authentication & Authorization
- **JWT Best Practices**: Tokens are signed with strong secrets and rotated.
- **RBAC**: Middleware strictly enforces ownership before mutations (`isOwner` / `isAdmin`).
- **OAuth Validation**: Google OAuth mandates verified emails to prevent identity spoofing.

### 5. Rate Limiting & Abuse Prevention
- Global API rate limiting (100 req/15 min).
- Strict Auth rate limiting (5 req/15 min).
- Geo-fencing capabilities to proactively block traffic from hostile regions.

## Docker Security
- Base images utilize lightweight `alpine`.
- Node application executes under the unprivileged `node` user.
- Frontend uses `nginxinc/nginx-unprivileged` for non-root serving.

## Audit Logging
Every significant administrative action (Settings modification, User ban, Link deletion, IP blocking) is immutably written to an `AuditLog` collection, ensuring full compliance and traceability.
