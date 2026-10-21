export type CategoryNameCheck =
  | { name: string; error?: undefined }
  | { name?: undefined; error: 'blank' | 'taken' };
