import { deleteIntakeRow, insertIntakeRow } from '../intake-repository';
import { removeIntake, takeNow } from '../intake-service';

jest.mock('../intake-repository', () => ({
  deleteIntakeRow: jest.fn(),
  insertIntakeRow: jest.fn(),
  intakesBetweenQuery: jest.fn(),
  productIntakesQuery: jest.fn(),
}));

const NOW = new Date(2026, 9, 22, 14, 20);

describe('takeNow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records one unit at the given time under the given id', () => {
    // when
    takeNow('intake-1', 'product-1', NOW);

    // then
    expect(insertIntakeRow).toHaveBeenCalledWith(
      'intake-1',
      'product-1',
      NOW,
      1,
    );
  });

  it('rethrows a failed write', () => {
    // given
    jest.mocked(insertIntakeRow).mockImplementation(() => {
      throw new Error('disk full');
    });

    // when
    const record = () => takeNow('intake-1', 'product-1', NOW);

    // then
    expect(record).toThrow('disk full');
  });
});

describe('removeIntake', () => {
  beforeEach(jest.clearAllMocks);

  it('deletes the intake', () => {
    // when
    removeIntake('intake-1');

    // then
    expect(deleteIntakeRow).toHaveBeenCalledWith('intake-1');
  });
});
