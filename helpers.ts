import { _ } from './constants';
import { BBA, toV, to_ } from './types';

export function isEmpty<T>(v: T): v is to_<T> {
  return v === _;
}

export function isNotEmpty<T>(v: T): v is toV<T> {
  return v !== _;
}

export function castToBBA<L, R>(
  lr: [unknown, unknown]
): asserts lr is BBA<L, R> {
  // TODO: check l is L and r is R

  const [l, r] = lr;

  if(
    (isEmpty   (l) && isNotEmpty(r)) ||
    (isNotEmpty(l) && isEmpty   (r)) ||
    (isNotEmpty(l) && isNotEmpty(r))
  ) return;

  throw new Error(`What the actual fuck??? lr is ${lr}`);
}
