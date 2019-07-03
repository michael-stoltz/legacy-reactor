/**
 * Module with functions that emulate [vue's](https://vuejs.org/) reactivity mechanism.
 */

/** @ignore */
import { isObject, isPlainObject, prototypeAugment } from '../util';
import { arrayMethods } from './array';
import ComputedObservable from './computed-observable';
import Observable from './observable';
import {
  ATTACHED_OBSERVABLE_KEY,
  ComputedFunction,
  IObservable,
  IObservableReference,
  IWatchable,
  ObservedData,
  UNWATCH_FUNCTION_KEY,
  WATCH_FUNCTION_KEY,
  WatcherFunction,
} from './types';

/**
 * The [[IObservable]] currently being created and evaluated.
 *
 * This property is globally unique because only one [[IObservable]] can be evaluated at a time.
 */
let currentEvaluatingObservable: IObservable<any> | undefined;

/**
 * Takes a data object and recursively makes all its properties reactive.
 *
 * ## Computed Properties
 *
 * Function definitions within the data object are treated as computed property definitions.
 *
 * ```typescript
 * const observed = observe({
 *  price: 55,
 *  quantity: 10,
 *  total() {
 *    return this.price * this.quantity;
 *  }
 * });
 *
 * console.log(observed); // output: { price: 55, quantity: 10, total: 550 }
 * ```
 *
 * ## Watchers
 *
 * Watchers are functions that get run when a data change occurs for a property.
 *
 * ```typescript
 * const observed = observe({
 *  price: 55,
 *  quantity: 10,
 *  total() {
 *    return this.price * this.quantity;
 *  }
 * });
 *
 * observed.$watch('total', (value, oldValue) => {
 *  console.log(value, oldValue);
 * });
 *
 * observed.price = 100; // output: 1000 550
 * ```
 *
 * @param data - Object to process.
 *
 * @typeparam T - Plain javascript object.
 */
export function observe<T extends object>(data: T): ObservedData<T> & IWatchable {
  if (isPlainObject(data)) {
    Object.defineProperty(data, WATCH_FUNCTION_KEY, {
      value: <U>(path: string, watcher: WatcherFunction<U>) => {
        modifyPropertyWatcherList(data, path, watcher, 'add');
      },
    });

    Object.defineProperty(data, UNWATCH_FUNCTION_KEY, {
      value: <U>(path: string, watcher: WatcherFunction<U>) => {
        modifyPropertyWatcherList(data, path, watcher, 'remove');
      },
    });

    observeObject(data as T);
  } else {
    throw new Error('Parameter provided is not a plain javascript object.');
  }

  return data as ObservedData<T> & IWatchable;
}

/**
 * Iterate over a data object and make all its properties reactive.
 *
 * @param data - Data object.
 * @param observable - Observable for the data object
 *
 * @typeparam T - Any object type: array, object, class etc.
 */
export function observeObject<T extends object>(data: T, observable?: IObservable<T>): void {
  if (isObject(data)) {
    let shouldSeal = true;

    if (Array.isArray(data)) {
      shouldSeal = false;
      if (!(data as IObservableReference<T>).__observable__) {
        Object.defineProperty(data, ATTACHED_OBSERVABLE_KEY, { value: observable });
        prototypeAugment((data as unknown) as object, arrayMethods);
      }
    }

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        let value = data[key];
        let valueObservable: IObservable<typeof value>;

        if (typeof value === 'function') {
          value = value.bind(data);
          valueObservable = new ComputedObservable((value as unknown) as ComputedFunction<typeof value>);

          currentEvaluatingObservable = valueObservable;
          const evaluatedObservableValue = (valueObservable as ComputedObservable<T>).evaluate()!;
          valueObservable.update((evaluatedObservableValue as unknown) as T[Extract<keyof T, string>]);
          currentEvaluatingObservable = undefined;
        } else {
          valueObservable = new Observable(value);

          observeObject((value as unknown) as T, (valueObservable as unknown) as IObservable<T>);
        }

        defineReactiveProperty(data, key, valueObservable);
      }
    }

    if (shouldSeal) {
      Object.seal(data);
    }
  }
}

