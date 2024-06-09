import test, { describe } from 'node:test';
import { deepStrictEqual } from 'node:assert/strict';
import { joinGen } from '.';
import { _ } from './constants';
import { LNA, LRA, NRA } from './types';


const humanReadableJoinNameToEulerDiagramParts = {
  'left outer join'       : '110',
  'right outer join'      : '011',
  'full outer join'       : '111',
  'inner join'            : '010',
  'cross join'            : '010',
  'left outer anti join'  : '100',
  'right outer anti join' : '001',
  'full outer anti join'  : '101',
} as const;

type humanReadableJoinNames = keyof typeof humanReadableJoinNameToEulerDiagramParts;



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

const prepareTestOfOneJoin = <L, R>(
  datasets: {
    FilledA: Iterable<L>,
    FilledB: Iterable<R>,
  },
  compare: (tuple: LRA<L, R>) => boolean,
) => (
  aKind: 'FilledA' | 'EmptyA',
  bKind: 'FilledB' | 'EmptyB',
  joinType: string,
  expected: unknown,
) => {
  test(`${aKind} join ${bKind}`, () => {
    deepStrictEqual(
      join(
        aKind === 'EmptyA' ? [] : datasets[aKind],
        bKind === 'EmptyB' ? [] : datasets[bKind],
        joinType as humanReadableJoinNames,
        compare
      ),
      expected
    );
  })
}

const testSuiteForAllJoins = <L, R>(
  suiteName: string,
  datasetGenerator: () => {
    FilledA: Iterable<L>,
    FilledB: Iterable<R>,
  },
  compare: (tuple: LRA<L, R>) => boolean,
) => {

}

describe('Tests for mock db rows' , () => {
  const brandA = Symbol('A');
  const brandB = Symbol('B');

  type brandA = typeof brandA;
  type brandB = typeof brandB;

  type A = { brand: brandA; id: number; v: number; };
  type B = { brand: brandB; id: number; v: number; };

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

  const LNAsFromFilledA = new Set([...FilledA].map(e => [e, _] as LNA<A, B>));
  const NRAsFromFilledB = new Set([...FilledB].map(e => [_, e] as NRA<A, B>));


  const testJoin = prepareTestOfOneJoin(
    { FilledA, FilledB },
    ([l, r]) => l.v === r.v
  );

  describe('left outer join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, LNAsFromFilledA)
    testJoin('EmptyA',  'FilledB', t.name, new Set())
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [ { brand: brandA, id: 1, v: 6 }, _                              ],
      [ { brand: brandA, id: 2, v: 6 }, _                              ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 5, v: 9 }, _                              ],
    ]))
  })
  describe('right outer join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, new Set())
    testJoin('EmptyA',  'FilledB', t.name, NRAsFromFilledB)
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v:  7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v:  7 } ],
      [ _                             , { brand: brandB, id: 3, v:  8 } ],
      [ _                             , { brand: brandB, id: 4, v:  8 } ],
      [ _                             , { brand: brandB, id: 5, v: 10 } ],
    ]))
  })
  describe('full outer join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, LNAsFromFilledA)
    testJoin('EmptyA',  'FilledB', t.name, NRAsFromFilledB)
    testJoin('FilledA', 'FilledB', t.name, new Set([
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
    ]))
  })
  describe('inner join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, new Set())
    testJoin('EmptyA',  'FilledB', t.name, new Set())
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
    ]))
  })
  describe('cross join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, new Set())
    testJoin('EmptyA',  'FilledB', t.name, new Set())
    testJoin('FilledA', 'FilledB', t.name, new Set([
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
    ]))
  })
  describe('left outer anti join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, LNAsFromFilledA)
    testJoin('EmptyA',  'FilledB', t.name, new Set())
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [ { brand: brandA, id: 1, v: 6 }, _ ],
      [ { brand: brandA, id: 2, v: 6 }, _ ],
      [ { brand: brandA, id: 5, v: 9 }, _ ],
    ]))
  })
  describe('right outer anti join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, new Set())
    testJoin('EmptyA',  'FilledB', t.name, NRAsFromFilledB)
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [_, { brand: brandB, id: 3, v:  8 }],
      [_, { brand: brandB, id: 4, v:  8 }],
      [_, { brand: brandB, id: 5, v: 10 }],
    ]))
  })
  describe('full outer anti join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, LNAsFromFilledA)
    testJoin('EmptyA',  'FilledB', t.name, NRAsFromFilledB)
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [ { brand: brandA, id: 1, v: 6 }, _                               ],
      [ { brand: brandA, id: 2, v: 6 }, _                               ],
      [ _                             , { brand: brandB, id: 3, v: 8  } ],
      [ _                             , { brand: brandB, id: 4, v: 8  } ],
      [ { brand: brandA, id: 5, v: 9 }, _                               ],
      [ _                             , { brand: brandB, id: 5, v: 10 } ],
    ]))
  })
})

describe('Tests for 2 intersecting arrays of numbers' , () => {
  type A = number;
  type B = number;

  const FilledA = [6, 6, 7, 7, 9];
  const FilledB = [7, 7, 8, 8, 10];

  const LNAsFromFilledA = new Set([...FilledA].map(e => [e, _] as LNA<A, B>));
  const NRAsFromFilledB = new Set([...FilledB].map(e => [_, e] as NRA<A, B>));


  const testJoin = prepareTestOfOneJoin(
    { FilledA, FilledB },
    ([l, r]) => l === r
  );

  describe('left outer join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, LNAsFromFilledA)
    testJoin('EmptyA',  'FilledB', t.name, new Set())
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [ 6, _ ],
      [ 6, _ ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 9, _ ],
    ]))
  })
  describe('right outer join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, new Set())
    testJoin('EmptyA',  'FilledB', t.name, NRAsFromFilledB)
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ _, 8 ],
      [ _, 8 ],
      [ _, 10 ],
    ]))
  })
  describe('full outer join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, LNAsFromFilledA)
    testJoin('EmptyA',  'FilledB', t.name, NRAsFromFilledB)
    testJoin('FilledA', 'FilledB', t.name, new Set([
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
    ]))
  })
  describe('inner join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, new Set())
    testJoin('EmptyA',  'FilledB', t.name, new Set())
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
    ]))
  })
  describe('cross join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, new Set())
    testJoin('EmptyA',  'FilledB', t.name, new Set())
    testJoin('FilledA', 'FilledB', t.name, new Set([
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
    ]))
  })
  describe('left outer anti join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, LNAsFromFilledA)
    testJoin('EmptyA',  'FilledB', t.name, new Set())
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [ 6, _ ],
      [ 6, _ ],
      [ 9, _ ],
    ]))
  })
  describe('right outer anti join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, new Set())
    testJoin('EmptyA',  'FilledB', t.name, NRAsFromFilledB)
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [_, 8],
      [_, 8],
      [_, 10],
    ]))
  })
  describe('full outer anti join', (t) => {
    testJoin('EmptyA',  'EmptyB',  t.name, new Set())
    testJoin('FilledA', 'EmptyB',  t.name, LNAsFromFilledA)
    testJoin('EmptyA',  'FilledB', t.name, NRAsFromFilledB)
    testJoin('FilledA', 'FilledB', t.name, new Set([
      [ 6, _ ],
      [ 6, _ ],
      [ _, 8 ],
      [ _, 8 ],
      [ 9, _ ],
      [ _, 10 ],
    ]))
  })
})
