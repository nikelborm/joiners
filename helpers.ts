import { _ } from './constants';
import { BBA, ToV, To_ } from './types';

export function isEmpty<T>(v: T): v is To_<T> {
  return v === _;
}

export function isNotEmpty<T>(v: T): v is ToV<T> {
  return v !== _;
}

export function castToBBA<L, R>(
  lr: [unknown, unknown],
): asserts lr is BBA<L, R> {
  // TODO: check l is L and r is R?

  const [l, r] = lr;

  if (isEmpty(l) && isEmpty(r))
    throw new Error(
      `Error: What the actual fuck??? Failed to cast to BBA because left is empty and right is empty too.`,
    );
}
