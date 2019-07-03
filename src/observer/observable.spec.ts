import Observable from '../../src/observer/observable';

describe('Observable', () => {
  function createMockObserver() {
    return {
      evaluate: jest.fn(),
      update: jest.fn(),
    } as any;
  }

  describe('value', () => {
    it('gets set via the constructor', () => {
      const observable = new Observable('test');

      expect(observable.value).toBe('test');
    });

    it('cannot be set directly', () => {
      const observable = new Observable(43);

      try {
        // @ts-ignore
        observable.value = 99;
        fail('able to set observable value');
      } catch (ex) {
        expect(ex).toBeDefined();
      }

      expect(observable.value).toBe(43);
    });

    it('is a getter', () => {
      const observable = new Observable([1, 2, 3]);

      const propertyDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(observable), 'value');

      expect(propertyDescriptor).toBeDefined();
      expect(propertyDescriptor!.get).toBeDefined();
    });
  });

  describe('observe', () => {
    it('adds a computed observable', () => {
      const observable = new Observable(15);

      const mockObserver = createMockObserver();

      observable.observe(mockObserver);

      // @ts-ignore
      observable._updateObservers();

      expect(mockObserver.update).toBeCalledTimes(1);
    });

    it('does not add duplicate observables', () => {
      const observable = new Observable(true);

      const mockObserver = createMockObserver();

      observable.observe(mockObserver);
      observable.observe(mockObserver);

      // @ts-ignore
      observable._updateObservers();

      expect(mockObserver.update).toBeCalledTimes(1);
    });
  });

  describe('unobserve', () => {
    it('removes a observer', () => {
      const observable = new Observable(false);

      const observer1 = createMockObserver();
      const observer2 = createMockObserver();

      observable.observe(observer1);
      observable.observe(observer2);

      // @ts-ignore
      observable._updateObservers();

      expect(observer1.update).toBeCalledTimes(1);
      expect(observer2.update).toBeCalledTimes(1);

      observer1.update.mockClear();
      observer2.update.mockClear();

      observable.unobserve(observer1);

      // @ts-ignore
      observable._updateObservers();

      expect(observer1.update).toBeCalledTimes(0);
      expect(observer2.update).toBeCalledTimes(1);
    });

    it('does not cause an issue when trying to remove an observer that does not exist', () => {
      const observable = new Observable('value');

      const observer1 = createMockObserver();
      const observer2 = createMockObserver();

      observable.observe(observer1);
      observable.observe(observer2);

      // @ts-ignore
      observable._updateObservers();

      expect(observer1.update).toBeCalledTimes(1);
      expect(observer2.update).toBeCalledTimes(1);

      observer1.update.mockClear();
      observer2.update.mockClear();

      observable.unobserve(observer1);
      observable.unobserve(observer1);

      // @ts-ignore
      observable._updateObservers();

      expect(observer1.update).toBeCalledTimes(0);
      expect(observer2.update).toBeCalledTimes(1);
    });
  });

  describe('watch', () => {
    it('adds a watcher to the watcher list', () => {
      const observable = new Observable(55);
      const spy = jest.fn();

      observable.watch(spy);

      // @ts-ignore
      observable._invokeWatchers(60, 55);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(60, 55);
    });

    it('does not add duplicate watchers', () => {
      const observable = new Observable(true);
      const spy = jest.fn();

      observable.watch(spy);
      observable.watch(spy);

      // @ts-ignore
      observable._invokeWatchers(false, true);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(false, true);
    });
  });

  describe('unwatch', () => {
    it('removes a watcher', () => {
      const observable = new Observable('test');
      const spy1 = jest.fn();
      const spy2 = jest.fn();

      observable.watch(spy1);
      observable.watch(spy2);

      // @ts-ignore
      observable._invokeWatchers('new value', 'test');

      expect(spy1).toBeCalledTimes(1);
      expect(spy1).toBeCalledWith('new value', 'test');

      expect(spy2).toBeCalledTimes(1);
      expect(spy2).toBeCalledWith('new value', 'test');

      spy1.mockClear();
      spy2.mockClear();

      observable.unwatch(spy1);

      // @ts-ignore
      observable._invokeWatchers('another new value', 'new value');

      expect(spy1).toBeCalledTimes(0);

      expect(spy2).toBeCalledTimes(1);
      expect(spy2).toBeCalledWith('another new value', 'new value');
    });

    it('does not cause an issue when trying to remove a watcher that does not exist', () => {
      const observable = new Observable('test');
      const spy1 = jest.fn();
      const spy2 = jest.fn();

      observable.watch(spy1);
      observable.watch(spy2);

      // @ts-ignore
      observable._invokeWatchers('new value', 'test');

      expect(spy1).toBeCalledTimes(1);
      expect(spy1).toBeCalledWith('new value', 'test');

      expect(spy2).toBeCalledTimes(1);
      expect(spy2).toBeCalledWith('new value', 'test');

      spy1.mockClear();
      spy2.mockClear();

      observable.unwatch(spy1);
      observable.unwatch(spy1);

      // @ts-ignore
      observable._invokeWatchers('another new value', 'new value');

      expect(spy1).toBeCalledTimes(0);

      expect(spy2).toBeCalledTimes(1);
      expect(spy2).toBeCalledWith('another new value', 'new value');
    });
  });

  describe('update', () => {
    it('can be used to update the observable value', () => {
      const observable = new Observable([1, 2, 3]);

      expect(observable.value).toEqual([1, 2, 3]);

      observable.update([5, 6, 7]);

      expect(observable.value).toEqual([5, 6, 7]);
    });

    it('by default notifies observers and watchers of changes', () => {
      const observable = new Observable(99);

      // @ts-ignore
      observable._updateObservers = jest.fn(observable._updateObservers);
      // @ts-ignore
      observable._invokeWatchers = jest.fn(observable._invokeWatchers);

      observable.update(300);

      // @ts-ignore
      expect(observable._updateObservers).toBeCalledTimes(1);
      // @ts-ignore
      expect(observable._invokeWatchers).toBeCalledTimes(1);
    });
  });
});
