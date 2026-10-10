import { File, Paths } from 'expo-file-system';

// shareAsync resolves when the chooser closes, not when the target app has read
// the file, so a shared file cannot be deleted right after sharing. Leftovers
// from earlier exports are removed on the next export instead.
export function deleteStaleCacheFiles(pattern: RegExp): void {
  Paths.cache
    .list()
    .filter(
      (entry): entry is File =>
        entry instanceof File && pattern.test(entry.name),
    )
    .forEach((file) => file.delete());
}
