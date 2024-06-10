import "@total-typescript/ts-reset";
import { deepStrictEqual } from 'node:assert/strict';
import test, { describe } from 'node:test';
import { capitalize, objectEntries, objectKeys } from 'tsafe';
import { noCase } from 'change-case';
import { _, joinTypeToEulerDiagramParts, joinTypeToEulerDiagramPartsWithoutAliases } from './constants';
import { join } from './index';
import type {
  BBA,
  CrossJoin,
  EulerDiagramPartsCombinations,
  FullAntiJoin,
  FullJoin,
  InnerJoin,
  LNA,
  LRA,
  LeftAntiJoin,
  LeftJoin,
  Merge,
  NRA,
  RightAntiJoin,
  RightJoin,
  JoinType
} from './types';

function getJoinTypesBy<Mask>(
  bitmask: (eulerDiagramParts: EulerDiagramPartsCombinations) => boolean
) {
  type JoinTypes = Merge<Extract<
    {
      [Key in JoinType]: [Key, typeof joinTypeToEulerDiagramParts[Key]];
    }[JoinType],
    [JoinType, Mask]
  >>
  return new Set(
    objectEntries(joinTypeToEulerDiagramParts)
      .filter((e): e is JoinTypes => bitmask(e[1]))
      .map((e) => e[0] as (typeof e)[0])
  )
}


const testSuiteForAllJoins = <L, R, MergeResult>(
  suiteName: string,
  passesJoinCondition: (tuple: LRA<L, R>) => boolean,
  merge: (tuple: BBA<L, R>) => MergeResult,
  datasetGenerator: () => {
    a: Iterable<L>,
    b: Iterable<R>,
  },
  joinResultForBothFilledDatasets: Record<
    keyof typeof joinTypeToEulerDiagramPartsWithoutAliases,
    Iterable<MergeResult>
  >
) => {
  const datasets = datasetGenerator();
  const choices = ['empty', 'filled'] as const;
  const left    = [[], datasets.a] as const;
  const right   = [[], datasets.b] as const;
  type choices = typeof choices extends ReadonlyArray<infer U> ? U : never;

  // Joins returning LNA for every row of A and no other rows
  // when to filled A was joined empty B
  const joinsProducingLNAs =
    getJoinTypesBy<`1${string}`>(e => e.startsWith('1'));

  // Joins returning NRA for every row of B and no other rows
  // when to empty A was joined filled B
  const joinsProducingNRAs =
    getJoinTypesBy<`${string}1`>(e => e.endsWith('1'));

  describe(suiteName, () => {
    for (
      const joinType of objectKeys(joinResultForBothFilledDatasets)
    ) {
      const expectations = [
        [],
        Array.from(
          joinsProducingNRAs.has(joinType) ? datasets.b : [],
          e => merge([_, e])
        ),
        Array.from(
          joinsProducingLNAs.has(joinType) ? datasets.a : [],
          e => merge([e, _])
        ),
        joinResultForBothFilledDatasets[joinType]
      ];
      for (let a = 0; a < 2; a++)
        for (let b = 0; b < 2; b++)
          test(
            `${capitalize(choices[a]).padEnd(6)} A ${noCase(joinType).padEnd(15)} ${choices[b].padEnd(6)} B`,
            () =>
              deepStrictEqual(
                // new Set(
                  [...(joinType === 'crossJoin'
                    ? join(left[a], right[b], joinType, merge)
                    : join(left[a], right[b], joinType, merge, passesJoinCondition))]
                ,
                expectations[a * 2 + b]
              )
          )
    }
  });
}

const brandA = Symbol('A');
const brandB = Symbol('B');

type A1 = { brand: typeof brandA; id: number; v: number; };
type B1 = { brand: typeof brandB; id: number; v: number; };

