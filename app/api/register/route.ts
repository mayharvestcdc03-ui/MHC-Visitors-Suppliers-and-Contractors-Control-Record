import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const RegisterSchema = z.object({
  visitorType: z.string().min(1, 'Piliin ang Uri ng Bisita'),
  fullName: z.string().min(2, 'Buong Pangalan ay kailangan'),
  idType: z.string().min(1, 'Piliin ang Valid ID Type'),
  idNumber: z.string().min(3, 'Ilagay ang ID Number'),
  company: z.string().min(2, 'Kumpanya o Tirahan'),
  contact: z.string().optional(),
  personToVisit: z.string().min(2, 'Pangalan ng Bibisitahin'),
  purpose: z.string().min(2, 'Layunin ng Pagbisita'),
  area: z.string().min(1, 'Awtorisadong Lugar'),
  plate: z.string().optional(),
  visitDate: z.string().min(1, 'Petsa ng Pagbisita'),
  expectedTime: z.string().min(1, 'Inaasahang Oras'),
  notes: z.string().optional(),
  healthAnswers: z.array(z.string()).length(14, 'Lahat ng 14 tanong sa kalusugan ay dapat sagutan'),
  healthConsent: z.boolean().refine((val) => val === true, 'Kailangang sumang-ayon sa Health Declaration'),
  privacyConsent: z.boolean().refine((val) => val === true, 'Kailangang sumang-ayon sa Data Privacy Act'),
  idFileData: z.string().min(1, 'Kailangang mag-upload ng Valid ID'),
  idFileName: z.string().min(1),
  idFileType: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    // Suriin kung may "Yes" sa 14 health declaration questions
    const hasSymptoms = validated.healthAnswers.some((ans) => ans.toLowerCase() === 'yes');

    // Ligtas na pag-store ng ID file
    const uploadsDir = path.join(process.cwd(), 'storage', 'ids');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Kunin ang base64 extension at linisin
    const matches = validated.idFileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let filePath = '';
    
    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], 'base64');
      const ext = path.extname(validated.idFileName) || '.jpg';
      const safeFileName = `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
      filePath = path.join(uploadsDir, safeFileName);
      await fs.writeFile(filePath, buffer);
    }

    // Lumikha ng Visitor record sa database
    const visitor = await prisma.visitor.create({
      data: {
        visitorType: validated.visitorType,
        fullName: validated.fullName,
        idType: validated.idType,
        idNumber: validated.idNumber,
        company: validated.company,
        contact: validated.contact || null,
        personToVisit: validated.personToVisit,
        purpose: validated.purpose,
        area: validated.area,
        plate: validated.plate || null,
        visitDate: validated.visitDate,
        expectedTime: validated.expectedTime,
        notes: validated.notes || null,
        healthAnswers: JSON.stringify(validated.healthAnswers),
        healthConsent: validated.healthConsent,
        hasHealthSymptoms: hasSymptoms,
        idFileName: validated.idFileName,
        idFileType: validated.idFileType,
        idFilePath: filePath,
        privacyConsent: validated.privacyConsent,
        status: 'PENDING_ID_VERIFICATION',
      },
    });

    // Itala sa AuditLog
    await prisma.auditLog.create({
      data: {
        userName: validated.fullName,
        action: 'VISITOR_REGISTRATION_SUBMITTED',
        targetId: visitor.id,
        details: `Nag-register bilang ${validated.visitorType} para sa ${validated.area}. Health Flag: ${hasSymptoms ? 'YES' : 'CLEARED'}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: visitor.id,
        fullName: visitor.fullName,
        status: visitor.status,
        hasHealthSymptoms: visitor.hasHealthSymptoms,
        message: 'Matagumpay na naitala ang registration.',
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'May kulang o maling datos sa form.', details: err.errors },
        { status: 400 }
      );
    }
    console.error('Registration Error:', err);
    return NextResponse.json(
      { success: false, error: 'Nagkaroon ng server error sa pag-proseso ng registration.' },
      { status: 500 }
    );
  }
}
