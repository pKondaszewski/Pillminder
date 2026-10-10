import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { createLogger } from '@/config/logger';
import { buildDoctorSummaryHtml } from '@/products/doctor-summary';
import { shareDoctorSummary } from '@/products/doctor-summary-service';
import type {
  PeriodReportEntry,
  ProductOverviewEntry,
} from '@/products/product-service';
import { formatDate } from '@/ui/commons/format-date';

const log = createLogger('use-doctor-summary-export');

export function useDoctorSummaryExport(
  overview: ProductOverviewEntry[],
  report: PeriodReportEntry[] | null,
  firstDay: Date,
  lastDay: Date,
) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false);

  const share = async () => {
    if (report === null) return;
    setBusy(true);
    try {
      const html = buildDoctorSummaryHtml(
        { overview, report, firstDay, lastDay },
        { t, formatDate, locale: i18n.language, now: new Date() },
      );
      await shareDoctorSummary(
        html,
        firstDay,
        lastDay,
        t('summary.shareTitle'),
      );
    } catch (err) {
      log.error('Sharing the doctor summary failed', err);
      Alert.alert(
        t('summary.exportFailed'),
        err instanceof Error ? err.message : '',
      );
    } finally {
      setBusy(false);
    }
  };

  return { busy, share };
}
