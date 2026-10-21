import {
  deleteIntakeRow,
  insertIntakeRow,
  updateIntakeRow,
} from '../intake-repository';
import { editIntake, removeIntake, takeNow } from '../intake-service';

jest.mock('../intake-repository', () => ({
  deleteIntakeRow: jest.fn(),
  insertIntakeRow: jest.fn(),
  intakesBetweenQuery: jest.fn(),
  productIntakesQuery: jest.fn(),
  updateIntakeRow: jest.fn(),
}));

const NOW = new Date(2026, 9, 22, 14, 20);

describe('takeNow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(insertIntakeRow).mockReturnValue('intake-1');
  });

  it('records one unit at the given time and returns the intake id', () => {
    // when
    const id = takeNow('product-1', NOW);

    // then
    expect(id).toBe('intake-1');
    expect(insertIntakeRow).toHaveBeenCalledWith('product-1', NOW, 1);
  });

  it('rethrows a failed write', () => {
    // given
    jest.mocked(insertIntakeRow).mockImplementation(() => {
      throw new Error('disk full');
    });

    // when
    const record = () => takeNow('product-1', NOW);

    // then
    expect(record).toThrow('disk full');
  });
});

describe('editIntake', () => {
  beforeEach(jest.clearAllMocks);

  it('saves a corrected quantity and time', () => {
    // given
    const edit = { quantity: 2, takenAt: NOW };

    // when
    editIntake('intake-1', edit);

    // then
    expect(updateIntakeRow).toHaveBeenCalledWith('intake-1', edit);
  });

  it.each([0, -1, 1.5])(
    'rejects the quantity %p without writing',
    (quantity) => {
      // when
      const save = () => editIntake('intake-1', { quantity, takenAt: NOW });

      // then
      expect(save).toThrow('Invalid intake quantity');
      expect(updateIntakeRow).not.toHaveBeenCalled();
    },
  );
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
