import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const records = await prisma.visitor.findMany({
    where: { visitDate: date },
    orderBy: { registeredAt: 'asc' },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MHC Gate Pass System';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`Visitor Log - ${date}`);

  sheet.columns = [
    { header: 'Petsa/Oras ng Reg.', key: 'registeredAt', width: 22 },
    { header: 'Pangalan', key: 'fullName', width: 25 },
    { header: 'Uri', key: 'visitorType', width: 14 },
    { header: 'Kumpanya', key: 'company', width: 24 },
    { header: 'Bibisitahin', key: 'personToVisit', width: 22 },
    { header: 'Layunin', key: 'purpose', width: 24 },
    { header: 'Lugar', key: 'area', width: 20 },
    { header: 'Pass Code', key: 'passCode', width: 16 },
    { header: 'Status', key: 'status', width: 24 },
    { header: 'Time In', key: 'timeIn', width: 18 },
    { header: 'Time Out', key: 'timeOut', width: 18 },
    { header: 'Guard (Approved)', key: 'verifiedBy', width: 18 },
    { header: 'Health Flag', key: 'hasHealthSymptoms', width: 14 },
  ];

  // Header style
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF17324D' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 22;

  records.forEach((r) => {
    const row = sheet.addRow({
      registeredAt: new Date(r.registeredAt).toLocaleString('en-PH'),
      fullName: r.fullName,
      visitorType: r.visitorType,
      company: r.company,
      personToVisit: r.personToVisit,
      purpose: r.purpose,
      area: r.area,
      passCode: r.passCode || '—',
      status: r.status.replace(/_/g, ' '),
      timeIn: r.timeIn ? new Date(r.timeIn).toLocaleTimeString('en-PH') : '—',
      timeOut: r.timeOut ? new Date(r.timeOut).toLocaleTimeString('en-PH') : '—',
      verifiedBy: r.verifiedBy || '—',
      hasHealthSymptoms: r.hasHealthSymptoms ? '⚠ FLAGGED' : '✓ Clear',
    });

    // Color-code by status
    if (r.status === 'REJECTED') {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3F3' } };
    } else if (r.hasHealthSymptoms) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
    }
  });

  sheet.autoFilter = { from: 'A1', to: 'M1' };

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="MHC_Visitor_Log_${date}.xlsx"`,
    },
  });
}