testSuiteForAllJoins(
  'Tests for mock db rows',
  ([l, r]) => l.v === r.v,
  e => e,
  () => ({
    a: new Set<A1>([
      { brand: brandA, id: 1, v: 6 },
      { brand: brandA, id: 2, v: 6 },
      { brand: brandA, id: 3, v: 7 },
      { brand: brandA, id: 4, v: 7 },
      { brand: brandA, id: 5, v: 9 }
    ]),
    b: new Set<B1>([
      { brand: brandB, id: 1, v: 7  },
      { brand: brandB, id: 2, v: 7  },
      { brand: brandB, id: 3, v: 8  },
      { brand: brandB, id: 4, v: 8  },
      { brand: brandB, id: 5, v: 10 }
    ]),
  }),
  {
    'leftJoin': [
      [ { brand: brandA, id: 1, v: 6 }, _                              ],
      [ { brand: brandA, id: 2, v: 6 }, _                              ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 5, v: 9 }, _                              ],
    ] satisfies LeftJoin<A1, B1>[],
    'rightJoin': [
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v:  7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v:  7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v:  7 } ],
      [ _                             , { brand: brandB, id: 3, v:  8 } ],
      [ _                             , { brand: brandB, id: 4, v:  8 } ],
      [ _                             , { brand: brandB, id: 5, v: 10 } ],
    ] satisfies RightJoin<A1, B1>[],
    'fullJoin': [
      [ { brand: brandA, id: 1, v: 6 }, _                               ],
      [ { brand: brandA, id: 2, v: 6 }, _                               ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7  } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7  } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7  } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7  } ],
      [ { brand: brandA, id: 5, v: 9 }, _                               ],
      [ _                             , { brand: brandB, id: 3, v: 8  } ],
      [ _                             , { brand: brandB, id: 4, v: 8  } ],
      [ _                             , { brand: brandB, id: 5, v: 10 } ],
    ] satisfies FullJoin<A1, B1>[],
    'innerJoin': [
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 3, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 1, v: 7 } ],
      [ { brand: brandA, id: 4, v: 7 }, { brand: brandB, id: 2, v: 7 } ],
    ] satisfies InnerJoin<A1, B1>[],
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
    ] satisfies CrossJoin<A1, B1>[],
    'leftAntiJoin': [
      [ { brand: brandA, id: 1, v: 6 }, _ ],
      [ { brand: brandA, id: 2, v: 6 }, _ ],
      [ { brand: brandA, id: 5, v: 9 }, _ ],
    ] satisfies LeftAntiJoin<A1, B1>[],
    'rightAntiJoin': [
      [_, { brand: brandB, id: 3, v:  8 }],
      [_, { brand: brandB, id: 4, v:  8 }],
      [_, { brand: brandB, id: 5, v: 10 }],
    ] satisfies RightAntiJoin<A1, B1>[],
    'fullAntiJoin': [
      [ { brand: brandA, id: 1, v: 6 }, _                               ],
      [ { brand: brandA, id: 2, v: 6 }, _                               ],
      [ { brand: brandA, id: 5, v: 9 }, _                               ],
      [ _                             , { brand: brandB, id: 3, v: 8  } ],
      [ _                             , { brand: brandB, id: 4, v: 8  } ],
      [ _                             , { brand: brandB, id: 5, v: 10 } ],
    ] satisfies FullAntiJoin<A1, B1>[],
  },
)

type A2 = number;
type B2 = number;

testSuiteForAllJoins(
  'Tests for 2 intersecting arrays of numbers',
  ([l, r]) => l === r,
  e => e,
  () => ({
    a: [6, 6, 7, 7, 9],
    b: [7, 7, 8, 8, 10],
  }),
  {
    'leftJoin': [
      [ 6, _ ],
      [ 6, _ ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 9, _ ],
    ] satisfies LeftJoin<A2, B2>[],
    'rightJoin': [
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ _, 8 ],
      [ _, 8 ],
      [ _, 10 ],
    ] satisfies RightJoin<A2, B2>[],
    'fullJoin': [
      [ 6, _ ],
      [ 6, _ ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 9, _ ],
      [ _, 8 ],
      [ _, 8 ],
      [ _, 10 ],
    ] satisfies FullJoin<A2, B2>[],
    'innerJoin': [
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
    ] satisfies InnerJoin<A2, B2>[],
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
    ] satisfies CrossJoin<A2, B2>[],
    'leftAntiJoin': [
      [ 6, _ ],
      [ 6, _ ],
      [ 9, _ ],
    ] satisfies LeftAntiJoin<A2, B2>[],
    'rightAntiJoin': [
      [_, 8],
      [_, 8],
      [_, 10],
    ] satisfies RightAntiJoin<A2, B2>[],
    'fullAntiJoin': [
      [ 6, _ ],
      [ 6, _ ],
      [ 9, _ ],
      [ _, 8 ],
      [ _, 8 ],
      [ _, 10 ],
    ] satisfies FullAntiJoin<A2, B2>[],
  },
)
