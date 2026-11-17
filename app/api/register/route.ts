import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '../../../lib/prisma';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const RegisterSchema = z.object({
  visitorType: z.string().min(1, 'Piliin ang Uri ng Bisita'),
  fullName: z.string().min(2, 'Buong Pangalan ay kailangan'),
  idType: z.string().optional().default('Philippine National ID'),
  idNumber: z.string().optional().default('Pending Verification'),
  company: z.string().optional().default('Applicant / Personal'),
  contact: z.string().optional(),
  personToVisit: z.string().min(1, 'Ilagay ang Pangalan ng Bibisitahin o Department'),
  purpose: z.string().min(1, 'Layunin ng Pagbisita'),
  area: z.string().min(1, 'Awtorisadong Lugar'),
  plate: z.string().optional(),
  visitDate: z.string().min(1, 'Petsa ng Pagbisita'),
  expectedTime: z.string().min(1, 'Inaasahang Oras'),
  notes: z.string().optional(),
  healthAnswers: z.array(z.string()).length(14, 'Lahat ng 14 tanong sa kalusugan ay dapat sagutan'),
  healthConsent: z.boolean().refine((val) => val === true, 'Kailangang lagyan ng tsek ang Health Declaration'),
  privacyConsent: z.boolean().refine((val) => val === true, 'Kailangang lagyan ng tsek ang Data Privacy Acknowledgement'),
  idFileData: z.string().optional().nullable(),
  idFileName: z.string().optional().nullable(),
  idFileType: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    // Suriin kung may "Yes" sa 14 health declaration questions
    const hasSymptoms = validated.healthAnswers.some((ans) => String(ans).toLowerCase() === 'yes');

    // Ligtas na pag-store ng ID file kung mayroong in-upload
    let filePath: string | null = null;
    const fileName = validated.idFileName || null;
    const fileType = validated.idFileType || null;

    if (validated.idFileData && validated.idFileData.trim().length > 0) {
      try {
        const uploadsDir = path.join(process.cwd(), 'storage', 'ids');
        await fs.mkdir(uploadsDir, { recursive: true });

        const matches = validated.idFileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const buffer = Buffer.from(matches[2], 'base64');
          const ext = path.extname(validated.idFileName || '') || '.jpg';
          const safeFileName = `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
          filePath = path.join(uploadsDir, safeFileName);
          await fs.writeFile(filePath, buffer);
        }
      } catch (fileErr) {
        console.warn('ID file save failed, continuing registration without file:', fileErr);
      }
    }

    // Lumikha ng Visitor record sa database
    const visitor = await prisma.visitor.create({
      data: {
        visitorType: validated.visitorType,
        fullName: validated.fullName,
        idType: validated.idType || 'Philippine National ID',
        idNumber: validated.idNumber && validated.idNumber.trim() ? validated.idNumber.trim() : 'To be checked at gate',
        company: validated.company && validated.company.trim() ? validated.company.trim() : (validated.visitorType === 'Applicant' ? 'Applicant' : 'Personal'),
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
        idFileName: fileName,
        idFileType: fileType,
        idFilePath: filePath,
        privacyConsent: validated.privacyConsent,
        status: 'Pending ID Verification',
      },
    });

    // Itala sa AuditLog
    await prisma.auditLog.create({
      data: {
        userName: validated.fullName,
        action: 'VISITOR_REGISTRATION_SUBMITTED',
        targetId: visitor.id,
        details: `Nag-register bilang ${validated.visitorType} para sa ${validated.area}. ID Upload: ${filePath ? 'Yes' : 'No'}. Health Flag: ${hasSymptoms ? 'YES' : 'CLEARED'}`,
      },
    }).catch(() => {});

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
    console.error('Registration API Error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || 'May kulang o maling datos sa form.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: err?.message || 'May naganap na server error habang nagse-save ng registration.' },
      { status: 500 }
    );
  }
}
