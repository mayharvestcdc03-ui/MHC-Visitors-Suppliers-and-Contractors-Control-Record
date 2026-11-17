import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '../../../../../lib/prisma';
import { generatePassCode } from '../../../../../lib/utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureDb();
    const { action, guardName } = await req.json();
    const visitor = await prisma.visitor.findUnique({ where: { id: params.id } });
    if (!visitor) return NextResponse.json({ success: false, error: 'Visitor not found' }, { status: 404 });

    let updated;

    if (action === 'approve') {
      let passCode = visitor.passCode;
      if (!passCode) {
        // Count existing visitors with this type who have been issued a pass
        const count = await prisma.visitor.count({
          where: {
            visitorType: visitor.visitorType,
            passCode: { not: null },
          },
        });
        passCode = generatePassCode(visitor.visitorType, count + 1);
      }
      const newStatus = visitor.timeIn ? 'Entered' : 'Approved - Pass Issued';
      updated = await prisma.visitor.update({
        where: { id: params.id },
        data: { status: newStatus, passCode, verifiedBy: guardName, verifiedAt: new Date() },
      });
      await prisma.auditLog.create({
        data: { userName: guardName, action: 'APPROVE_PASS', targetId: params.id, details: `Pass ${passCode} issued to ${visitor.fullName}` },
      });
    } else if (action === 'reject') {
      updated = await prisma.visitor.update({
        where: { id: params.id },
        data: { status: 'Rejected', passCode: null, verifiedBy: guardName, verifiedAt: new Date() },
      });
      await prisma.auditLog.create({
        data: { userName: guardName, action: 'REJECT_PASS', targetId: params.id, details: `${visitor.fullName} rejected` },
      });
    } else if (action === 'entry') {
      updated = await prisma.visitor.update({
        where: { id: params.id },
        data: { status: 'Entered', passUsed: true, timeIn: new Date(), entryRecordedBy: guardName },
      });
      await prisma.auditLog.create({
        data: { userName: guardName, action: 'RECORD_ENTRY', targetId: params.id, details: `Entry recorded for ${visitor.fullName}` },
      });
    } else if (action === 'exit') {
      updated = await prisma.visitor.update({
        where: { id: params.id },
        data: { status: 'Used / Checked Out', timeOut: new Date(), exitRecordedBy: guardName },
      });
      await prisma.auditLog.create({
        data: { userName: guardName, action: 'RECORD_EXIT', targetId: params.id, details: `Exit recorded for ${visitor.fullName}` },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
