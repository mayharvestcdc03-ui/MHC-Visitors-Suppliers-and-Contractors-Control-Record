export type Language = 'tl' | 'en';

export const HEALTH_QUESTIONS_TL = [
  '1. Pagtatae, pagsusuka, food poisoning, o karamdaman sa tiyan o bituka?',
  '2. Ubo, giniginaw/nilalagnat, pulmonya, namamagang lalamunan, matinding sipon o trangkaso, o kapos sa paghinga?',
  '3. Pananakit ng ulo?',
  '4. Pananakit ng katawan o kalamnan?',
  '5. Hepatitis o paninilaw ng balat/mata (jaundice)?',
  '6. Typhoid o paratyphoid fever?',
  '7. May lumalabas na likido sa ilong, mata, tainga, o gilagid?',
  '8. Pigsa, sugat, pantal, tagihawat, impeksyon sa daliri, eczema, o anumang sakit sa balat?',
  '9. Hirap sa paghinga o kakapusan ng hininga?',
  '10. Kamakailan bang naglakbay mula sa ibang bansa kung saan laganap ang mga sakit na nakukuha sa pagkain?',
  '11. Nagtrabaho o tumira sa parehong kapaligiran kasama ang may kumpirmadong COVID-19?',
  '12. May nakasalamuhang may lagnat, ubo, sipon, o namamagang lalamunan nitong nakaraang 2 linggo?',
  '13. Naglakbay sa labas ng Pilipinas nitong nakaraang 14 na araw?',
  '14. Naglakbay sa anumang lugar sa NCR o Maynila bukod sa inyong sariling tirahan?',
];

export const HEALTH_QUESTIONS_EN = [
  '1. Diarrhea, vomiting, food poisoning, or stomach/bowel disorders?',
  '2. Cough, sweating/chills, fever, pneumonia, sore throat, severe cold/flu, or shortness of breath?',
  '3. Headache?',
  '4. Body pain / muscle aches?',
  '5. Hepatitis / jaundice (yellowing of skin or eyes)?',
  '6. Typhoid / paratyphoid fever?',
  '7. Discharges from nose, eyes, ears, or gums?',
  '8. Boils, lesions, rash, acne, septic fingers, eczema, or any skin disease?',
  '9. Shortness of breath / difficulty breathing?',
  '10. Recently travelled from abroad where food-borne diseases are prevalent?',
  '11. Worked or stayed in the same close environment as a COVID-19 case?',
  '12. Contact with anyone with fever, cough, colds, or sore throat in the past 2 weeks?',
  '13. Travelled outside the Philippines in the last 14 days?',
  '14. Travelled to any area in NCR or Manila aside from your home?',
];