/**
 * Creates a reactive property on a specified object.
 *
 * For a property to be considered reactive it needs to be proxied with a getter/setter and also have an associated [[Observable]] instance.
 *
 * ### Reactive properties
 * ```typescript
 * const obj = {};
 * defineReactiveProperty(obj, 'number', new Observable(99));
 *
 * // Note that even though the value is proxied you can still access it as you normally access properties.
 * console.log(obj.number) // output: 99
 * obj.number = 105;
 * console.log(obj.number) // output: 105
 * ```
 *
 * @param obj - Object on which to create the reactive property.
 * @param key - Key for the new property.
 * @param observable - [[Observable]] instance that stores the value of the reactive property.
 *
 * @typeparam T - Any valid javascript value.
 */
export function defineReactiveProperty<T>(obj: object, key: string | number, observable: IObservable<T>) {
  Object.defineProperty(obj, key, {
    get() {
      if (arguments[0] === true) {
        return observable;
      } else {
        if (currentEvaluatingObservable) {
          observable.observe(currentEvaluatingObservable as ComputedObservable<T>);
        }
        return observable.value;
      }
    },
    // prettier-ignore
    set: observable instanceof ComputedObservable ? () => { /* */ } : function (newValue: T) {
      if (newValue !== observable.value) {
        observeObject(newValue as unknown as object, observable as unknown as IObservable<object>);
        observable.update(newValue);
      }
    },
    enumerable: true,
  });
}

/**
 * Extracts the [[Observable]] instance from a property on an object.
 *
 * This function will only work if the [[defineReactiveProperty]] method was used to define that property.
 *
 * @param object - Object where you have a reactive property.
 * @param key - Key of the property that has an observable instance.
 */
export function extractObservableFromProperty(object: object, key: string | number): IObservable<any> | undefined {
  const propertyDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(object, key);
  if (propertyDescriptor && propertyDescriptor.get) {
    return (propertyDescriptor.get as any)(true);
  }
  return undefined;
}

/**
 * Traverses a string path for an object to find the property it is pointing to.
 *
 * Once the property is found a callback function is called passing in the property's parent object and the property name.
 *
 * ```typescript
 * const data = {
 *   nested: {
 *    anotherNested: {
 *      property: 'value',
 *      number: 66
 *    }
 *   }
 * };
 *
 * navigateToPropertyPath(data, 'nested.anotherNested.property', (obj, property) => {
 *  console.log(obj, property);
 * });
 *
 * // output: {property: 'value', number: 66} property
 * ```
 *
 * @param obj - Object to traverse.
 * @param path - Path to a property on the obj.
 * @param callback - Callback to be called when the property is found.
 */
export function navigateToPropertyPath<T extends object>(obj: T, path: string, callback: (obj: object, key: string) => void): void {
  const properties = path.split('.');
  let property!: string;

  for (let i = 0; i < properties.length; i++) {
    if (obj.hasOwnProperty(properties[i])) {
      property = properties[i];
      if (i !== properties.length - 1) {
        obj = obj[property as keyof object];
      }
    } else {
      throw new Error(`Object does not contain the property with path ${path}`);
    }
  }

  callback(obj, property);
}

/**
 * Finds the observable attached to a property within observed data and adds or removes a watcher from its watcher list.
 *
 * @param observedData - Object containing observed data created by [[observe]].
 * @param path - Path to the property in an object.
 * @param watcher - [[WatcherFunction]].
 * @param operation - Specifies what to do with the [[WatcherFunction]]
 */
function modifyPropertyWatcherList<T extends object>(observedData: T, path: string, watcher: WatcherFunction<any>, operation: 'add' | 'remove') {
  navigateToPropertyPath(observedData, path, (obj, property) => {
    const observable = extractObservableFromProperty(obj, property);

    if (observable) {
      if (operation === 'add') {
        observable.watch(watcher);
      } else if (operation === 'remove') {
        observable.unwatch(watcher);
      }
    } else {
      throw new Error('Property is not an observable property.');
    }
  });
}
