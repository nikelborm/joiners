import test, { describe } from 'node:test';
import { deepStrictEqual } from 'node:assert/strict';

const _ = Symbol('emptiness');
type _ = typeof _;

type UnSet<T> = T extends Set<infer U> ? U : never;


const brandA = Symbol('A');
const brandB = Symbol('B');

type brandA = typeof brandA;
type brandB = typeof brandB;

type A = {
  brand: brandA;
  id: number;
  v: number;
};

type B = {
  brand: brandB;
  id: number;
  v: number;
};

const FilledA = new Set<A>([
  { brand: brandA, id: 1, v: 6 },
  { brand: brandA, id: 2, v: 6 },
  { brand: brandA, id: 3, v: 7 },
  { brand: brandA, id: 4, v: 7 },
  { brand: brandA, id: 5, v: 9 }
]);

const FilledB = new Set<B>([
  { brand: brandB, id: 1, v: 7  },
  { brand: brandB, id: 2, v: 7  },
  { brand: brandB, id: 3, v: 8  },
  { brand: brandB, id: 4, v: 8  },
  { brand: brandB, id: 5, v: 10 }
]);

const EmptyA = new Set([]);

const EmptyB = new Set([]);



const join = (a, b, c) => new Set([]);

type LNA<L, R> = [L, _];
type NRA<L, R> = [_, R];

describe('Filled A join empty B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<A, B>));
    const result = join(FilledA, EmptyB, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = join(FilledA, EmptyB, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<A, B>));
    const result = join(FilledA, EmptyB, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = join(FilledA, EmptyB, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = join(FilledA, EmptyB, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<A, B>));
    const result = join(FilledA, EmptyB, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([]);
    const result = join(FilledA, EmptyB, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<A, B>));
    const result = join(FilledA, EmptyB, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})


describe('Empty A join filled B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, FilledB, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<A, B>));
    const result = join(EmptyA, FilledB, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<A, B>));
    const result = join(EmptyA, FilledB, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, FilledB, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, FilledB, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, FilledB, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<A, B>));
    const result = join(EmptyA, FilledB, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<A, B>));
    const result = join(EmptyA, FilledB, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})


describe('Empty A join empty B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, EmptyB, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, EmptyB, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, EmptyB, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, EmptyB, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, EmptyB, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, EmptyB, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, EmptyB, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([]);
    const result = join(EmptyA, EmptyB, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})


describe('Filled A join filled B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([
      [ { brand: brandA, id: 1, v: 6 }, _                              ],
      [ { brand: brandA, id: 2, v: 6 }, _                              ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 5, v: 9 }, _                              ],
    ]);
    const result = join(FilledA, FilledB, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v:  7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v:  7 } ],
      [ _                             , { brand: brandB, id: 3, v:  8 } ],
      [ _                             , { brand: brandB, id: 4, v:  8 } ],
      [ _                             , { brand: brandB, id: 5, v: 10 } ],
    ]);
    const result = join(FilledA, FilledB, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([
      [ { brand: brandA, id: 1, v: 6 }, _                               ],
      [ { brand: brandA, id: 2, v: 6 }, _                               ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7  } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7  } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7  } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7  } ],
      [ _                             , { brand: brandB, id: 3, v: 8  } ],
      [ _                             , { brand: brandB, id: 4, v: 8  } ],
      [ { brand: brandA, id: 5, v: 9 }, _                               ],
      [ _                             , { brand: brandB, id: 5, v: 10 } ],
    ]);
    const result = join(FilledA, FilledB, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
    ]);
    const result = join(FilledA, FilledB, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([
      [ { brand: brandA, id: 1, v: 6 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 1, v: 6 }, { brand: brandB, id: 2, v:  7 } ],
      [ { brand: brandA, id: 1, v: 6 }, { brand: brandB, id: 3, v:  8 } ],
      [ { brand: brandA, id: 1, v: 6 }, { brand: brandB, id: 4, v:  8 } ],
      [ { brand: brandA, id: 1, v: 6 }, { brand: brandB, id: 5, v: 10 } ],
      [ { brand: brandA, id: 2, v: 6 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 2, v: 6 }, { brand: brandB, id: 2, v:  7 } ],
      [ { brand: brandA, id: 2, v: 6 }, { brand: brandB, id: 3, v:  8 } ],
      [ { brand: brandA, id: 2, v: 6 }, { brand: brandB, id: 4, v:  8 } ],
      [ { brand: brandA, id: 2, v: 6 }, { brand: brandB, id: 5, v: 10 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v:  7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 3, v:  8 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 4, v:  8 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 5, v: 10 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v:  7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 3, v:  8 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 4, v:  8 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 5, v: 10 } ],
      [ { brand: brandA, id: 5, v: 9 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 5, v: 9 }, { brand: brandB, id: 2, v:  7 } ],
      [ { brand: brandA, id: 5, v: 9 }, { brand: brandB, id: 3, v:  8 } ],
      [ { brand: brandA, id: 5, v: 9 }, { brand: brandB, id: 4, v:  8 } ],
      [ { brand: brandA, id: 5, v: 9 }, { brand: brandB, id: 5, v: 10 } ],
    ]);
    const result = join(FilledA, FilledB, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([
      [ { brand: brandA, id: 1, v: 6 }, _ ],
      [ { brand: brandA, id: 2, v: 6 }, _ ],
      [ { brand: brandA, id: 5, v: 9 }, _ ],
    ]);
    const result = join(FilledA, FilledB, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([
      [_, { brand: brandB, id: 3, v:  8 }],
      [_, { brand: brandB, id: 4, v:  8 }],
      [_, { brand: brandB, id: 5, v: 10 }],
    ]);
    const result = join(FilledA, FilledB, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([
      [ { brand: brandA, id: 1, v: 6 }, _                               ],
      [ { brand: brandA, id: 2, v: 6 }, _                               ],
      [ _                             , { brand: brandB, id: 3, v: 8  } ],
      [ _                             , { brand: brandB, id: 4, v: 8  } ],
      [ { brand: brandA, id: 5, v: 9 }, _                               ],
      [ _                             , { brand: brandB, id: 5, v: 10 } ],
    ]);
    const result = join(FilledA, FilledB, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})
