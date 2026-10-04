import {
  BACKUP_FORMAT_VERSION,
  type BackupRows,
  parseBackup,
  serializeBackup,
} from '../backup-format';

const EXPORTED_AT = new Date('2026-03-01T10:00:00.000Z');
const PLANNED_AT = '2026-02-01T08:00:00.000Z';

type Json = Record<string, unknown>;

function product(overrides: Json = {}): Json {
  return {
    id: 'p1',
    name: 'Vitamin D',
    category: 'supplement',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  };
}

function schedule(overrides: Json = {}): Json {
  return {
    id: 's1',
    productId: 'p1',
    intervalDays: 1,
    timesOfDay: ['08:00'],
    ...overrides,
  };
}

function dose(overrides: Json = {}): Json {
  return {
    id: 'd1',
    productId: 'p1',
    scheduleId: 's1',
    plannedAt: PLANNED_AT,
    ...overrides,
  };
}

function note(overrides: Json = {}): Json {
  return {
    id: 'n1',
    productId: 'p1',
    body: 'Take with food',
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
    ...overrides,
  };
}

function backupText(overrides: Json = {}): string {
  return JSON.stringify({
    app: 'pillminder',
    version: BACKUP_FORMAT_VERSION,
    exportedAt: EXPORTED_AT.toISOString(),
    products: [product()],
    schedules: [schedule()],
    doses: [dose()],
    notes: [note()],
    ...overrides,
  });
}

function errorOf(text: string) {
  const result = parseBackup(text);
  if (result.ok) throw new Error('expected parse failure');
  return result.error;
}

function rowsOf(text: string): BackupRows {
  const result = parseBackup(text);
  if (!result.ok) throw new Error(`unexpected failure: ${result.error.code}`);
  return result.rows;
}

