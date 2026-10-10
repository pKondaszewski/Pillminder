export interface PeriodAdherence {
  taken: number;
  due: number;
  upcoming: number;
  rate: number | null;
}

export interface PeriodReportEntry extends PeriodAdherence {
  id: string;
  title: string;
  isArchived: boolean;
}
