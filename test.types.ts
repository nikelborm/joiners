import { Equals, assert } from 'tsafe';
import type {
  FullExclusiveJoin,
  FullJoin,
  InnerJoin,
  LeftExclusiveJoin,
  LeftJoin,
  RightExclusiveJoin,
  RightJoin,
  _
} from './types';

const A = Symbol('A');
const B = Symbol('B');
type A = typeof A;
type B = typeof B;

assert<Equals<LeftExclusiveJoin <A, B>,  [A, _]>>();
assert<Equals<InnerJoin         <A, B>,  [A, B]>>();
assert<Equals<RightExclusiveJoin<A, B>,  [_, B]>>();
assert<Equals<LeftJoin          <A, B>,  [A, B] | [A, _] | [A,     B | _]>>();
assert<Equals<RightJoin         <A, B>,  [A, B] | [_, B] | [A | _, B    ]>>();
assert<Equals<FullExclusiveJoin <A, B>,  [A, _] | [_, B]>>();
assert<Equals<FullJoin<A, B>,
  | [A, B]
  | [A, _]
  | [_, B]
  | [A | _, B    ]
  | [A,     B | _]
>>();


// TODO: add type assertions not only for generics, but to a function call returns
