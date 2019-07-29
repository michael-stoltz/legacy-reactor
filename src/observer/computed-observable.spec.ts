import mockConsole from 'console';
import ComputedObservable from '../../src/observer/computed-observable';
import Observable, { observableUpdatesEnabled } from '../../src/observer/observable';

global.console = mockConsole;
mockConsole.error = jest.fn();

describe('Computed Observable', () => {
  it('inherits from Observable', () => {
    expect(new ComputedObservable(() => 5)).toBeInstanceOf(Observable);
  });

  describe('evaluate', () => {
    it('evaluates the computed function passed into the constructor', () => {
      const computed = new ComputedObservable(() => 'value');

      expect(computed.evaluate()).toBe('value');
    });

    it('disables and then re-enables observable updates', () => {
      expect(observableUpdatesEnabled).toBe(true);
      const computed = new ComputedObservable(() => {
        expect(observableUpdatesEnabled).toBe(false);
        return 100;
      });

      computed.update(computed.evaluate());
      expect(observableUpdatesEnabled).toBe(true);
    });

    it('handles errors gracefully', () => {
      const computed = new ComputedObservable(() => {
        throw new Error('');
      });

      expect(computed.evaluate()).toBeUndefined();
    });
  });
});