describe('serializeBackup / parseBackup round trip', () => {
  it('returns the same rows for all four tables, including dates and nulls', () => {
    // given
    const rows: BackupRows = {
      products: [
        {
          id: 'p1',
          name: 'Ibuprofen',
          category: 'medication',
          strength: '200 mg',
          price: 1299,
          storeLink: 'https://pharmacy.example/ibuprofen',
          status: 'archived',
          stock: 30,
          lastUsedAt: new Date('2026-02-10T07:30:00.000Z'),
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-02-10T07:30:00.000Z'),
        },
        {
          id: 'p2',
          name: 'Magnesium',
          category: 'supplement',
          strength: null,
          price: null,
          storeLink: null,
          status: 'active',
          stock: null,
          lastUsedAt: null,
          createdAt: new Date('2026-01-05T00:00:00.000Z'),
          updatedAt: new Date('2026-01-05T00:00:00.000Z'),
        },
      ],
      schedules: [
        {
          id: 's1',
          productId: 'p1',
          intervalDays: 2,
          timesOfDay: ['08:00', '20:30'],
          quantity: 2,
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-03-01T00:00:00.000Z'),
        },
        {
          id: 's2',
          productId: 'p2',
          intervalDays: 1,
          timesOfDay: ['09:00'],
          quantity: 1,
          startDate: null,
          endDate: null,
        },
      ],
      doses: [
        {
          id: 'd1',
          productId: 'p1',
          scheduleId: 's1',
          plannedAt: new Date('2026-02-10T07:00:00.000Z'),
          state: 'taken',
          takenAt: new Date('2026-02-10T07:30:00.000Z'),
          takenQuantity: 2,
          snoozedUntil: new Date('2026-02-10T07:20:00.000Z'),
        },
        {
          id: 'd2',
          productId: 'p2',
          scheduleId: 's2',
          plannedAt: new Date('2026-02-10T08:00:00.000Z'),
          state: 'pending',
          takenAt: null,
          takenQuantity: null,
          snoozedUntil: null,
        },
      ],
      notes: [
        {
          id: 'n1',
          productId: 'p1',
          body: 'Break from 1 March',
          createdAt: new Date('2026-02-11T00:00:00.000Z'),
          updatedAt: new Date('2026-02-12T00:00:00.000Z'),
        },
      ],
    };

    // when
    const result = parseBackup(serializeBackup(rows, EXPORTED_AT));

    // then
    expect(result).toEqual({ ok: true, rows });
  });

  it('returns empty tables for an empty database', () => {
    // given
    const rows: BackupRows = {
      products: [],
      schedules: [],
      doses: [],
      notes: [],
    };

    // when
    const result = parseBackup(serializeBackup(rows, EXPORTED_AT));

    // then
    expect(result).toEqual({ ok: true, rows });
  });

  it('writes app, version and exportedAt and serializes dates as ISO strings', () => {
    // given
    const rows: BackupRows = {
      products: [
        {
          ...product(),
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        },
      ],
      schedules: [],
      doses: [],
      notes: [],
    };

    // when
    const file = JSON.parse(serializeBackup(rows, EXPORTED_AT));

    // then
    expect(file.app).toBe('pillminder');
    expect(file.version).toBe(1);
    expect(file.exportedAt).toBe('2026-03-01T10:00:00.000Z');
    expect(file.products[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('does not export fields that are not columns of the schema', () => {
    // given
    const rows: BackupRows = {
      products: [{ ...product(), internalCache: 'x' }],
      schedules: [],
      doses: [],
      notes: [],
    };

    // when
    const file = JSON.parse(serializeBackup(rows, EXPORTED_AT));

    // then
    expect(file.products[0]).not.toHaveProperty('internalCache');
  });

  it('keeps a user-defined category through a round trip', () => {
    // given
    const text = backupText({
      products: [product({ category: 'Eye drops' })],
    });

    // when
    const rows = rowsOf(serializeBackup(rowsOf(text), EXPORTED_AT));

    // then
    expect(rows.products[0].category).toBe('Eye drops');
  });
});

describe('parseBackup: older schema and unknown fields', () => {
  it('fills missing optional columns with null and missing defaulted columns with their default', () => {
    // given
    const text = backupText({
      products: [product()],
      schedules: [schedule()],
      doses: [dose()],
    });

    // when
    const rows = rowsOf(text);

    // then
    expect(rows.products[0]).toEqual({
      id: 'p1',
      name: 'Vitamin D',
      category: 'supplement',
      strength: null,
      price: null,
      storeLink: null,
      status: 'active',
      stock: null,
      lastUsedAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });
    expect(rows.schedules[0]).toMatchObject({
      quantity: 1,
      startDate: null,
      endDate: null,
    });
    expect(rows.doses[0]).toMatchObject({
      state: 'pending',
      takenAt: null,
      takenQuantity: null,
      snoozedUntil: null,
    });
  });

  it('treats an explicit null in a defaulted column as the default', () => {
    // given
    const text = backupText({ products: [product({ status: null })] });

    // when
    const rows = rowsOf(text);

    // then
    expect(rows.products[0].status).toBe('active');
  });

  it.each(['schedules', 'doses', 'notes'])(
    'treats a missing %s table as empty',
    (table) => {
      // given
      const text = backupText({ [table]: undefined, doses: [] });

      // when
      const rows = rowsOf(text);

      // then
      expect(rows[table as 'schedules' | 'doses' | 'notes']).toEqual([]);
    },
  );

  it.each([
    ['products', 'name', product, 'products[0].name'],
    ['products', 'category', product, 'products[0].category'],
    ['products', 'createdAt', product, 'products[0].createdAt'],
    ['schedules', 'intervalDays', schedule, 'schedules[0].intervalDays'],
    ['schedules', 'timesOfDay', schedule, 'schedules[0].timesOfDay'],
    ['doses', 'plannedAt', dose, 'doses[0].plannedAt'],
    ['notes', 'body', note, 'notes[0].body'],
    ['notes', 'id', note, 'notes[0].id'],
  ])(
    'rejects a %s row without required column %s',
    (table, column, build, detail) => {
      // given
      const row = build();
      delete row[column];
      const text = backupText({ [table]: [row] });

      // when
      const error = errorOf(text);

      // then
      expect(error).toEqual({ code: 'invalidRow', detail });
    },
  );

  it('rejects null in a required column without a default', () => {
    // given
    const text = backupText({ products: [product({ name: null })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({ code: 'invalidRow', detail: 'products[0].name' });
  });

  it('ignores unknown fields in rows and at file level', () => {
    // given
    const text = backupText({
      futureTopLevel: { anything: true },
      products: [product({ futureColumn: 'x' })],
      schedules: [schedule({ futureColumn: 1 })],
      doses: [dose({ futureColumn: [] })],
      notes: [note({ futureColumn: null })],
      tags: [{ id: 't1' }],
    });

    // when
    const rows = rowsOf(text);

    // then
    expect(rows.products[0]).not.toHaveProperty('futureColumn');
    expect(rows.schedules[0]).not.toHaveProperty('futureColumn');
    expect(rows.doses[0]).not.toHaveProperty('futureColumn');
    expect(rows.notes[0]).not.toHaveProperty('futureColumn');
    expect(rows).not.toHaveProperty('tags');
  });
});

describe('parseBackup: file level errors', () => {
  it('rejects a newer format version with the version in detail', () => {
    // given
    const text = backupText({ version: BACKUP_FORMAT_VERSION + 1 });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({ code: 'newerVersion', detail: 'v2' });
  });

  it('reports a newer version before validating its rows', () => {
    // given
    const text = backupText({ version: 2, products: [{ unknown: 'shape' }] });

    // when
    const error = errorOf(text);

    // then
    expect(error.code).toBe('newerVersion');
  });

  it.each([
    ['missing', undefined],
    ['zero', 0],
    ['negative', -1],
    ['fractional', 1.5],
    ['a numeric string', '1'],
    ['null', null],
    ['an object', {}],
  ])('rejects a file whose version is %s as notBackup', (_name, version) => {
    // given
    const text = backupText({ version });

    // when
    const error = errorOf(text);

    // then
    expect(error.code).toBe('notBackup');
  });

  it('rejects a file without the products array as notBackup', () => {
    // given
    const text = backupText({ products: undefined });

    // when
    const error = errorOf(text);

    // then
    expect(error.code).toBe('notBackup');
  });

  it('rejects a file whose products is not an array as notBackup', () => {
    // given
    const text = backupText({ products: { p1: product() } });

    // when
    const error = errorOf(text);

    // then
    expect(error.code).toBe('notBackup');
  });

  it.each(['schedules', 'doses', 'notes'])(
    'rejects a %s table that is not an array and names the table',
    (table) => {
      // given
      const text = backupText({ [table]: 'nope' });

      // when
      const error = errorOf(text);

      // then
      expect(error).toEqual({ code: 'notBackup', detail: table });
    },
  );

  it.each([
    ['an array', '[]'],
    ['a string', '"backup"'],
    ['a number', '42'],
    ['null', 'null'],
  ])('rejects JSON that is %s as notBackup', (_name, text) => {
    // when
    const error = errorOf(text);

    // then
    expect(error.code).toBe('notBackup');
  });

  it.each([
    ['plain text', 'hello'],
    ['an empty string', ''],
    ['truncated JSON', '{"version": 1, "products": ['],
  ])('rejects %s as notJson', (_name, text) => {
    // when
    const error = errorOf(text);

    // then
    expect(error.code).toBe('notJson');
  });

  it.each([
    ['missing', undefined],
    ['another app', 'other'],
    ['differently cased', 'Pillminder'],
    ['null', null],
    ['a number', 1],
  ])('rejects a file whose app field is %s as notBackup', (_name, app) => {
    // given
    const text = backupText({ app });

    // when
    const error = errorOf(text);

    // then
    expect(error.code).toBe('notBackup');
  });
});

describe('parseBackup: invalid rows', () => {
  it('points at table, index and field of the offending row', () => {
    // given
    const text = backupText({
      products: [product(), product({ id: 'p2', name: 42 })],
    });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({ code: 'invalidRow', detail: 'products[1].name' });
  });

  it.each([
    ['a number', 1],
    ['a string', 'row'],
    ['null', null],
    ['an array', []],
  ])('rejects a row that is %s', (_name, row) => {
    // given
    const text = backupText({ notes: [row] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({ code: 'invalidRow', detail: 'notes[0].(row)' });
  });

  it('rejects a wrong type for a text column', () => {
    // given
    const text = backupText({ products: [product({ id: 7 })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({ code: 'invalidRow', detail: 'products[0].id' });
  });

  it.each([
    ['a string', '5'],
    ['a fraction', 1.5],
    ['a boolean', true],
  ])('rejects %s in an integer column', (_name, price) => {
    // given
    const text = backupText({ products: [product({ price })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({ code: 'invalidRow', detail: 'products[0].price' });
  });

  it('rejects an unknown dose state', () => {
    // given
    const text = backupText({ doses: [dose({ state: 'missed' })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({ code: 'invalidRow', detail: 'doses[0].state' });
  });

  it.each([
    ['an unparsable string', 'yesterday'],
    ['an object', {}],
    ['a boolean', true],
  ])('rejects %s as a date', (_name, plannedAt) => {
    // given
    const text = backupText({ doses: [dose({ plannedAt })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({ code: 'invalidRow', detail: 'doses[0].plannedAt' });
  });

  it('rejects an invalid optional date', () => {
    // given
    const text = backupText({
      schedules: [schedule({ endDate: 'not-a-date' })],
    });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({
      code: 'invalidRow',
      detail: 'schedules[0].endDate',
    });
  });

  it('accepts a date given as an epoch milliseconds number', () => {
    // given
    const text = backupText({
      products: [product({ lastUsedAt: 1769904000000 })],
    });

    // when
    const rows = rowsOf(text);

    // then
    expect(rows.products[0].lastUsedAt).toEqual(new Date(1769904000000));
  });

  it.each([
    ['not a string', 800],
    ['no colon', '0800'],
    ['letters', 'ab:cd'],
    ['a single digit minutes', '8:5'],
    ['seconds', '08:00:00'],
    ['an empty string', ''],
  ])('rejects a time of day that is %s', (_name, time) => {
    // given
    const text = backupText({ schedules: [schedule({ timesOfDay: [time] })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({
      code: 'invalidRow',
      detail: 'schedules[0].timesOfDay',
    });
  });

  it('rejects timesOfDay that is not an array', () => {
    // given
    const text = backupText({ schedules: [schedule({ timesOfDay: '08:00' })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({
      code: 'invalidRow',
      detail: 'schedules[0].timesOfDay',
    });
  });

  it('accepts one-digit hours and several times', () => {
    // given
    const text = backupText({
      schedules: [schedule({ timesOfDay: ['8:00', '21:45'] })],
    });

    // when
    const rows = rowsOf(text);

    // then
    expect(rows.schedules[0].timesOfDay).toEqual(['8:00', '21:45']);
  });

  it.each(['25:99', '24:00', '23:60', '8:60', '-1:00'])(
    'rejects the time of day %s',
    (time) => {
      // given
      const text = backupText({
        schedules: [schedule({ timesOfDay: ['08:00', time] })],
      });

      // when
      const error = errorOf(text);

      // then
      expect(error).toEqual({
        code: 'invalidRow',
        detail: 'schedules[0].timesOfDay',
      });
    },
  );

  it.each(['00:00', '23:59', '0:00', '9:05'])(
    'accepts the boundary time of day %s',
    (time) => {
      // given
      const text = backupText({
        schedules: [schedule({ timesOfDay: [time] })],
      });

      // when
      const rows = rowsOf(text);

      // then
      expect(rows.schedules[0].timesOfDay).toEqual([time]);
    },
  );

  it.each([
    ['empty', ''],
    ['whitespace only', '   '],
  ])('rejects a product category that is %s', (_name, category) => {
    // given
    const text = backupText({ products: [product({ category })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({
      code: 'invalidRow',
      detail: 'products[0].category',
    });
  });
});

describe('parseBackup: relations', () => {
  it('accepts a consistent file', () => {
    // when
    const result = parseBackup(backupText());

    // then
    expect(result.ok).toBe(true);
  });

  it('reports a schedule pointing at a missing product', () => {
    // given
    const text = backupText({
      schedules: [schedule(), schedule({ id: 's2', productId: 'ghost' })],
    });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({
      code: 'brokenReference',
      detail: 'schedules[1].productId',
    });
  });

  it('reports a dose pointing at a missing product', () => {
    // given
    const text = backupText({ doses: [dose({ productId: 'ghost' })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({
      code: 'brokenReference',
      detail: 'doses[0].productId',
    });
  });

  it('reports a dose pointing at a missing schedule', () => {
    // given
    const text = backupText({ doses: [dose({ scheduleId: 'ghost' })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({
      code: 'brokenReference',
      detail: 'doses[0].scheduleId',
    });
  });

  it('reports a note pointing at a missing product', () => {
    // given
    const text = backupText({ notes: [note({ productId: 'ghost' })] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({
      code: 'brokenReference',
      detail: 'notes[0].productId',
    });
  });

  it('reports schedules and doses left behind when products is empty', () => {
    // given
    const text = backupText({ products: [], notes: [] });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({
      code: 'brokenReference',
      detail: 'schedules[0].productId',
    });
  });

  it.each([
    ['products', { products: [product(), product({ name: 'Other' })] }],
    ['schedules', { schedules: [schedule(), schedule()] }],
    [
      'doses',
      {
        doses: [dose(), dose({ plannedAt: '2026-02-02T08:00:00.000Z' })],
      },
    ],
    ['notes', { notes: [note(), note({ body: 'Other' })] }],
  ])('rejects a duplicate id in %s', (table, overrides) => {
    // given
    const text = backupText(overrides);

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({ code: 'duplicateId', detail: table });
  });

  it('allows the same id in different tables', () => {
    // given
    const text = backupText({
      schedules: [schedule({ id: 'x' })],
      doses: [dose({ id: 'x', scheduleId: 'x' })],
      notes: [note({ id: 'x' })],
    });

    // when
    const result = parseBackup(text);

    // then
    expect(result.ok).toBe(true);
  });

  it('rejects two doses of one schedule planned at the same time', () => {
    // given
    const text = backupText({
      doses: [dose(), dose({ id: 'd2', plannedAt: PLANNED_AT })],
    });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({ code: 'duplicateSlot', detail: 'doses' });
  });

  it('treats different spellings of the same instant as one slot', () => {
    // given
    const text = backupText({
      doses: [
        dose({ plannedAt: '2026-02-01T08:00:00.000Z' }),
        dose({ id: 'd2', plannedAt: '2026-02-01T09:00:00+01:00' }),
      ],
    });

    // when
    const error = errorOf(text);

    // then
    expect(error.code).toBe('duplicateSlot');
  });

  it('allows the same planned time for different schedules', () => {
    // given
    const text = backupText({
      schedules: [schedule(), schedule({ id: 's2' })],
      doses: [dose(), dose({ id: 'd2', scheduleId: 's2' })],
    });

    // when
    const result = parseBackup(text);

    // then
    expect(result.ok).toBe(true);
  });

  it('allows different planned times for one schedule', () => {
    // given
    const text = backupText({
      doses: [
        dose(),
        dose({ id: 'd2', plannedAt: '2026-02-02T08:00:00.000Z' }),
      ],
    });

    // when
    const result = parseBackup(text);

    // then
    expect(result.ok).toBe(true);
  });

  it('reports a duplicate id before a broken reference', () => {
    // given
    const text = backupText({
      schedules: [schedule(), schedule({ productId: 'ghost' })],
    });

    // when
    const error = errorOf(text);

    // then
    expect(error.code).toBe('duplicateId');
  });

  it('rejects a dose whose product differs from its schedule product', () => {
    // given
    const text = backupText({
      products: [product(), product({ id: 'p2', name: 'Other' })],
      doses: [
        dose(),
        dose({
          id: 'd2',
          productId: 'p2',
          plannedAt: '2026-02-02T08:00:00.000Z',
        }),
      ],
    });

    // when
    const error = errorOf(text);

    // then
    expect(error).toEqual({
      code: 'productMismatch',
      detail: 'doses[1].productId',
    });
  });
});
