import type { AdherenceCounts, AdherenceReport } from '@/doses/dose-service';
import type { Translate } from '@/schedules/schedule-rhythm';

import type {
  PeriodAdherence,
  PeriodReportEntry,
} from './dto/period-report-output';
import { productLabel } from './product-label';
import type { Product } from './product-service';

export function buildPeriodReport(
  products: Product[],
  report: AdherenceReport,
  locale: string,
): PeriodReportEntry[] {
  return products
    .filter((product) => product.id in report.byProduct)
    .map((product) => toEntry(product, report.byProduct[product.id]))
    .sort(activeFirstThenTitle(locale));
}

export function describeAdherence(
  counts: PeriodAdherence,
  t: Translate,
): string {
  const parts = [
    counts.rate === null
      ? t('period.noneDue')
      : t('period.taken', {
          taken: counts.taken,
          due: counts.due,
          percent: Math.round(counts.rate * 100),
        }),
    ...(counts.upcoming > 0
      ? [t('period.upcoming', { count: counts.upcoming })]
      : []),
  ];
  return parts.join(' · ');
}

function toEntry(product: Product, counts: AdherenceCounts): PeriodReportEntry {
  return {
    id: product.id,
    title: productLabel(product.name, product.strength),
    isArchived: product.status === 'archived',
    ...toCounts(counts),
  };
}

function toCounts({ taken, due, upcoming, rate }: AdherenceCounts) {
  return { taken, due, upcoming, rate };
}

function activeFirstThenTitle(locale: string) {
  return (a: PeriodReportEntry, b: PeriodReportEntry): number =>
    Number(a.isArchived) - Number(b.isArchived) ||
    a.title.localeCompare(b.title, locale) ||
    a.id.localeCompare(b.id);
}