export const translations = {
  tl: {
    // Nav
    navRegister: 'Mag-rehistro ng Bisita',
    navQr: '📱 Scan Gamit ang Cellphone',
    navRecords: 'Talaan ng Pagsubaybay',
    navGuard: 'Pag-apruba ng Guard',
    navPass: 'One-Time Gate Pass',

    // Form
    title: 'Rehistrasyon ng Bisita, Trucker & Kontratista',
    visitorDetails: 'Mga Detalye ng Bisita',
    visitorType: 'Uri ng Bisita *',
    selectType: 'Pumili ng uri',
    fullName: 'Buong Pangalan *',
    company: 'Kumpanya / Tirahan',
    optionalForApplicant: '(Opsyonal para sa aplikante)',
    contact: 'Numero ng Telepono',
    personToVisit: 'Pangalan ng Bibisitahin',
    personToVisitOptional: 'Pangalan ng Bibisitahin (Opsyonal para sa truckers / delivery)',
    purpose: 'Layunin ng Pagbisita *',
    area: 'Awtorisadong Lugar *',
    selectArea: 'Pumili ng lugar',
    plate: 'Plaka ng Sasakyan (Opsyonal)',
    visitDate: 'Petsa ng Pagbisita *',
    expectedTime: 'Inaasahang Oras ng Pagpasok *',
    notes: 'Mga Karagdagang Tala / Dalang Gamit',
    optional: 'Opsyonal',

    // Health
    healthTitle: 'Deklarasyon sa Kalusugan (Kailangan)',
    healthDesc: 'Sagutan nang buong katapatan. Ang sagot na "Oo" ay maaaring suriin ng nurse o safety officer bago pumasok sa pasilidad.',
    healthTableHeadQ: 'Pagsusuri sa Kalusugan — ngayon o sa nakalipas na 2 linggo',
    healthTableHeadA: 'Sagot *',
    select: 'Pumili',
    yes: 'Oo',
    no: 'Hindi',
    healthConsent: 'Ipinapahayag ko na totoo at tama ang lahat ng aking sagot sa pagsusuri sa kalusugan alinsunod sa patakaran ng kumpanya.',

    // Privacy & ID
    privacyTitle: 'Proteksyon ng Datos at ID Verification (RA 10173)',
    privacyConsent: 'Pumapayag ako sa pagkolekta at pagproseso ng aking pangalan, detalye, at deklarasyong medikal para sa seguridad at biosecurity alinsunod sa Philippine Data Privacy Act of 2012 (RA 10173).',
    idType: 'Uri ng Valid ID (Opsyonal)',
    idNumber: 'Numero ng ID (Opsyonal)',
    idNumberPlaceholder: 'Ilagay ang numero ng ID o ipakita sa gate',
    uploadId: 'Mag-upload ng Litrato ng ID (Opsyonal)',
    uploadNote: 'Ang pag-upload ng ID photo ay opsyonal. Maaaring ipakita nang personal ang physical ID sa security guard sa gate.',

    // Buttons
    submit: 'I-submit ang Rehistrasyon',
    submitting: 'Ipinapasa...',
    clear: 'Linisin ang Form',

    // Waiting Screen
    waitingTitle: 'Nai-submit na ang iyong rehistrasyon',
    waitingSubtitle: 'Pakihintay ng ilang sandali para sa approval ng Security Guard...',
    waitingDesc: 'Ipinapasa na sa Guard House ang inyong impormasyon. Huwag isara ang pahinang ito. Kusang magpa-pop up dito ang inyong One-Time Gate Pass oras na ma-aprubahan ito ng guard upang maaari ninyo itong agad picturan.',
    waitingPill: 'Kasalukuyang naghihintay ng tugon mula kay Guard...',
    cancelBtn: 'Kanselahin / Mag-register ng Iba',

    // Pop-up Pass
    passApprovedTitle: '🎉 NA-APPROVE NA ANG INYONG GATE PASS!',
    passApprovedSubtitle: '📸 Maaari mo na itong PICTURAN o I-SCREENSHOT gamit ang iyong cellphone bago pumasok sa gate:',
    printBtn: '🖨️ I-print / I-save bilang PDF',
    closePassBtn: '✓ Nakuha ko na ang litrato / Mag-register muli',
  },
  en: {
    // Nav
    navRegister: 'Register Visitor',
    navQr: '📱 Scan to Register (QR Standee)',
    navRecords: 'Monitoring Records',
    navGuard: 'Security Approval / Guard',
    navPass: 'One-Time Gate Pass',

    // Form
    title: 'Visitor, Trucker & Contractor Registration',
    visitorDetails: 'Visitor Details',
    visitorType: 'Visitor Type *',
    selectType: 'Select type',
    fullName: 'Full Name *',
    company: 'Company / Address',
    optionalForApplicant: '(Optional for applicants)',
    contact: 'Contact Number',
    personToVisit: 'Person to Visit',
    personToVisitOptional: 'Person to Visit (Optional for truckers / deliveries)',
    purpose: 'Purpose of Visit *',
    area: 'Requested Area *',
    selectArea: 'Select area',
    plate: 'Vehicle Plate No. (Optional)',
    visitDate: 'Visit Date *',
    expectedTime: 'Expected Time In *',
    notes: 'Notes / Items Brought',
    optional: 'Optional',

    // Health
    healthTitle: 'Health Declaration (Required)',
    healthDesc: 'Answer each question truthfully. A "Yes" answer may require evaluation by the company nurse or safety officer before entry.',
    healthTableHeadQ: 'Health assessment — now or during the last 2 weeks, as applicable',
    healthTableHeadA: 'Answer *',
    select: 'Select',
    yes: 'Yes',
    no: 'No',
    healthConsent: 'I declare under penalty of company policy that the health information above is true and correct to the best of my knowledge.',

    // Privacy & ID
    privacyTitle: 'Data Privacy & ID Verification (RA 10173)',
    privacyConsent: 'I consent to the collection and processing of my name, contact details, company, purpose, and health declaration for security and biosecurity purposes per the Philippine Data Privacy Act of 2012 (RA 10173).',
    idType: 'Valid ID Type (Optional)',
    idNumber: 'ID Number (Optional)',
    idNumberPlaceholder: 'Enter ID number or present physical ID at gate',
    uploadId: 'Upload ID Photo / Document (Optional)',
    uploadNote: 'Uploading an ID photo is optional. You may present your physical valid ID in person to the security guard at the gate.',

    // Buttons
    submit: 'Submit Registration',
    submitting: 'Submitting...',
    clear: 'Clear Form',

    // Waiting Screen
    waitingTitle: 'Your registration has been submitted',
    waitingSubtitle: 'Please wait a few seconds for Security Guard approval...',
    waitingDesc: 'Your details have been transmitted to the Guard House for visual verification. Do not close this page. Your official One-Time Gate Pass will automatically pop up here once approved so you can take a photo of it.',
    waitingPill: 'Currently awaiting response from Guard House...',
    cancelBtn: 'Cancel / Register Another',

    // Pop-up Pass
    passApprovedTitle: '🎉 YOUR GATE PASS HAS BEEN APPROVED!',
    passApprovedSubtitle: '📸 You may now TAKE A PHOTO or SCREENSHOT of your pass using your smartphone before entering the gate:',
    printBtn: '🖨️ Print / Save as PDF',
    closePassBtn: '✓ I have taken a photo / Register another',
  },
};
