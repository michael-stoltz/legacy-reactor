import { logError } from '../util';
import Observable, { shouldObservablesUpdate } from './observable';
import { ComputedFunction } from './types';

/**
 * Exception thrown when a [[ComputedFunction]] produces an error.
 */
const COMPUTED_FUNCTION_EXCEPTION: string = 'Computed function failed to evaluate.';

/**
 * A [[ComputedObservable]] is an [[Observable]] that contains a [[ComputedFunction]].
 *
 * The intention of a computed function is to use it to evaluate [[Observable.value]] instead of setting it directly.
 *
 * Similarly to [[Observable]]s a [[ComputedObservable]] can also be watched and observed.
 *
 * @typeparam T - Any valid javascript type that is returned from the [[ComputedObservable._computedFunction]] function.
 */
export default class ComputedObservable<T> extends Observable<any> {
  /**
   * Function that should be used to evaluate this object's [[Observable.value]].
   */
  private _computedFunction: ComputedFunction<T>;

  /**
   * @param computedFunction - Function that should be used to evaluate this object's [[Observable.value]].
   */
  constructor(computedFunction: ComputedFunction<T>) {
    super(undefined!);
    this._computedFunction = computedFunction;
  }

  /**
   * Safely evaluate the return value of [[_computedFunction]].
   *
   * Observables updates are turned off to ensure computed observables have no side effects.
   */
  public evaluate(): T | undefined {
    try {
      shouldObservablesUpdate(false);
      const value = this._computedFunction();
      return value;
    } catch (exception) {
      logError(COMPUTED_FUNCTION_EXCEPTION, exception);
    } finally {
      shouldObservablesUpdate(true);
    }
    return undefined;
  }
}
