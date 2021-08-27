import { MinuteTimePipe } from './pipe.module';

describe('MinuteTimePipe', () => {
  it('create an instance', () => {
    const pipe = new MinuteTimePipe();
    expect(pipe).toBeTruthy();
  });
});
