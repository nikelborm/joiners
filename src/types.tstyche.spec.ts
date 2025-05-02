import { expect } from "tstyche";

import type {
  FullExclusiveJoin,
  FullJoin,
  InnerJoin,
  IsLNA,
  LeftExclusiveJoin,
  LeftJoin,
  RightExclusiveJoin,
  RightJoin,
} from './types.ts';
import type { _ } from './constants.ts';

const A = Symbol('A');
const B = Symbol('B');
type A = typeof A;
type B = typeof B;



expect<LeftExclusiveJoin <A, B, 'A'>>().type.toBe<[A, _]>();
expect<InnerJoin         <A, B, 'A'>>().type.toBe<[A, B]>();
expect<RightExclusiveJoin<A, B, 'A'>>().type.toBe<[_, B]>();
expect<LeftJoin          <A, B, 'A'>>().type.toBe<[A, B] | [A, _]>();
expect<RightJoin         <A, B, 'A'>>().type.toBe<[A, B] | [_, B]>();
expect<FullExclusiveJoin <A, B, 'A'>>().type.toBe<[A, _] | [_, B]>();
expect<FullJoin          <A, B, 'A'>>().type.toBe<[A, _] | [_, B] | [A, B]>();


expect<LeftExclusiveJoin <A, B, 'C'>>().type.toBe<[A, _]>();
expect<InnerJoin         <A, B, 'C'>>().type.toBe<[A, B]>();
expect<RightExclusiveJoin<A, B, 'C'>>().type.toBe<[_, B]>();
expect<LeftJoin          <A, B, 'C'>>().type.toBe<[A    , B | _]>();
expect<RightJoin         <A, B, 'C'>>().type.toBe<[A | _, B    ]>();
expect<FullExclusiveJoin <A, B, 'C'>>().type.toBe<[A    , _] | [_, B    ]>();
expect<FullJoin          <A, B, 'C'>>().type.toBe<[A | _, B] | [A, B | _]>();


expect<LeftExclusiveJoin <A, B, 'E'>>().type.toBe< [A, _]>();
expect<InnerJoin         <A, B, 'E'>>().type.toBe< [A, B]>();
expect<RightExclusiveJoin<A, B, 'E'>>().type.toBe< [_, B]>();
expect<LeftJoin          <A, B, 'E'>>().type.toBe< [A, B] | [A, _] | [A,     B | _]>();
expect<RightJoin         <A, B, 'E'>>().type.toBe< [A, B] | [_, B] | [A | _, B    ]>();
expect<FullExclusiveJoin <A, B, 'E'>>().type.toBe< [A, _] | [_, B]>();
expect<FullJoin<A, B, 'E'>>().type.toBe<
  | [A, B]
  | [A, _]
  | [_, B]
  | [A | _, B    ]
  | [A,     B | _]
>();












expect<IsLNA<[A, _]>,  >

















// TODO: add type assertions not only for generics, but to a function call returns
