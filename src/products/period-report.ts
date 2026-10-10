import type { AdherenceCounts, AdherenceReport } from '@/doses/dose-service';
import { productLabel } from '@/products/product-label';
import type { Product } from '@/products/product-service';

import type { PeriodReportEntry } from './dto/period-report-output';

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
