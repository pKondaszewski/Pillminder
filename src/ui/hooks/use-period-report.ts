import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { inclusiveDayRange } from '@/config/date-utils';
import { createLogger } from '@/config/logger';
import { type AdherenceReport, getAdherence } from '@/doses/dose-service';
import { buildPeriodReport } from '@/products/period-report';
import type { PeriodReportEntry } from '@/products/product-service';

import { useProducts } from './use-products';

const log = createLogger('use-period-report');

export function usePeriodReport(
  firstDay: Date,
  lastDay: Date,
): PeriodReportEntry[] | null {
  const { i18n } = useTranslation();
  const { products } = useProducts();
  const [loaded, setReport] = useState<{
    rangeKey: string;
    report: AdherenceReport;
  } | null>(null);
  const firstKey = firstDay.getTime();
  const lastKey = lastDay.getTime();
  const rangeKey = `${firstKey}-${lastKey}`;

  useEffect(() => {
    let cancelled = false;
    const { from, to } = inclusiveDayRange(
      new Date(firstKey),
      new Date(lastKey),
    );
    getAdherence(from, to, new Date())
      .then((result) => {
        if (!cancelled) setReport({ rangeKey, report: result });
      })
      .catch((err) => log.error('Failed to load adherence report', err));
    return () => {
      cancelled = true;
    };
  }, [firstKey, lastKey, rangeKey]);

  return useMemo(
    () =>
      loaded?.rangeKey === rangeKey
        ? buildPeriodReport(products, loaded.report, i18n.language)
        : null,
    [products, loaded, rangeKey, i18n.language],
  );
}
