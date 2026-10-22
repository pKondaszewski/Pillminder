import { runReportingErrors } from '../run-reporting-errors';

describe('runReportingErrors', () => {
  it('runs the action when there is no onSuccess', async () => {
    // given
    const action = jest.fn().mockResolvedValue('done');
    const onError = jest.fn();

    // when
    await runReportingErrors(action, undefined, onError);

    // then
    expect(action).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('passes the action result to onSuccess', async () => {
    // given
    const onSuccess = jest.fn();

    // when
    await runReportingErrors(async () => 'done', onSuccess, jest.fn());

    // then
    expect(onSuccess).toHaveBeenCalledWith('done');
  });

  it('calls onError when the action fails', async () => {
    // given
    const onSuccess = jest.fn();
    const onError = jest.fn();

    // when
    await runReportingErrors(
      () => Promise.reject(new Error('boom')),
      onSuccess,
      onError,
    );

    // then
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
