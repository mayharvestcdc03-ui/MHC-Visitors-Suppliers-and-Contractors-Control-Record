import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import fs from 'fs';

const RETENTION_DAYS = 30;

// GET /api/purge?dry=true  → preview what will be purged
// POST /api/purge           → actually purge expired ID docs
export async function GET(req: NextRequest) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const expired = await prisma.visitor.findMany({
    where: {
      registeredAt: { lt: cutoff },
      idFilePath: { not: null },
      idPurgedAt: null,
    },
    select: { id: true, fullName: true, registeredAt: true, idFileName: true },
  });

  return NextResponse.json({
    success: true,
    retentionDays: RETENTION_DAYS,
    cutoffDate: cutoff.toISOString(),
    expiredCount: expired.length,
    records: expired,
  });
}

export async function POST(req: NextRequest) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const expired = await prisma.visitor.findMany({
    where: {
      registeredAt: { lt: cutoff },
      idFilePath: { not: null },
      idPurgedAt: null,
    },
  });

  let purgedCount = 0;
  const errors: string[] = [];

  for (const record of expired) {
    try {
      if (record.idFilePath && fs.existsSync(record.idFilePath)) {
        fs.unlinkSync(record.idFilePath);
      }
      await prisma.visitor.update({
        where: { id: record.id },
        data: { idFilePath: null, idPurgedAt: new Date() },
      });
      await prisma.auditLog.create({
        data: {
          userName: 'System Auto-Purge',
          action: 'PURGE_ID_DOCUMENT',
          targetId: record.id,
          details: `Auto-purged ID of ${record.fullName} — exceeded ${RETENTION_DAYS}-day RA 10173 retention limit`,
        },
      }).catch(() => {});
      purgedCount++;
    } catch (e: any) {
      errors.push(`${record.id}: ${e.message}`);
    }
  }

  return NextResponse.json({
    success: true,
    purgedCount,
    errors,
    message: `Purged ${purgedCount} ID document(s) per RA 10173 (${RETENTION_DAYS}-day retention policy).`,
  });
}
