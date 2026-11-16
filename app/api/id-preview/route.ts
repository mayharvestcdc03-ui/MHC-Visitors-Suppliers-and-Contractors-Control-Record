import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';

const RETENTION_DAYS = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const guardName = searchParams.get('guard') || 'Unknown Guard';

  if (!id) return new NextResponse('Missing id', { status: 400 });

  const visitor = await prisma.visitor.findUnique({ where: { id } });
  if (!visitor || !visitor.idFilePath) return new NextResponse('Not found', { status: 404 });

  // Check if ID has been purged
  if (visitor.idPurgedAt) {
    return new NextResponse(
      JSON.stringify({ error: 'ID document has been purged per DPA retention policy.', purgedAt: visitor.idPurgedAt }),
      { status: 410, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const filePath = visitor.idFilePath;
    if (!fs.existsSync(filePath)) return new NextResponse('File not found', { status: 404 });
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = visitor.idFileType || 'application/octet-stream';

    // --- AUDIT LOG: Record who viewed this ID document ---
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    await prisma.auditLog.create({
      data: {
        userName: guardName,
        action: 'VIEW_ID_DOCUMENT',
        targetId: id,
        details: `Viewed ID of ${visitor.fullName} (${visitor.idType})`,
        ipAddress: ip,
      },
    }).catch(() => {}); // Non-blocking — don't fail if log write fails

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, no-store', // No caching for sensitive ID docs
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch {
    return new NextResponse('Error reading file', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Manual purge endpoint (admin use)
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const visitor = await prisma.visitor.findUnique({ where: { id } });
  if (!visitor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (visitor.idFilePath && fs.existsSync(visitor.idFilePath)) {
    fs.unlinkSync(visitor.idFilePath);
  }

  await prisma.visitor.update({
    where: { id },
    data: { idFilePath: null, idPurgedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userName: 'System',
      action: 'PURGE_ID_DOCUMENT',
      targetId: id,
      details: `ID document of ${visitor.fullName} purged per RA 10173 retention policy`,
    },
  }).catch(() => {});

  return NextResponse.json({ success: true, message: 'ID document purged.' });
}
