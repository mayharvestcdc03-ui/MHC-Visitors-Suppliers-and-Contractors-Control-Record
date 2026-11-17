const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'GUARD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "Visitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorType" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "idType" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "contact" TEXT,
    "personToVisit" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "plate" TEXT,
    "visitDate" TEXT NOT NULL,
    "expectedTime" TEXT NOT NULL,
    "notes" TEXT,
    "healthAnswers" TEXT NOT NULL,
    "healthConsent" BOOLEAN NOT NULL DEFAULT false,
    "hasHealthSymptoms" BOOLEAN NOT NULL DEFAULT false,
    "idFileName" TEXT,
    "idFileType" TEXT,
    "idFilePath" TEXT,
    "idPurgedAt" DATETIME,
    "privacyConsent" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'Pending ID Verification',
    "passCode" TEXT,
    "passUsed" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "entryRecordedBy" TEXT,
    "timeIn" DATETIME,
    "exitRecordedBy" TEXT,
    "timeOut" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Visitor_passCode_key" ON "Visitor"("passCode");`
];

async function initDb() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuth = process.env.TURSO_AUTH_TOKEN;
  const dbUrl = process.env.DATABASE_URL;

  // Identify targets to initialize
  const targets = [];

  if (tursoUrl) {
    targets.push({ url: tursoUrl, authToken: tursoAuth, desc: 'Turso Cloud (' + tursoUrl + ')' });
  }

  // Also check if DATABASE_URL is libsql
  if (dbUrl && dbUrl.startsWith('libsql:') && (!tursoUrl || dbUrl !== tursoUrl)) {
    // Extract authToken if inside query param
    try {
      const parsed = new URL(dbUrl);
      const token = parsed.searchParams.get('authToken') || tursoAuth;
      parsed.searchParams.delete('authToken');
      targets.push({ url: parsed.toString(), authToken: token, desc: 'DATABASE_URL (' + parsed.hostname + ')' });
    } catch {
      targets.push({ url: dbUrl, authToken: tursoAuth, desc: 'DATABASE_URL' });
    }
  }

  // Always ensure local sqlite databases have tables too
  targets.push({ url: 'file:./dev.db', desc: 'Local dev.db' });
  targets.push({ url: 'file:./prisma/dev.db', desc: 'Prisma dev.db' });

  for (const target of targets) {
    try {
      console.log(`[init-db] Initializing schema on ${target.desc}...`);
      const client = createClient({
        url: target.url,
        authToken: target.authToken,
      });

      for (const statement of DDL_STATEMENTS) {
        await client.execute(statement);
      }

      // Check and seed default users
      const usersCheck = await client.execute('SELECT COUNT(*) as count FROM "User"');
      const count = Number(usersCheck.rows[0]?.count || 0);

      if (count === 0) {
        console.log(`[init-db] Seeding default users on ${target.desc}...`);
        const adminPass = await bcrypt.hash('Admin@MHC2026', 10);
        const guardPass = await bcrypt.hash('Guard@MHC2026', 10);
        const now = new Date().toISOString();

        await client.execute({
          sql: `INSERT OR IGNORE INTO "User" (id, email, name, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: ['usr_admin_1', 'admin@mayharvest.com', 'System Administrator', adminPass, 'ADMIN', now, now]
        });

        await client.execute({
          sql: `INSERT OR IGNORE INTO "User" (id, email, name, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: ['usr_guard_1', 'guard1@mayharvest.com', 'Officer Reyes', guardPass, 'GUARD', now, now]
        });

        await client.execute({
          sql: `INSERT OR IGNORE INTO "User" (id, email, name, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: ['usr_guard_2', 'guard2@mayharvest.com', 'Officer Santos', guardPass, 'GUARD', now, now]
        });
      }

      console.log(`[init-db] ✅ Successfully verified tables on ${target.desc}`);
    } catch (err) {
      console.warn(`[init-db] ⚠️ Notice for ${target.desc}:`, err.message || err);
    }
  }
}

if (require.main === module) {
  initDb()
    .then(() => {
      console.log('[init-db] All database initialization completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[init-db] Failed to initialize database:', err);
      // Don't fail the build completely if remote cloud DB is unreachable during build
      process.exit(0);
    });
}

module.exports = { initDb, DDL_STATEMENTS };
