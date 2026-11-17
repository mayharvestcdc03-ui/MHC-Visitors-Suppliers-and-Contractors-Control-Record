import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '../../../../lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureDb();
    const visitor = await prisma.visitor.findUnique({ where: { id: params.id } });
    if (!visitor) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: visitor });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
