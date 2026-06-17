# 💀 Deadman-Link (Enterprise SaaS)

> A full-stack, enterprise-grade URL shortener and "Link-in-Bio" SaaS platform. Engineered with real-time analytics, distributed Redis rate limiting, multi-tenant RBAC workspaces, automated malware scanning, and Stripe billing integration.

[![JavaScript](https://img.shields.io/badge/JavaScript-99.8%25-F7DF1E?logo=javascript&logoColor=black)](https://github.com/sumitag9462)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![Stripe](https://img.shields.io/badge/Stripe-Billing-008CDD?logo=stripe&logoColor=white)](https://stripe.com)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Enterprise Features](#enterprise-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started (Docker Setup)](#getting-started-docker-setup)
- [Developer API Reference](#developer-api-reference)
- [Contributing](#contributing)

---

## 🌟 Overview

**Deadman-Link** started as a basic URL shortener but has evolved into a massive, scalable **Software-as-a-Service (SaaS)** platform. It is built to demonstrate FAANG-level system design, capable of handling high-throughput redirect traffic, robust security threat modeling, and seamless third-party billing integrations.

The "Deadman" moniker reflects the core security philosophy: links can be set to self-destruct after a single click, block traffic from specific countries, or require a secure OTP for access.

---

## 🚀 Enterprise Features

The architecture is divided into 6 fully integrated domains:

### 1. Advanced Routing & Analytics
*   **Real-time Socket.io Analytics**: Live dashboard updating instantly as users click links anywhere in the world.
*   **Geo-Fencing**: Block or explicitly allow traffic from specific countries based on IP geolocation.
*   **A/B Testing (Link Rotator)**: Distribute traffic across multiple destination URLs using Weighted, Round-Robin, or Random distribution algorithms.
*   **Mobile Deep Linking**: Automatically parse `User-Agent` headers to route iOS users to the App Store and Android users to Google Play.

### 2. Trust & Security
*   **Automated Malware Scanning**: Links are scanned against Google Web Risk / Phishing databases upon creation to prevent abuse.
*   **Bot Detection**: Intelligent filtering to ignore web crawlers and scrapers, ensuring your click analytics remain 100% human-accurate.
*   **Email OTP Verification**: Links can be password-protected or locked behind a secure, one-time password emailed to authorized viewers.
*   **Graceful Expiry Fallbacks**: If a link expires or maxes out its click limit, users are safely routed to a predefined fallback URL rather than an ugly 404 page.

### 3. Scale & Multi-Tenancy
*   **Distributed Redis Rate Limiting**: An in-memory caching layer protects the Node.js API and MongoDB database from DDoS and brute-force attacks.
*   **Multi-Tenant Workspaces**: Users can create organizations, invite team members, and assign strict Role-Based Access Controls (RBAC) (Admin, Editor, Viewer).
*   **GDPR Compliance Mode**: A toggle to completely anonymize IP and location data tracking for European traffic.
*   **CSV Data Export**: Memory-efficient streaming of MongoDB analytics arrays into downloadable CSV blobs.

### 4. Developer Experience (DevEx)
*   **Developer API Keys**: A self-serve portal where developers can generate scoped `Bearer` tokens to create links programmatically via REST API.
*   **Custom Branded Domains**: Dynamic CNAME routing allows workspaces to serve links under their own domains (e.g., `link.yourbrand.com`) by parsing the incoming HTTP `Host` header.

### 5. Monetization & Products
*   **Stripe Subscription Billing**: An asynchronous Webhook handler that listens for successful Stripe checkout sessions to upgrade user limits.
*   **Usage-Based Entitlements**: Strict backend enforcements restricting Free users to 50 links, while Pro/Enterprise tiers scale to 10,000+.
*   **"Link-in-Bio" Pages**: A Linktree alternative. Users can claim a public profile (`/bio/:username`), customize themes, and aggregate multiple links onto a stunning mobile-friendly landing page.

---

## 🛠 Tech Stack

### Frontend (Client-Side)
*   **React 19 & Vite**: Blazing fast compilation and state management.
*   **TailwindCSS v4**: For beautiful, responsive, utility-first dark-mode designs.
*   **Recharts**: Interactive data visualization for the Analytics dashboard.
*   **Socket.io-Client**: Persistent WebSocket connections for live traffic monitoring.

### Backend (Server-Side)
*   **Node.js & Express**: High-throughput asynchronous event-driven backend.
*   **Mongoose**: Strict ODM schemas for MongoDB.
*   **Passport.js & JWT**: Stateless session management and Google OAuth2.0.
*   **Bcryptjs & Crypto**: For salting passwords and securely generating API Keys.

### Infrastructure & DevOps
*   **MongoDB (v6)**: Flexible document storage for complex link rules.
*   **Redis (v7)**: Ultra-fast caching and rate limit tracking.
*   **Docker & Docker Compose**: Complete containerization of the entire stack.
*   **GitHub Actions**: Continuous Integration pipeline for automated testing and builds.

---

## 🏗 System Architecture

When a user clicks a short link (e.g., `deadman.link/r/promo`), the request passes through this pipeline:
1.  **Nginx / API Gateway**: Forwards the request to the Node.js backend.
2.  **Redis Rate Limiter**: Checks the IP against a sliding window. If > 100 requests/min, the request is dropped immediately with a `429 Too Many Requests`.
3.  **Host Header Parsing**: Determines if the link belongs to the base domain or a Custom CNAME domain.
4.  **Mongoose Query**: Fetches the link document and evaluates dynamic rules:
    *   *Is it expired?* -> Redirect to Fallback URL.
    *   *Is the Country blocked?* -> Drop request.
    *   *Is the User-Agent mobile?* -> Route to iOS/Android URL.
5.  **Analytics Dispatch**: Asynchronously fires an event to MongoDB and broadcasts a `click_registered` WebSocket event to the link owner's dashboard.
6.  **HTTP 302 Redirect**: The user is sent to the final destination.

---

## 💻 Getting Started (Docker Setup)

The easiest way to run the entire enterprise stack (Node, React, MongoDB, and Redis) locally is using Docker.

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.
*   Git

### 1. Clone & Configure
```bash
git clone https://github.com/sumitag9462/Deadman-Link.git
cd Deadman-Link

# Set up environment variables (ensure STRIPE_SECRET_KEY is populated if testing billing)
cp .env.example .env
```

### 2. Boot the Cluster
```bash
# Build and start all 4 containers in detached mode
docker-compose up --build -d
```

### 3. Access the Application
*   **Frontend UI**: `http://localhost:8080`
*   **Backend API**: `http://localhost:5050`
*   **Mongo DB**: `localhost:27017`
*   **Redis**: `localhost:6379`

To stop the cluster:
```bash
docker-compose down
```

---

## 🔌 Developer API Reference

Developers can generate an API key in the Dashboard under `Developer Portal`.

**Create a Short Link via API**
```bash
curl -X POST http://localhost:5050/api/links \
  -H "Authorization: Bearer dl_YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://very-long-url.com/campaign",
    "title": "Summer Promo",
    "isOneTime": false,
    "maxClicks": 1000
  }'
```

---

## 🤝 Contributing

Contributions are heavily encouraged! Since this is a large monorepo:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Ensure your code passes CI (`npm run lint`).
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
5. Push to the branch (`git push origin feature/AmazingFeature`).
6. Open a Pull Request.

---

<p align="center">Built with ❤️ for top-tier product engineering by <a href="https://github.com/sumitag9462">sumitag9462</a></p>
# VanishLink
