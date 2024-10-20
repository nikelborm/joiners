import "@total-typescript/ts-reset";
import { noCase } from 'change-case';
import { deepStrictEqual } from 'node:assert/strict';
import test, { describe } from 'node:test';
import { capitalize, objectEntries, objectKeys } from 'tsafe';
import { _, joinNameToEulerDiagramParts, joinNameToEulerDiagramPartsWithoutAliases } from './constants';
import { join } from './joinOnJoinName';
import type {
  AllJoinNames,
  BBA,
  CrossJoin,
  EulerDiagramPartsCombinations,
  FullAntiJoin,
  FullJoin,
  InnerJoin,
  LRA,
  LeftAntiJoin,
  LeftJoin,
  Prettify,
  RightAntiJoin,
  RightJoin
} from './types';

function getJoinNamesBy<Mask>(
  bitmask: (eulerDiagramParts: EulerDiagramPartsCombinations) => boolean
) {
  type JoinNames = Prettify<Extract<
    {
      [Key in AllJoinNames]: [Key, typeof joinNameToEulerDiagramParts[Key]];
    }[AllJoinNames],
    [AllJoinNames, Mask]
  >>
  return new Set(
    objectEntries(joinNameToEulerDiagramParts)
      .filter((e): e is JoinNames => bitmask(e[1]))
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
    keyof typeof joinNameToEulerDiagramPartsWithoutAliases,
    Iterable<NoInfer<MergeResult>>
  >
) => {
  const datasets = datasetGenerator();

  // Joins returning LNA for every row of A and no other rows
  // when to filled A was joined empty B
  const joinsProducingLNAs =
    getJoinNamesBy<`1${string}`>(e => e.startsWith('1'));

  // Joins returning NRA for every row of B and no other rows
  // when to empty A was joined filled B
  const joinsProducingNRAs =
    getJoinNamesBy<`${string}1`>(e => e.endsWith('1'));

  describe(suiteName, () => {
    for (
      const joinName of objectKeys(joinResultForBothFilledDatasets)
    ) {
      const expectations = [
        {
          a: { status: 'empty ', value: []},
          b: { status: 'empty ', value: []},
          resultDataset: []
        },
        {
          a: { status: 'empty ', value: []},
          b: { status: 'filled', value: datasets.b},
          resultDataset: Array.from(
            joinsProducingNRAs.has(joinName) ? datasets.b : [],
            e => merge([_, e])
          )
        },
        {
          a: { status: 'filled', value: datasets.a},
          b: { status: 'empty ', value: []},
          resultDataset: Array.from(
            joinsProducingLNAs.has(joinName) ? datasets.a : [],
            e => merge([e, _])
          )
        },
        {
          a: { status: 'filled', value: datasets.a},
          b: { status: 'filled', value: datasets.b},
          resultDataset: joinResultForBothFilledDatasets[joinName]
        }
      ] as const;

      for (const { a, b, resultDataset } of expectations)
        test(
          `${capitalize(a.status)} A ${noCase(joinName).padEnd(15)} ${b.status} B`,
          () => {
            const getJoinResult = () => joinName === 'crossJoin'
              ? join(a.value, b.value, joinName, merge)
              // @ts-expect-error My dear typescript, I'm sorry, you're
              // absolutely right that "Argument EulerDiagramParts of
              // Joiner<...> accepts only single string literal (literal
              // union is forbidden)."
              : join(a.value, b.value, joinName, merge, passesJoinCondition);

            // Allow reordering of values, but all values even if
            // duplicated  should be present in the same amount as before
            const ignoreOrder = <T>(iterable: Iterable<T>) => new Set(Array.from(iterable, v => [ v ] as [ T ]));
            const initialResult = ignoreOrder(getJoinResult());

            // test for correctness of the result
            deepStrictEqual( initialResult, ignoreOrder(resultDataset))

            // test if function is pure and gives the same result
            deepStrictEqual( ignoreOrder(getJoinResult()), initialResult)
          }
        )
    }
  });
}

const brandA = Symbol('A');
const brandB = Symbol('B');

const A = [
  { brand: brandA, id: 1, v: 6 },
  { brand: brandA, id: 2, v: 6 },
  { brand: brandA, id: 3, v: 7 },
  { brand: brandA, id: 4, v: 7 },
  { brand: brandA, id: 5, v: 9 },
] as const;
const [Aid1, Aid2, Aid3, Aid4, Aid5] = A;

const B = [
  { brand: brandB, id: 1, v: 7  },
  { brand: brandB, id: 2, v: 7  },
  { brand: brandB, id: 4, v: 8  },
  { brand: brandB, id: 3, v: 8  },
  { brand: brandB, id: 5, v: 10 },
] as const;
const [Bid1, Bid2, Bid3, Bid4, Bid5] = B;

type A = (typeof A)[number];
type B = (typeof B)[number];

testSuiteForAllJoins(
  'Tests for mock db rows',
  ([l, r]) => l.v === r.v,
  e => e,
  () => ({ a: new Set(A), b: new Set(B) }),
  {
    'leftJoin': [
      [ Aid1, _    ],
      [ Aid2, _    ],
      [ Aid3, Bid1 ],
      [ Aid3, Bid2 ],
      [ Aid4, Bid1 ],
      [ Aid4, Bid2 ],
      [ Aid5, _    ],
    ] as const satisfies LeftJoin<A, B, 'A'>[],
    'rightJoin': [
      [ Aid3, Bid1 ],
      [ Aid3, Bid2 ],
      [ Aid4, Bid1 ],
      [ Aid4, Bid2 ],
      [ _   , Bid3 ],
      [ _   , Bid4 ],
      [ _   , Bid5 ],
    ] as const satisfies RightJoin<A, B, 'A'>[],
    'fullJoin': [
      [ Aid1, _    ],
      [ Aid2, _    ],
      [ Aid3, Bid1 ],
      [ Aid4, Bid1 ],
      [ Aid3, Bid2 ],
      [ Aid4, Bid2 ],
      [ Aid5, _    ],
      [ _   , Bid3 ],
      [ _   , Bid4 ],
      [ _   , Bid5 ],
    ] as const satisfies FullJoin<A, B, 'A'>[],
    'innerJoin': [
      [ Aid3, Bid1 ],
      [ Aid3, Bid2 ],
      [ Aid4, Bid1 ],
      [ Aid4, Bid2 ],
    ] as const satisfies InnerJoin<A, B, 'A'>[],
    'crossJoin': [
      [ Aid1, Bid2 ],
      [ Aid1, Bid1 ],
      [ Aid1, Bid3 ],
      [ Aid1, Bid4 ],
      [ Aid1, Bid5 ],
      [ Aid2, Bid1 ],
      [ Aid2, Bid2 ],
      [ Aid2, Bid3 ],
      [ Aid2, Bid4 ],
      [ Aid2, Bid5 ],
      [ Aid3, Bid1 ],
      [ Aid3, Bid2 ],
      [ Aid3, Bid3 ],
      [ Aid3, Bid4 ],
      [ Aid3, Bid5 ],
      [ Aid4, Bid1 ],
      [ Aid4, Bid2 ],
      [ Aid4, Bid3 ],
      [ Aid4, Bid4 ],
      [ Aid4, Bid5 ],
      [ Aid5, Bid2 ],
      [ Aid5, Bid1 ],
      [ Aid5, Bid3 ],
      [ Aid5, Bid4 ],
      [ Aid5, Bid5 ],
    ] as const satisfies CrossJoin<A, B, 'A'>[],
    'leftAntiJoin': [
      [ Aid1, _    ],
      [ Aid2, _    ],
      [ Aid5, _    ],
    ] as const satisfies LeftAntiJoin<A, B, 'A'>[],
    'rightAntiJoin': [
      [ _, Bid3    ],
      [ _, Bid4    ],
      [ _, Bid5    ],
    ] as const satisfies RightAntiJoin<A, B, 'A'>[],
    'fullAntiJoin': [
      [ Aid1, _    ],
      [ Aid2, _    ],
      [ Aid5, _    ],
      [ _   , Bid3 ],
      [ _   , Bid4 ],
      [ _   , Bid5 ],
    ] as const satisfies FullAntiJoin<A, B, 'A'>[],
  },
)

type C = 6 | 7 | 9;
type D = 7 | 8 | 10;

testSuiteForAllJoins(
  'Tests for 2 intersecting arrays of numbers',
  ([l, r]) => l === r,
  e => e,
  () => ({
    a: [6, 6, 7, 7, 9] as const,
    b: [7, 7, 8, 8, 10] as const,
  }),
  {
    'leftJoin': [
      [ 6, _ ],
      [ 6, _ ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 9, _ ],
      [ 7, 7 ],
    ] satisfies LeftJoin<C, D, 'A'>[],
    'rightJoin': [
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ _, 8 ],
      [ _, 8 ],
      [ _, 10 ],
    ] satisfies RightJoin<C, D, 'A'>[],
    'fullJoin': [
      [ 6, _ ],
      [ 6, _ ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 9, _ ],
      [ _, 8 ],
      [ 7, 7 ],
      [ _, 8 ],
      [ _, 10 ],
    ] satisfies FullJoin<C, D, 'A'>[],
    'innerJoin': [
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 7 ],
    ] satisfies InnerJoin<C, D, 'A'>[],
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
      [ 7, 10 ],
      [ 7, 7 ],
      [ 7, 7 ],
      [ 7, 8 ],
      [ 7, 8 ],
      [ 7, 10 ],
      [ 9, 7 ],
      [ 7, 8 ],
      [ 9, 7 ],
      [ 9, 8 ],
      [ 9, 8 ],
      [ 9, 10 ],
    ] satisfies CrossJoin<C, D, 'A'>[],
    'leftAntiJoin': [
      [ 6, _ ],
      [ 6, _ ],
      [ 9, _ ],
    ] satisfies LeftAntiJoin<C, D, 'A'>[],
    'rightAntiJoin': [
      [_, 8],
      [_, 8],
      [_, 10],
    ] satisfies RightAntiJoin<C, D, 'A'>[],
    'fullAntiJoin': [
      [ 6, _ ],
      [ 6, _ ],
      [ _, 8 ],
      [ _, 8 ],
      [ 9, _ ],
      [ _, 10 ],
    ] satisfies FullAntiJoin<C, D, 'A'>[],
  },
)
