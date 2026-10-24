/// <reference types="node" />

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import en from '../locales/en.json';
import pl from '../locales/pl.json';

const SRC_DIR = join(__dirname, '../../..');
const PLURAL_SUFFIXES = ['one', 'few', 'many', 'other'];
const LITERAL_KEY_CALL = /\bt\(\s*(['"])([^'"`$\n]+)\1/g;
const DOTTED_STRING = /(['"])((?:[a-z][A-Za-z]*\.)+[A-Za-z]+)\1/g;

describe('translation keys used in code', () => {
  const sources = listSourceFiles(SRC_DIR).map((file) => ({
    file: file.replace(`${SRC_DIR}/`, ''),
    content: readFileSync(file, 'utf8'),
  }));

  it('exist in pl.json and en.json', () => {
    // given
    const sections = Object.keys(pl);
    const usages = sources.flatMap(({ file, content }) => [
      ...[...content.matchAll(LITERAL_KEY_CALL)].map((match) => ({
        file,
        key: match[2],
      })),
      // keys passed on as arguments (e.g. errorKey) and translated elsewhere
      ...[...content.matchAll(DOTTED_STRING)]
        .filter((match) => sections.includes(match[2].split('.')[0]))
        .map((match) => ({ file, key: match[2] })),
    ]);

    // when
    const missing = usages
      .flatMap(({ file, key }) => [
        ...(hasKey(pl, key) ? [] : [`${file}: ${key} (pl)`]),
        ...(hasKey(en, key) ? [] : [`${file}: ${key} (en)`]),
      ])
      .sort();

    // then
    expect(usages.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : listSourceFiles(path);
    }
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

function hasKey(locale: object, key: string): boolean {
  return [key, ...PLURAL_SUFFIXES.map((suffix) => `${key}_${suffix}`)].some(
    (candidate) => typeof resolve(locale, candidate) === 'string',
  );
}

function resolve(locale: object, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node !== null && typeof node === 'object'
          ? (node as Record<string, unknown>)[part]
          : undefined,
      locale,
    );
}
