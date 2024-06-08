import test, { describe } from 'node:test';
import { deepStrictEqual } from 'node:assert/strict';
import { joinGen } from '.';
import { _ } from './constants';
import { LNA, LRA, NRA } from './types';

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

const EmptyA = new Set<A>([]);

const EmptyB = new Set<B>([]);



const humanReadableJoinNameToEulerDiagramParts = {
  'left outer join'       : '110',
  'right outer join'      : '011',
  'full outer join'       : '111',
  'inner join'            : '010',
  'cross join'            : '010',
  'left outer anti join'  : '100',
  'right outer anti join' : '001',
  'full outer anti join'  : '101',
} as const

type humanReadableJoinNames = keyof typeof humanReadableJoinNameToEulerDiagramParts;

const joinDbRows = (left: Set<A>, right: Set<B>, joinType: humanReadableJoinNames) => {
  return join( left, right, joinType, ([l, r]) => l.v === r.v);
}

const joinNumbers = (left: Array<number>, right: Array<number>, joinType: humanReadableJoinNames) => {
  return join( left, right, joinType, ([l, r]) => l === r);
}

const join = <L,R>(left: Iterable<L>, right: Iterable<R>, joinType: humanReadableJoinNames, compare: (tuple: LRA<L, R>) => boolean,) => {
  return new Set(joinGen(
    left,
    right,
    joinType === 'cross join' ? () => true: compare,
    e => e,
    humanReadableJoinNameToEulerDiagramParts[joinType],
    'A'
  ));
}

describe('Filled with db rows A join empty B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<A, B>));
    const result = joinDbRows(FilledA, EmptyB, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinDbRows(FilledA, EmptyB, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<A, B>));
    const result = joinDbRows(FilledA, EmptyB, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinDbRows(FilledA, EmptyB, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = joinDbRows(FilledA, EmptyB, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<A, B>));
    const result = joinDbRows(FilledA, EmptyB, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([]);
    const result = joinDbRows(FilledA, EmptyB, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<A, B>));
    const result = joinDbRows(FilledA, EmptyB, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})


describe('Empty A join filled with db rows B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, FilledB, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<A, B>));
    const result = joinDbRows(EmptyA, FilledB, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<A, B>));
    const result = joinDbRows(EmptyA, FilledB, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, FilledB, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, FilledB, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, FilledB, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<A, B>));
    const result = joinDbRows(EmptyA, FilledB, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<A, B>));
    const result = joinDbRows(EmptyA, FilledB, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})


describe('Empty A join empty B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, EmptyB, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, EmptyB, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, EmptyB, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, EmptyB, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, EmptyB, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, EmptyB, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, EmptyB, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([]);
    const result = joinDbRows(EmptyA, EmptyB, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})


