const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Production-safe seed.
 *
 * Creates exactly ONE Super Admin account from environment variables:
 *   - SUPER_ADMIN_EMAIL
 *   - SUPER_ADMIN_PASSWORD
 *
 * No demo users, no demo companies, no demo courses.
 *
 * Behavior:
 *   - If a Super Admin already exists, this does nothing.
 *   - If env vars are missing in production, it fails loudly.
 *   - In non-production, falls back to safe local defaults so devs can still boot.
 */
const seedData = async () => {
  try {
    const {
      NODE_ENV,
      SUPER_ADMIN_EMAIL,
      SUPER_ADMIN_PASSWORD,
    } = process.env;

    const isProduction = NODE_ENV === 'production';

    console.log('[Seed] Checking existing database state...');
    const superAdminExists = await User.findOne({ role: 'SUPER_ADMIN' });

    if (superAdminExists) {
      console.log(`[Seed] Super Admin already exists: ${superAdminExists.email}. Skipping.`);
      return;
    }

    // Validate required env vars
    if (isProduction) {
      if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
        throw new Error(
          '[Seed] FATAL: SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env for production.'
        );
      }
      if (SUPER_ADMIN_PASSWORD.length < 12) {
        throw new Error(
          '[Seed] FATAL: SUPER_ADMIN_PASSWORD must be at least 12 characters in production.'
        );
      }
    }

    const superAdminEmail = SUPER_ADMIN_EMAIL || 'admin@localhost.test';
    const superAdminPassword = SUPER_ADMIN_PASSWORD || 'DevOnlyPassword123!';

    const passwordHash = await User.hashPassword(superAdminPassword);

    const superAdmin = await User.create({
      name: 'Platform Administrator',
      email: superAdminEmail,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      jobTitle: 'Platform Owner',
    });

    console.log('======================================================');
    console.log('✅ PLATFORM DATABASE SEEDED SUCCESSFULLY');
    console.log('------------------------------------------------------');
    console.log(`   Super Admin: ${superAdmin.email}`);
    console.log(`   Password:    (value from SUPER_ADMIN_PASSWORD in .env)`);
    console.log('   ⚠️  Change this password immediately after first login.');
    console.log('======================================================');
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    if (process.env.NODE_ENV === 'production') {
      // Crash the process so PM2 restarts and you see the error in logs
      throw err;
    }
  }
};

if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/database');
  (async () => {
    try {
      await connectDB();
      await seedData();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Runner Error]:', err);
      process.exit(1);
    }
  })();
}

module.exports = { seedData };
