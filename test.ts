import { deepStrictEqual } from 'node:assert/strict';
import test, { describe } from 'node:test';
import { capitalize, objectEntries } from 'tsafe';
import { _, joinTypeToEulerDiagramParts } from './constants';
import { BBA, EulerDiagramPartsCombinations, LNA, LRA, Merge, NRA, humanReadableJoinNames } from './types';

type GetJoinTypesByEulerDiagramMask<
  EulerDiagramPartsMask
> = Merge<Extract<
  {
    [Key in humanReadableJoinNames]: [Key, typeof joinTypeToEulerDiagramParts[Key]];
  }[humanReadableJoinNames],
  [humanReadableJoinNames, EulerDiagramPartsMask]
>>

function getJoinTypesBy<Mask>(
  bitmask: (eulerDiagramParts: EulerDiagramPartsCombinations) => boolean
): Set<GetJoinTypesByEulerDiagramMask<Mask>[0]> {
  return new Set(
    objectEntries(joinTypeToEulerDiagramParts)
      .filter((e): e is GetJoinTypesByEulerDiagramMask<Mask> => bitmask(e[1]))
      .map((e) => e[0] as (typeof e)[0])
  )
}

const joinsReturningAllPossibleAndExclusivelyLNAs =
  getJoinTypesBy<`1${string}`>(
    e => e.startsWith('1')
  );

const joinsReturningAllPossibleAndExclusivelyNRAs =
  getJoinTypesBy<`${string}1`>(
    e => e.endsWith('1')
  );


const testSuiteForAllJoins = <L, R, MergeResult>(
  suiteName: string,
  passesJoinCondition: (tuple: LRA<L, R>) => boolean,
  merge: (tuple: BBA<L, R>) => MergeResult,
  datasetGenerator: () => {
    a: Iterable<L>,
    b: Iterable<R>,
  },
  joinResultForBothFilledDatasets: {
    [K in humanReadableJoinNames]: Iterable<MergeResult>
  }
) => {
  const datasets = datasetGenerator();

  describe(suiteName, () => {
    for (const joinType of Object.keys(joinTypeToEulerDiagramParts) as Iterable<humanReadableJoinNames>) {
      describe(joinType, () => {
        type choice = 'filled' | 'empty';
        const testOneJoin = (
          { a, b, expected }:
          { a: choice, b: choice, expected: unknown }
        ) => test(`${capitalize(a)} A join ${b} B`, () => deepStrictEqual(
          join(
            a === 'empty' ? [] : datasets.a,
            b === 'empty' ? [] : datasets.b,
            joinType,
            passesJoinCondition
          ),
          expected
        ))
        testOneJoin({
          a: 'empty',
          b: 'empty',
          expected: new Set()
        });
        testOneJoin({
          a: 'filled',
          b: 'empty',
          expected: joinsReturningAllPossibleAndExclusivelyLNAs.has(joinType)
            ? new Set([...datasets.a].map(e => [e, _] as LNA<L, R>))
            : new Set()
        });
        testOneJoin({
          a: 'empty',
          b: 'filled',
          expected: joinsReturningAllPossibleAndExclusivelyNRAs.has(joinType)
            ? new Set([...datasets.b].map(e => [_, e] as NRA<L, R>))
            : new Set()
        });
        testOneJoin({
          a: 'filled',
          b: 'filled',
          expected: new Set(joinResultForBothFilledDatasets[joinType])
        });
      })
    }
  });
}

const brandA = Symbol('A');
const brandB = Symbol('B');

testSuiteForAllJoins(
  'Tests for mock db rows',
  ([l, r]) => l.v === r.v,
  e => e,
  () => ({
    a: new Set<{ brand: typeof brandA; id: number; v: number; }>([
      { brand: brandA, id: 1, v: 6 },
      { brand: brandA, id: 2, v: 6 },
      { brand: brandA, id: 3, v: 7 },
      { brand: brandA, id: 4, v: 7 },
      { brand: brandA, id: 5, v: 9 }
    ]),
    b: new Set<{ brand: typeof brandB; id: number; v: number; }>([
      { brand: brandB, id: 1, v: 7  },
      { brand: brandB, id: 2, v: 7  },
      { brand: brandB, id: 3, v: 8  },
      { brand: brandB, id: 4, v: 8  },
      { brand: brandB, id: 5, v: 10 }
    ]),
  }),
  {
    "leftOuterJoin": [
      [ { brand: brandA, id: 1, v: 6 }, _                              ],
      [ { brand: brandA, id: 2, v: 6 }, _                              ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 5, v: 9 }, _                              ],
    ] as const,
    'rightOuterJoin': [
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v:  7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v:  7 } ],
      [ _                             , { brand: brandB, id: 3, v:  8 } ],
      [ _                             , { brand: brandB, id: 4, v:  8 } ],
      [ _                             , { brand: brandB, id: 5, v: 10 } ],
    ] as const,
    'fullOuterJoin': [
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
    ],
    'innerJoin': [
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
    ],
    'crossJoin': [
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
    ],
    'leftOuterAntiJoin': [
      [ { brand: brandA, id: 1, v: 6 }, _ ],
      [ { brand: brandA, id: 2, v: 6 }, _ ],
      [ { brand: brandA, id: 5, v: 9 }, _ ],
    ],
    'rightOuterAntiJoin': [
      [_, { brand: brandB, id: 3, v:  8 }],
      [_, { brand: brandB, id: 4, v:  8 }],
      [_, { brand: brandB, id: 5, v: 10 }],
    ],
    'fullOuterAntiJoin': [
      [ { brand: brandA, id: 1, v: 6 }, _                               ],
      [ { brand: brandA, id: 2, v: 6 }, _                               ],
      [ _                             , { brand: brandB, id: 3, v: 8  } ],
      [ _                             , { brand: brandB, id: 4, v: 8  } ],
      [ { brand: brandA, id: 5, v: 9 }, _                               ],
      [ _                             , { brand: brandB, id: 5, v: 10 } ],
    ]
  },
)


testSuiteForAllJoins(
  'Tests for 2 intersecting arrays of numbers',
  ([l, r]) => l === r,
  e => e,
  () => ({
    a: [6, 6, 7, 7, 9],
    b: [7, 7, 8, 8, 10],
  }),
  {
    "leftOuterJoin": [
      [ 6, _ ],
      [ 6, _ ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 9, _ ],
    ] as const,
    'rightOuterJoin': [
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ _, 8 ],
      [ _, 8 ],
      [ _, 10 ],
    ] as const,
    'fullOuterJoin': [
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
    ],
    'innerJoin': [
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
    ],
    'crossJoin': [
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
    ],
    'leftOuterAntiJoin': [
      [ 6, _ ],
      [ 6, _ ],
      [ 9, _ ],
    ],
    'rightOuterAntiJoin': [
      [_, 8],
      [_, 8],
      [_, 10],
    ],
    'fullOuterAntiJoin': [
      [ 6, _ ],
      [ 6, _ ],
      [ _, 8 ],
      [ _, 8 ],
      [ 9, _ ],
      [ _, 10 ],
    ]
  },
)
