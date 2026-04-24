import jsPDF from 'jspdf';

function buildIntentBar(score: number): string {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty) + ` ${score}/100`;
}

function checkPageBreak(doc: jsPDF, y: number, margin: number = 270): number {
  if (y > margin) {
    doc.addPage();
    return 20;
  }
  return y;
}

function addSectionHeading(doc: jsPDF, text: string, y: number): number {
  y = checkPageBreak(doc, y);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31); // #1D1D1F
  doc.text(text, 20, y);
  return y + 7;
}

function addBodyText(doc: jsPDF, text: string, y: number, indent: number = 20, maxWidth: number = 170): number {
  y = checkPageBreak(doc, y);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(68, 68, 68); // #444
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string) => {
    y = checkPageBreak(doc, y);
    doc.text(line, indent, y);
    y += 5.5;
  });
  return y;
}

function addDivider(doc: jsPDF, y: number): number {
  y = checkPageBreak(doc, y + 3);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
  return y + 6;
}

export function exportIntelligencePdf(result: any, companyName: string): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const pageWidth = 210;

  // ── HEADER ──────────────────────────────────────────────────────────────
  // Blue accent bar
  doc.setFillColor(0, 113, 227); // #0071E3
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(companyName, 20, 13);

  if (result.company?.tagline) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`"${result.company.tagline}"`, 20, 20);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 255);
  doc.text(`Intelligence Report  •  ${dateStr}`, 20, 26);

  // SIGNALZ badge (top-right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('SIGNALZ AI', pageWidth - 20, 17, { align: 'right' });

  let y = 40;

  // ── SECTION 1: Company Overview ─────────────────────────────────────────
  y = addSectionHeading(doc, '1. Company Overview', y);
  y += 2;

  const overviewFields = [
    ['Name', result.company?.name],
    ['Industry', result.company?.industry],
    ['Headquarters', result.company?.headquarters],
    ['Company Size', result.company?.size],
    ['Revenue', result.financials?.revenue],
    ['Website', result.company?.website],
  ];

  overviewFields.forEach(([label, value]) => {
    if (!value) return;
    y = checkPageBreak(doc, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 29, 31);
    doc.text(`${label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(68, 68, 68);
    doc.text(String(value), 55, y);
    y += 6;
  });

  if (result.company?.summary) {
    y += 2;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 29, 31);
    doc.text('Summary:', 20, y);
    y += 5;
    y = addBodyText(doc, result.company.summary, y);
  }

  y = addDivider(doc, y);

  // ── SECTION 2: Intent Score ──────────────────────────────────────────────
  if (result.company?.intentScore?.score != null) {
    y = addSectionHeading(doc, '2. Buying Intent Score', y);
    y += 2;

    const score = result.company.intentScore.score;
    const bar = buildIntentBar(score);
    const label = score >= 70 ? 'High Intent' : score >= 40 ? 'Medium Intent' : 'Low Intent';

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 113, 227);
    doc.text(bar, 20, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 29, 31);
    doc.text(`Status: ${label}`, 20, y);
    y += 6;

    if (result.company.intentScore.justification) {
      y = addBodyText(doc, `"${result.company.intentScore.justification}"`, y);
    }

    y = addDivider(doc, y);
  }

  // ── SECTION 3: Recent News ───────────────────────────────────────────────
  const news: string[] = result.company?.recentNews || [];
  if (news.length > 0) {
    y = addSectionHeading(doc, '3. Recent News', y);
    y += 2;
    news.slice(0, 5).forEach((item: string) => {
      y = checkPageBreak(doc, y);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(68, 68, 68);
      // bullet
      doc.text('•', 20, y);
      const lines = doc.splitTextToSize(item, 160);
      lines.forEach((line: string, li: number) => {
        y = checkPageBreak(doc, y);
        doc.text(line, 26, li === 0 ? y : y);
        if (li === 0 && lines.length > 1) y += 5;
        else if (li > 0) y += 5;
      });
      if (lines.length === 1) y += 6;
      else y += 2;
    });
    y = addDivider(doc, y);
  }

  // ── SECTION 4: Key People ────────────────────────────────────────────────
  const keyPeople: any[] = result.keyPeople || [];
  if (keyPeople.length > 0) {
    y = addSectionHeading(doc, '4. Key People', y);
    y += 2;
    keyPeople.forEach((person: any) => {
      y = checkPageBreak(doc, y + 10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(29, 29, 31);
      doc.text(`${person.name} — ${person.title}`, 20, y);
      y += 5;
      if (person.hook) {
        y = addBodyText(doc, `Hook: "${person.hook}"`, y, 24);
      }
      y += 2;
    });
    y = addDivider(doc, y);
  }

  // ── SECTION 5: Tech Stack ────────────────────────────────────────────────
  const techStack: string[] = result.techStack || [];
  if (techStack.length > 0) {
    y = addSectionHeading(doc, '5. Tech Stack', y);
    y += 2;
    y = addBodyText(doc, techStack.join(', '), y);
    y = addDivider(doc, y);
  }

  // ── SECTION 6: Suggested Email ───────────────────────────────────────────
  if (result.suggestedEmail) {
    y = addSectionHeading(doc, '6. Suggested Outreach Email', y);
    y += 2;

    const emailFields = [
      ['To', result.suggestedEmail.recipient],
      ['Subject', result.suggestedEmail.subject],
    ];
    emailFields.forEach(([label, value]) => {
      if (!value) return;
      y = checkPageBreak(doc, y);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(29, 29, 31);
      doc.text(`${label}:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(68, 68, 68);
      const lines = doc.splitTextToSize(String(value), 140);
      doc.text(lines[0], 40, y);
      y += 6;
    });

    if (result.suggestedEmail.body) {
      y += 2;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(29, 29, 31);
      doc.text('Body:', 20, y);
      y += 5;
      y = addBodyText(doc, result.suggestedEmail.body, y, 24);
    }

    y = addDivider(doc, y);
  }

  // ── SECTION 7: Competitors ───────────────────────────────────────────────
  const competitors: any[] = result.competitors || [];
  if (competitors.length > 0) {
    y = addSectionHeading(doc, '7. Competitors', y);
    y += 2;
    competitors.forEach((c: any) => {
      y = checkPageBreak(doc, y + 8);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(29, 29, 31);
      doc.text(`• ${c.name}`, 20, y);
      y += 5;
      if (c.advantage) {
        y = addBodyText(doc, `  Advantage: ${c.advantage}`, y, 26);
      }
    });
    y = addDivider(doc, y);
  }

  // ── SECTION 8: Similar Companies ────────────────────────────────────────
  const similar: any[] = result.similarCompanies || [];
  if (similar.length > 0) {
    y = addSectionHeading(doc, '8. Similar Companies to Approach', y);
    y += 2;
    similar.forEach((co: any) => {
      y = checkPageBreak(doc, y + 8);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(29, 29, 31);
      doc.text(`• ${co.name}${co.industry ? ` (${co.industry})` : ''}`, 20, y);
      y += 5;
      if (co.whyApproach) {
        y = addBodyText(doc, co.whyApproach, y, 26);
      }
    });
  }

  // ── FOOTER (every page) ──────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(0, 113, 227);
    doc.rect(0, 287, pageWidth, 10, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(
      `Generated by Signalz AI  •  signalz.thelycoris.com  •  ${dateStr}`,
      pageWidth / 2,
      293,
      { align: 'center' }
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 15, 293, { align: 'right' });
  }

  // ── SAVE ─────────────────────────────────────────────────────────────────
  const safeName = companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`signalz_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
