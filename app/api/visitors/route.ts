import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const date = searchParams.get('date') || '';

  const visitors = await prisma.visitor.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(date ? { visitDate: date } : {}),
      ...(search ? {
        OR: [
          { fullName: { contains: search } },
          { company: { contains: search } },
          { passCode: { contains: search } },
        ],
      } : {}),
    },
    orderBy: { registeredAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ success: true, data: visitors });
}
