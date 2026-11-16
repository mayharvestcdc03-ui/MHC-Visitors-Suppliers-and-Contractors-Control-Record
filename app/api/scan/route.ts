import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Scan QR code and log entry/exit
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const passCode = searchParams.get('passCode');
  if (!passCode) return NextResponse.json({ success: false, error: 'No pass code provided' }, { status: 400 });

  const visitor = await prisma.visitor.findUnique({ where: { passCode } });
  if (!visitor) return NextResponse.json({ success: false, error: 'Invalid pass code. Not found.' }, { status: 404 });

  const today = new Date().toISOString().split('T')[0];
  if (visitor.visitDate !== today) {
    return NextResponse.json({ success: false, error: `Pass expired. Valid only on ${visitor.visitDate}.` }, { status: 403 });
  }

  if (visitor.status === 'REJECTED') {
    return NextResponse.json({ success: false, error: 'This visitor has been REJECTED. Do not allow entry.' }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: visitor });
}