describe('Filled with db rows A join filled with db rows B', () => {
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
    const result = joinDbRows(FilledA, FilledB, 'left outer join');
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
    const result = joinDbRows(FilledA, FilledB, 'right outer join');
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
    const result = joinDbRows(FilledA, FilledB, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
    ]);
    const result = joinDbRows(FilledA, FilledB, 'inner join');
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
    const result = joinDbRows(FilledA, FilledB, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([
      [ { brand: brandA, id: 1, v: 6 }, _ ],
      [ { brand: brandA, id: 2, v: 6 }, _ ],
      [ { brand: brandA, id: 5, v: 9 }, _ ],
    ]);
    const result = joinDbRows(FilledA, FilledB, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([
      [_, { brand: brandB, id: 3, v:  8 }],
      [_, { brand: brandB, id: 4, v:  8 }],
      [_, { brand: brandB, id: 5, v: 10 }],
    ]);
    const result = joinDbRows(FilledA, FilledB, 'right outer anti join');
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
    const result = joinDbRows(FilledA, FilledB, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

const FilledA_Numbers = [6,6,7,7,9];
const FilledB_Numbers = [7 ,7 ,8 ,8 ,10];
const EmptyA_Numbers = [] as Array<number>;
const EmptyB_Numbers = [] as Array<number>;


describe('Filled with numbers A join empty B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([...FilledA_Numbers].map(e => [e, _] as LNA<number, number>));
    const result = joinNumbers(FilledA_Numbers, EmptyB_Numbers, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinNumbers(FilledA_Numbers, EmptyB_Numbers, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([...FilledA_Numbers].map(e => [e, _] as LNA<number, number>));
    const result = joinNumbers(FilledA_Numbers, EmptyB_Numbers, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinNumbers(FilledA_Numbers, EmptyB_Numbers, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = joinNumbers(FilledA_Numbers, EmptyB_Numbers, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([...FilledA_Numbers].map(e => [e, _] as LNA<number, number>));
    const result = joinNumbers(FilledA_Numbers, EmptyB_Numbers, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([]);
    const result = joinNumbers(FilledA_Numbers, EmptyB_Numbers, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([...FilledA_Numbers].map(e => [e, _] as LNA<number, number>));
    const result = joinNumbers(FilledA_Numbers, EmptyB_Numbers, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})


describe('Empty A join filled with numbers B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, FilledB_Numbers, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([...FilledB_Numbers].map(e => [_, e] as NRA<number, number>));
    const result = joinNumbers(EmptyA_Numbers, FilledB_Numbers, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([...FilledB_Numbers].map(e => [_, e] as NRA<number, number>));
    const result = joinNumbers(EmptyA_Numbers, FilledB_Numbers, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, FilledB_Numbers, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, FilledB_Numbers, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, FilledB_Numbers, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([...FilledB_Numbers].map(e => [_, e] as NRA<number, number>));
    const result = joinNumbers(EmptyA_Numbers, FilledB_Numbers, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([...FilledB_Numbers].map(e => [_, e] as NRA<number, number>));
    const result = joinNumbers(EmptyA_Numbers, FilledB_Numbers, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})


describe('Empty A join empty B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, EmptyB_Numbers, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, EmptyB_Numbers, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, EmptyB_Numbers, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, EmptyB_Numbers, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, EmptyB_Numbers, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, EmptyB_Numbers, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, EmptyB_Numbers, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([]);
    const result = joinNumbers(EmptyA_Numbers, EmptyB_Numbers, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})


describe('Filled with numbers A join filled with numbers B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([
      [ 6, _ ],
      [ 6, _ ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 9, _ ],
    ]);
    const result = joinNumbers(FilledA_Numbers, FilledB_Numbers, 'left outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ _, 8 ],
      [ _, 8 ],
      [ _, 10 ],
    ]);
    const result = joinNumbers(FilledA_Numbers, FilledB_Numbers, 'right outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([
      [ 6, _ ],
      [ 6, _ ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ _, 8 ],
      [ _, 8 ],
      [ 9, _ ],
      [ _, 10 ],
    ]);
    const result = joinNumbers(FilledA_Numbers, FilledB_Numbers, 'full outer join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
    ]);
    const result = joinNumbers(FilledA_Numbers, FilledB_Numbers, 'inner join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([
      [ 6, 7 ],
      [ 6, 7 ],
      [ 6, 8 ],
      [ 6, 8 ],
      [ 6, 10 ],
      [ 6, 7 ],
      [ 6, 7 ],
      [ 6, 8 ],
      [ 6, 8 ],
      [ 6, 10 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 8 ],
      [ 7, 8 ],
      [ 7, 10 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 8 ],
      [ 7, 8 ],
      [ 7, 10 ],
      [ 9, 7 ],
      [ 9, 7 ],
      [ 9, 8 ],
      [ 9, 8 ],
      [ 9, 10 ],
    ]);
    const result = joinNumbers(FilledA_Numbers, FilledB_Numbers, 'cross join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([
      [ 6, _ ],
      [ 6, _ ],
      [ 9, _ ],
    ]);
    const result = joinNumbers(FilledA_Numbers, FilledB_Numbers, 'left outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([
      [_, 8],
      [_, 8],
      [_, 10],
    ]);
    const result = joinNumbers(FilledA_Numbers, FilledB_Numbers, 'right outer anti join');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([
      [ 6, _ ],
      [ 6, _ ],
      [ _, 8 ],
      [ _, 8 ],
      [ 9, _ ],
      [ _, 10 ],
    ]);
    const result = joinNumbers(FilledA_Numbers, FilledB_Numbers, 'full outer anti join');
    deepStrictEqual(result, ideal);
  });
})
