import { File, Paths } from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';

import { createLogger } from '@/config/logger';
import { deleteStaleCacheFiles } from '@/config/stale-files';

import { doctorSummaryFileName, SUMMARY_FILE_PATTERN } from './doctor-summary';

const log = createLogger('doctor-summary-service');

const PDF_MIME_TYPE = 'application/pdf';
// A4 in points at 72 PPI; expo-print defaults to US Letter.
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

export async function shareDoctorSummary(
  html: string,
  firstDay: Date,
  lastDay: Date,
  dialogTitle: string,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }

  deleteStaleCacheFiles(SUMMARY_FILE_PATTERN);
  const printed = await printToFileAsync({
    html,
    width: A4_WIDTH,
    height: A4_HEIGHT,
  });
  const file = new File(Paths.cache, doctorSummaryFileName(firstDay, lastDay));
  await new File(printed.uri).move(file, { overwrite: true });

  log.info(`Sharing doctor summary (${printed.numberOfPages} pages)`);
  await Sharing.shareAsync(file.uri, {
    mimeType: PDF_MIME_TYPE,
    dialogTitle,
  });
}
