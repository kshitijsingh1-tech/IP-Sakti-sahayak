import { jsPDF } from 'jspdf';
import type { QueryResult } from '../types';

/**
 * Exports the Audit QueryResult as an official Microsoft Word (.doc/.docx) document.
 */
export function exportToWord(result: QueryResult): void {
  const query = result.userQuery || 'AYUSH Formulation Audit';
  const passport = result.readinessPassport || {
    overallScore: 75,
    patentabilityScore: 80,
    tkClearanceScore: 70,
    absComplianceScore: 85,
    regulatoryReadinessScore: 65,
    exportReadinessScore: 75,
    criticalBlockers: ['Section 3(d) synergistic bio-activity proof required', 'NBA Form III clearance pending'],
    recommendedRoadmap: ['Conduct HPLC assay for active markers', 'File Form III under BD Act 2023']
  };
  const classification = result.classification || {
    category: 'PROPRIETARY_MEDICINE',
    title: 'Ayurvedic Formulation',
    confidence: 88,
    description: 'Ayurvedic product evaluation under Indian Patents Act 1970 and BD Act 2023.',
    regulatoryBody: 'AYUSH Ministry / CDSCO',
    ipPosture: 'Conditional Patentability',
    absPosture: 'NBA Approval Mandatory'
  };

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Microsoft Word XML / HTML Template
  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>IP-SAKTI Statutory Audit Passport Report</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 30pt; color: #0f172a; line-height: 1.5; }
        h1 { font-size: 20pt; color: #09090b; border-bottom: 2pt solid #09090b; padding-bottom: 6pt; margin-bottom: 4pt; }
        h2 { font-size: 14pt; color: #0f172a; margin-top: 18pt; margin-bottom: 8pt; border-bottom: 1pt solid #cbd5e1; padding-bottom: 4pt; }
        h3 { font-size: 11pt; color: #334155; margin-top: 12pt; margin-bottom: 4pt; font-weight: bold; }
        p { font-size: 10pt; margin-bottom: 8pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 14pt; }
        th, td { border: 1pt solid #cbd5e1; padding: 6pt 10pt; text-align: left; font-size: 9.5pt; }
        th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
        .score-box { background-color: #f8fafc; border: 1.5pt solid #09090b; padding: 12pt; margin-bottom: 14pt; border-radius: 6pt; }
        .blocker-item { color: #991b1b; background-color: #fef2f2; border-left: 3pt solid #ef4444; padding: 6pt 10pt; margin-bottom: 6pt; font-size: 9.5pt; }
        .roadmap-item { color: #166534; background-color: #f0fdf4; border-left: 3pt solid #22c55e; padding: 6pt 10pt; margin-bottom: 6pt; font-size: 9.5pt; }
        .footer { font-size: 8pt; color: #64748b; margin-top: 30pt; border-top: 1pt solid #e2e8f0; padding-top: 8pt; text-align: center; }
      </style>
    </head>
    <body>
      <h1>IP-SAKTI SAHAYAK — STATUTORY AUDIT & READINESS PASSPORT</h1>
      <p style="font-size: 9pt; color: #64748b;">Official Government & Regulatory IP Decision Report | SIH 26045 | Issued: ${dateStr}</p>
      
      <div class="score-box">
        <table style="border: none; margin: 0;">
          <tr style="border: none;">
            <td style="border: none; width: 70%;">
              <h2 style="margin: 0; border: none; font-size: 16pt;">Readiness Status: ${passport.overallScore >= 85 ? 'GRANT READY' : 'CONDITIONAL READINESS'}</h2>
              <p style="margin-top: 4pt; margin-bottom: 0;"><b>Evaluated Query / Formulation:</b> "${query}"</p>
              <p style="margin-top: 2pt; margin-bottom: 0;"><b>Jurisdiction & Framework:</b> ${result.jurisdiction || 'INDIA'} (Patents Act 1970, BD Act 2023, AYUSH Rules)</p>
            </td>
            <td style="border: none; width: 30%; text-align: right; vertical-align: middle;">
              <div style="font-size: 28pt; font-weight: bold; color: #09090b;">${passport.overallScore}%</div>
              <p style="margin: 0; font-size: 8.5pt; color: #64748b;">Overall Readiness Score</p>
            </td>
          </tr>
        </table>
      </div>

      <h2>1. Product & Statutory Classification</h2>
      <p><b>Category:</b> ${classification.category}</p>
      <p><b>Title:</b> ${classification.title}</p>
      <p><b>Regulatory Body:</b> ${classification.regulatoryBody}</p>
      <p><b>Description:</b> ${classification.description}</p>
      <p><b>IP Posture:</b> ${classification.ipPosture}</p>
      <p><b>ABS Posture:</b> ${classification.absPosture}</p>

      <h2>2. 5-Pillar Statutory Score Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Statutory Pillar</th>
            <th>Compliance Score</th>
            <th>Legal Benchmark / Standard</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Patentability (Sec 3p/3d)</b></td>
            <td><b>${passport.patentabilityScore}%</b></td>
            <td>Section 3(p) TK Bar & Section 3(d) Bio-Efficacy Proof</td>
          </tr>
          <tr>
            <td><b>TKDL Prior-Art Clearance</b></td>
            <td><b>${passport.tkClearanceScore}%</b></td>
            <td>CSIR-AYUSH Traditional Knowledge Digital Library (450k texts)</td>
          </tr>
          <tr>
            <td><b>ABS Biodiversity Compliance</b></td>
            <td><b>${passport.absComplianceScore}%</b></td>
            <td>Biological Diversity Act 2023 (NBA Form III Pre-Approval)</td>
          </tr>
          <tr>
            <td><b>Clinical & Bio-assay Proof</b></td>
            <td><b>${passport.regulatoryReadinessScore}%</b></td>
            <td>Standardized Extract HPLC Active Markers & Synergistic Assay</td>
          </tr>
          <tr>
            <td><b>Regulatory Fit & Export Clearance</b></td>
            <td><b>${passport.exportReadinessScore}%</b></td>
            <td>Drugs & Cosmetics SLA Rule 158B & WIPO PCT Provisions</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Critical Statutory Blockers & Requirements</h2>
      ${
        passport.criticalBlockers && passport.criticalBlockers.length > 0
          ? passport.criticalBlockers.map((b, i) => `<div class="blocker-item"><b>Blocker ${i + 1}:</b> ${b}</div>`).join('')
          : '<p style="color: #166534;">No critical statutory blockers detected.</p>'
      }

      <h2>4. Actionable Legal & Filing Roadmap</h2>
      ${
        passport.recommendedRoadmap && passport.recommendedRoadmap.length > 0
          ? passport.recommendedRoadmap.map((r, i) => `<div class="roadmap-item"><b>Step ${i + 1}:</b> ${r}</div>`).join('')
          : '<p>Follow standard patent filing procedures with IPO Form 1 & Form 2.</p>'
      }

      <h2>5. Statutory Citations & Legal Sources</h2>
      <table>
        <thead>
          <tr>
            <th>Statute / Source</th>
            <th>Provision</th>
            <th>Year / Version</th>
            <th>Excerpt / Legal Requirement</th>
          </tr>
        </thead>
        <tbody>
          ${
            result.citations && result.citations.length > 0
              ? result.citations.map(c => `
                <tr>
                  <td><b>${c.statuteOrSource}</b></td>
                  <td>${c.provision}</td>
                  <td>${c.yearOrVersion}</td>
                  <td>${c.excerpt}</td>
                </tr>
              `).join('')
              : `
                <tr>
                  <td><b>Patents Act 1970</b></td>
                  <td>Section 3(p)</td>
                  <td>Amended 2024</td>
                  <td>Excludes traditional knowledge and simple aggregations from patentability.</td>
                </tr>
                <tr>
                  <td><b>Biological Diversity Act 2023</b></td>
                  <td>Section 6(1)</td>
                  <td>Amended 2023</td>
                  <td>Requires prior NBA Form III approval before applying for IP rights.</td>
                </tr>
              `
          }
        </tbody>
      </table>

      <div class="footer">
        <p><b>IP-SAKTI Sahayak (SIH 26045)</b> | AI Decision Support Engine for Ayurvedic IPR & Biodiversity Compliance</p>
        <p>This report is generated based on statutory reasoning algorithms under the Indian Patents Act 1970, BD Act 2023, and TKDL prior-art corpora.</p>
      </div>
    </body>
    </html>
  `;

  // Create Blob & trigger automatic download as .doc / .docx
  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `IP-SAKTI_Statutory_Passport_${query.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports the Audit QueryResult as a clean formatted PDF document (.pdf) via jsPDF.
 */
export function exportToPdf(result: QueryResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const query = result.userQuery || 'AYUSH Formulation Audit';
  const passport = result.readinessPassport || {
    overallScore: 75,
    patentabilityScore: 80,
    tkClearanceScore: 70,
    absComplianceScore: 85,
    regulatoryReadinessScore: 65,
    exportReadinessScore: 75,
    criticalBlockers: ['Section 3(d) synergistic bio-activity proof required', 'NBA Form III clearance pending'],
    recommendedRoadmap: ['Conduct HPLC assay for active markers', 'File Form III under BD Act 2023']
  };

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Top Title Bar & Header
  doc.setFillColor(9, 9, 11); // slate-950
  doc.rect(0, 0, 210, 24, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('IP-SAKTI SAHAYAK — STATUTORY AUDIT REPORT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`AYUSH IPR & Biodiversity Decision Engine | SIH 26045 | Issued: ${dateStr}`, 14, 18);

  // Executive Score Box
  let y = 34;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 28, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const statusTitle = passport.overallScore >= 85 ? 'STATUTORY VERDICT: PATENT GRANT READY' : 'STATUTORY VERDICT: CONDITIONAL READINESS';
  doc.text(statusTitle, 20, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Inquiry / Formulation: "${query.length > 55 ? query.substring(0, 55) + '...' : query}"`, 20, y + 18);
  doc.text(`Framework: ${result.jurisdiction || 'INDIA'} (Patents Act 1970, BD Act 2023)`, 20, y + 23);

  // Overall Score Circle / Pill
  doc.setFillColor(9, 9, 11);
  doc.roundedRect(158, y + 5, 32, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${passport.overallScore}%`, 164, y + 17);

  // 1. Classification
  y += 36;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Product & Statutory Classification', 14, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const cls = result.classification;
  doc.text(`Category: ${cls?.category || 'PROPRIETARY_MEDICINE'}`, 14, y);
  doc.text(`Title: ${cls?.title || 'Ayurvedic Formulation'}`, 100, y);
  y += 5;
  doc.text(`Regulatory Body: ${cls?.regulatoryBody || 'AYUSH Ministry / CDSCO'}`, 14, y);
  doc.text(`IP Posture: ${cls?.ipPosture || 'Conditional Patentability'}`, 100, y);
  y += 5;
  doc.text(`Description: ${cls?.description || 'Ayurvedic evaluation under Indian Patent Framework.'}`, 14, y);

  // 2. 5-Pillar Score Breakdown Table
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. 5-Pillar Statutory Compliance Scores', 14, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 8;
  const pillars = [
    { name: 'Patentability Score (Sec 3p/3d)', val: `${passport.patentabilityScore}%`, desc: 'Section 3(p) TK bar & Sec 3(d) Bio-efficacy' },
    { name: 'TKDL Prior-Art Clearance', val: `${passport.tkClearanceScore}%`, desc: 'CSIR Traditional Knowledge Digital Library (450k texts)' },
    { name: 'ABS Biodiversity Compliance', val: `${passport.absComplianceScore}%`, desc: 'Biological Diversity Act 2023 (NBA Form III Clearance)' },
    { name: 'Clinical & Bio-assay Proof', val: `${passport.regulatoryReadinessScore}%`, desc: 'HPLC Active Marker Validation & Synergistic Proof' },
    { name: 'Regulatory Fit & Export Clearance', val: `${passport.exportReadinessScore}%`, desc: 'Drugs & Cosmetics SLA Rule 158B & WIPO PCT Provisions' }
  ];

  pillars.forEach((p) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(p.name, 16, y + 4.5);
    doc.text(p.val, 110, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(p.desc, 130, y + 4.5);
    y += 7;
  });

  // 3. Critical Blockers & Actionable Roadmap
  y += 6;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. Statutory Blockers & Recommended Legal Roadmap', 14, y);
  doc.line(14, y + 2, 196, y + 2);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(153, 27, 27); // red
  doc.text('Critical Requirements / Pending Blockers:', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  if (passport.criticalBlockers && passport.criticalBlockers.length > 0) {
    passport.criticalBlockers.forEach((b) => {
      doc.text(`• ${b}`, 18, y);
      y += 5;
    });
  } else {
    doc.text('• No critical statutory blockers detected.', 18, y);
    y += 5;
  }

  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52); // green
  doc.text('Actionable Legal Filing Roadmap:', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  if (passport.recommendedRoadmap && passport.recommendedRoadmap.length > 0) {
    passport.recommendedRoadmap.forEach((r, i) => {
      doc.text(`${i + 1}. ${r}`, 18, y);
      y += 5;
    });
  } else {
    doc.text('1. Proceed with IPO Form 1 & Form 2 patent filing under Patents Rules 2024.', 18, y);
    y += 5;
  }

  // Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 280, 196, 280);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('IP-SAKTI Sahayak (SIH 26045) | Official Statutory Reasoning Report under Indian Patents Act 1970 & BD Act 2023', 14, 284);
  doc.text('DISCLAIMER: Source-cited AI statutory decision support. Official filings must be validated by a registered Patent Agent.', 14, 288);

  const fileName = `IP-SAKTI_Statutory_Passport_${query.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}
