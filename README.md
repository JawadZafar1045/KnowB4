# CyberAware — Multi-Tenant Security Awareness & Training SaaS

CyberAware is a modern, full-stack B2B SaaS platform for employee cybersecurity education, automated training campaigns, interactive quiz assessments, and verifiable digital certificates.

---

## 🌟 Key Features

- **Multi-Tenant Architecture**: Strict organizational data isolation by `companyId`.
- **Role-Based Access Control (RBAC)**:
  - **Super Admin**: Platform-wide telemetry, tenant provisioning, global course and quiz catalog management.
  - **Company Admin**: Organizational dashboard, department segmentation, bulk CSV employee onboarding, campaign management, certificate revocation, compliance reports, and audit trails.
  - **Learner / Employee**: Personalized dashboard, modular lesson viewer, timed interactive quiz engine with immediate scoring and review, and automated certificate generation.
- **Public Certificate Verification**: Instant, public, zero-login certificate verification portal with anti-tamper authenticity badges.
- **Zero-Setup Database**: Embedded MongoDB In-Memory Server for immediate out-of-the-box local development without separate database installations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Git

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
