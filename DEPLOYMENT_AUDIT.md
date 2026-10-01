# KnowB4 Deployment Audit

## 1. Overview
This application is a multi-tenant cybersecurity awareness platform with:
- Node.js / Express backend
- MongoDB data layer
- React + Vite frontend
- SMTP email service
- Role-based access for Super Admin, Company Admin, and Employee users

## 2. Deployment Summary
Status: Ready for staging deployment with production hardening still required.

## 3. Production Requirements
Before deploying to a VPS or cloud host, the following environment variables must be set explicitly:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://<user>:<password>@<host>:27017/<db>?authSource=admin
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
APP_URL=https://your-frontend-domain.com
PLATFORM_SECRET_KEY=<strong-random-registration-key>
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=<strong-complex-password>
SMTP_HOST=your-smtp-host
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM_NAME=ThinkB4Act Platform
SMTP_FROM_EMAIL=info@yourdomain.com
```

Important:
- Never use default or demo credentials in production.
- Do not commit real secrets to Git.
- Keep the Super Admin email and password unique to the deployment environment.

## 4. Default Credential Cleanup
The following demo credential patterns were removed from the UI and seed flow so the application does not rely on fake logins for production use:
- Demo login buttons in the login page
- Demo role switcher across app layouts
- Seed-generated fake users with shared demo passwords
- Hard-coded demo account values in frontend login screens

The application now expects a single real platform Super Admin account configured via environment variables.

## 5. Seed Behavior
The backend database bootstrap logic will create exactly one Super Admin account based on:
- SUPER_ADMIN_EMAIL
- SUPER_ADMIN_PASSWORD

This prevents production deployments from silently creating demo accounts or exposing demo credentials.

## 6. Runtime Checks Verified
The following were validated during audit:
- Frontend build passes with Vite production build
- Backend loads environment variables successfully
- Backend starts successfully with MongoDB connection working in the current environment
- SMTP verification succeeded for the configured server

## 7. Deployment Risks to Review
1. Ensure MongoDB is reachable from the target VPS and credentials are valid.
2. Ensure `APP_URL` matches the actual frontend domain used for email links.
3. Ensure SMTP host and credentials match the real production email provider.
4. Confirm the Super Admin user account is created on first startup and the password is changed immediately after first login.
5. Restrict access to port 5000 and any admin endpoints using a reverse proxy or firewall.
6. Consider enabling HTTPS and proper TLS termination for the production frontend/backend.

## 8. Recommended Post-Deployment Checklist
- Log in with the configured Super Admin account
- Change the default password immediately
- Create the first company tenant
- Verify email invitation delivery works
- Verify certificate/public verification page works
- Verify the platform registration key flow works
- Test employee course enrollment flow
- Confirm audit logs and reporting pages render correctly

## 9. DevOps Notes
For VPS deployment, run the app behind a process manager such as PM2 or systemd. Configure the environment file outside the repository and do not store secrets in source control.

## 10. Final Status
The application is structurally ready for deployment to a proper production environment, but it is not safe to deploy without replacing default credentials, hardening secrets, and validating the live environment configuration.
