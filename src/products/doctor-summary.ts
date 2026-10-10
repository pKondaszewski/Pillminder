import { isoDay } from '@/config/date-utils';
import type { Translate } from '@/schedules/schedule-rhythm';

import type { PeriodReportEntry } from './dto/period-report-output';
import type { ProductOverviewEntry } from './dto/product-overview-output';
import { describeAdherence } from './period-report';

const SUMMARY_FILE_PREFIX = 'pillminder-summary-';
export const SUMMARY_FILE_PATTERN = new RegExp(
  `^${SUMMARY_FILE_PREFIX}.*\\.pdf$`,
);

const STYLES = `
@page { margin: 15mm; }
body { font-family: sans-serif; font-size: 11pt; color: #000; background: #fff; }
h1 { font-size: 18pt; margin: 0 0 4pt; }
h2 { font-size: 13pt; margin: 18pt 0 6pt; }
p { margin: 0 0 6pt; }
.meta { font-size: 10pt; }
table { width: 100%; border-collapse: collapse; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
th, td { text-align: left; vertical-align: top; padding: 4pt 6pt; border-bottom: 0.5pt solid #000; }
th { border-bottom-width: 1pt; }
.archived { font-size: 9pt; }
`;

export interface DoctorSummaryInput {
  overview: ProductOverviewEntry[];
  report: PeriodReportEntry[];
  firstDay: Date;
  lastDay: Date;
}

export interface DoctorSummaryContext {
  t: Translate;
  formatDate: (date: Date) => string;
  locale: string;
  now: Date;
}

export function buildDoctorSummaryHtml(
  input: DoctorSummaryInput,
  context: DoctorSummaryContext,
): string {
  const { t, formatDate, locale, now } = context;
  const period = t('summary.period', {
    from: formatDate(input.firstDay),
    to: formatDate(input.lastDay),
  });
  const generated = t('summary.generated', { date: formatDate(now) });

  return `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}">
<head>
<meta charset="utf-8">
<style>${STYLES}</style>
</head>
<body>
<h1>${escapeHtml(t('summary.title'))}</h1>
<p class="meta">${escapeHtml(period)}<br>${escapeHtml(generated)}</p>
<h2>${escapeHtml(t('summary.currentTitle'))}</h2>
${overviewSection(input.overview, t)}
<h2>${escapeHtml(t('summary.adherenceTitle'))}</h2>
${reportSection(input.report, t)}
</body>
</html>`;
}

export function doctorSummaryFileName(firstDay: Date, lastDay: Date): string {
  return `${SUMMARY_FILE_PREFIX}${isoDay(firstDay)}_${isoDay(lastDay)}.pdf`;
}

function overviewSection(
  entries: ProductOverviewEntry[],
  t: Translate,
): string {
  if (entries.length === 0) {
    return `<p>${escapeHtml(t('summary.noActive'))}</p>`;
  }
  const rows = entries.map(
    (entry) => `<tr>
<td>${escapeHtml(entry.title)}</td>
<td>${escapeHtml(entry.category)}</td>
<td>${entry.rhythm.map(escapeHtml).join('<br>')}</td>
</tr>`,
  );
  return table(
    [
      t('summary.productColumn'),
      t('summary.categoryColumn'),
      t('summary.rhythmColumn'),
    ],
    rows,
  );
}

function reportSection(entries: PeriodReportEntry[], t: Translate): string {
  if (entries.length === 0) {
    return `<p>${escapeHtml(t('period.empty'))}</p>`;
  }
  const rows = entries.map(
    (entry) => `<tr>
<td>${escapeHtml(entry.title)}${
      entry.isArchived
        ? `<br><span class="archived">${escapeHtml(t('products.archived'))}</span>`
        : ''
    }</td>
<td>${escapeHtml(describeAdherence(entry, t))}</td>
</tr>`,
  );
  return table(
    [t('summary.productColumn'), t('summary.adherenceColumn')],
    rows,
  );
}

function table(headers: string[], rows: string[]): string {
  const head = headers.map((header) => `<th>${escapeHtml(header)}</th>`);
  return `<table>
<thead><tr>${head.join('')}</tr></thead>
<tbody>
${rows.join('\n')}
</tbody>
</table>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
