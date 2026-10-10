import {
  buildDoctorSummaryHtml,
  type DoctorSummaryContext,
  doctorSummaryFileName,
  SUMMARY_FILE_PATTERN,
} from '../doctor-summary';
import type { PeriodReportEntry } from '../dto/period-report-output';
import type { ProductOverviewEntry } from '../dto/product-overview-output';

const MESSAGES: Record<string, string> = {
  'summary.title': 'Summary',
  'summary.period': 'Period: {{from}} – {{to}}',
  'summary.generated': 'Generated: {{date}}',
  'summary.noActive': 'No active products',
  'period.empty': 'No doses planned',
  'period.noneDue': 'No doses due yet',
  'period.taken': '{{taken}} of {{due}} taken ({{percent}}%)',
  'period.upcoming': 'Upcoming: {{count}}',
  'products.archived': 'Archived',
};

const context: DoctorSummaryContext = {
  t: (key, options = {}) =>
    Object.entries(options).reduce(
      (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
      MESSAGES[key] ?? key,
    ),
  formatDate: (date) => date.toISOString().slice(0, 10),
  locale: 'en',
  now: new Date(Date.UTC(2026, 9, 10)),
};

const firstDay = new Date(Date.UTC(2026, 8, 11));
const lastDay = new Date(Date.UTC(2026, 9, 10));

function overviewEntry(
  overrides: Partial<ProductOverviewEntry> = {},
): ProductOverviewEntry {
  return {
    id: 'a',
    title: 'Aspirin',
    category: 'Medication',
    rhythm: ['Daily at 08:00'],
    stock: { text: 'Stock: 12 pcs', isLow: false },
    ...overrides,
  };
}

function reportEntry(
  overrides: Partial<PeriodReportEntry> = {},
): PeriodReportEntry {
  return {
    id: 'a',
    title: 'Aspirin',
    isArchived: false,
    taken: 3,
    due: 4,
    upcoming: 0,
    rate: 0.75,
    ...overrides,
  };
}

describe('buildDoctorSummaryHtml', () => {
  it('renders period, generation date, rhythm and adherence', () => {
    // given
    const input = {
      overview: [overviewEntry()],
      report: [reportEntry({ upcoming: 2 })],
      firstDay,
      lastDay,
    };

    // when
    const html = buildDoctorSummaryHtml(input, context);

    // then
    expect(html).toContain('Period: 2026-09-11 – 2026-10-10');
    expect(html).toContain('Generated: 2026-10-10');
    expect(html).toContain('Daily at 08:00');
    expect(html).toContain('3 of 4 taken (75%) · Upcoming: 2');
  });

  it('leaves the stock line out', () => {
    // given
    const input = {
      overview: [overviewEntry()],
      report: [],
      firstDay,
      lastDay,
    };

    // when
    const html = buildDoctorSummaryHtml(input, context);

    // then
    expect(html).not.toContain('Stock: 12 pcs');
  });

  it('escapes user-provided strings', () => {
    // given
    const input = {
      overview: [
        overviewEntry({
          title: '<b>x',
          category: 'a & b "c"',
          rhythm: ['<i>'],
        }),
      ],
      report: [reportEntry({ title: "<script>alert('x')</script>" })],
      firstDay,
      lastDay,
    };

    // when
    const html = buildDoctorSummaryHtml(input, context);

    // then
    expect(html).toContain('&lt;b&gt;x');
    expect(html).toContain('a &amp; b &quot;c&quot;');
    expect(html).toContain('&lt;i&gt;');
    expect(html).toContain('&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;');
    expect(html).not.toContain('<b>x');
    expect(html).not.toContain('<script>');
  });

  it('marks archived products', () => {
    // given
    const input = {
      overview: [],
      report: [reportEntry({ isArchived: true })],
      firstDay,
      lastDay,
    };

    // when
    const html = buildDoctorSummaryHtml(input, context);

    // then
    expect(html).toContain('Archived');
  });

  it('says no doses are due yet when the rate is null', () => {
    // given
    const input = {
      overview: [],
      report: [reportEntry({ taken: 0, due: 0, upcoming: 0, rate: null })],
      firstDay,
      lastDay,
    };

    // when
    const html = buildDoctorSummaryHtml(input, context);

    // then
    expect(html).toContain('No doses due yet');
  });

  it('renders placeholders for an empty period and no active products', () => {
    // given
    const input = { overview: [], report: [], firstDay, lastDay };

    // when
    const html = buildDoctorSummaryHtml(input, context);

    // then
    expect(html).toContain('No active products');
    expect(html).toContain('No doses planned');
    expect(html).not.toContain('<table>');
  });
});

describe('doctorSummaryFileName', () => {
  it('names the file after the period', () => {
    // given
    const first = new Date(2026, 8, 11);
    const last = new Date(2026, 9, 10);

    // when
    const name = doctorSummaryFileName(first, last);

    // then
    expect(name).toBe('pillminder-summary-2026-09-11_2026-10-10.pdf');
  });
});

describe('SUMMARY_FILE_PATTERN', () => {
  it('matches the generated file name', () => {
    // given
    const name = doctorSummaryFileName(
      new Date(2026, 8, 11),
      new Date(2026, 9, 10),
    );

    // when
    const matches = SUMMARY_FILE_PATTERN.test(name);

    // then
    expect(matches).toBe(true);
  });
});
