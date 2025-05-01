import '@total-typescript/ts-reset';
import { noCase } from 'change-case';
import { deepStrictEqual } from 'node:assert/strict';
import test, { describe } from 'node:test';
import { capitalize, objectEntries, objectKeys } from 'tsafe';
import {
  _,
  joinNameToVennDiagramParts,
  joinNameToVennDiagramPartsWithoutAliases,
} from './constants.ts';
import { join } from './joinOnJoinName.ts';
import type {
  AllJoinNames,
  BBA,
  CrossJoin,
  VennDiagramPartsCombinations,
  FullAntiJoin,
  FullJoin,
  InnerJoin,
  LRA,
  LeftAntiJoin,
  LeftJoin,
  Prettify,
  RightAntiJoin,
  RightJoin,
} from './types.ts';
import { getShufflingIterable } from './getShufflingIterable.ts';

function getJoinNamesBy<Mask>(
  bitmask: (vennDiagramParts: VennDiagramPartsCombinations) => boolean,
) {
  type JoinNames = Prettify<
    Extract<
      {
        [Key in AllJoinNames]: [Key, (typeof joinNameToVennDiagramParts)[Key]];
      }[AllJoinNames],
      [AllJoinNames, Mask]
    >
  >;
  return new Set(
    objectEntries(joinNameToVennDiagramParts)
      .filter((e): e is JoinNames => bitmask(e[1]))
      .map(e => e[0] as (typeof e)[0]),
  );
}

const testSuiteForAllJoins = <L, R, MergeResult>(
  suiteName: string,
  passesJoinCondition: (tuple: LRA<L, R>) => boolean,
  merge: (tuple: BBA<L, R>) => MergeResult,
  {
    a: aNotShuffled,
    b: bNotShuffled,
  }: {
    a: Iterable<L>;
    b: Iterable<R>;
  },
  joinResultForBothFilledDatasets: Record<
    keyof typeof joinNameToVennDiagramPartsWithoutAliases,
    Iterable<NoInfer<MergeResult>>
  >,
) => {
  const a = getShufflingIterable(aNotShuffled);
  const b = getShufflingIterable(bNotShuffled);

  // For cases when to filled with data base of A we join empty B, here we collect types of
  // joins that return exclusively LNAs for every row of A ([A, empty]) and no
  // other rows
  const joinsProducingLNAs = getJoinNamesBy<`1${string}`>(e =>
    e.startsWith('1'),
  );

  // For cases when to empty base of A we join filled with data B, here we collect types of
  // joins that return exclusively NRAs for every row of B ([empty, B]) and no
  // other rows
  const joinsProducingNRAs = getJoinNamesBy<`${string}1`>(e => e.endsWith('1'));

  describe(suiteName, () => {
    for (const joinName of objectKeys(joinResultForBothFilledDatasets)) {
      const expectations = [
        {
          a: { status: 'empty', value: [] },
          b: { status: 'empty', value: [] },
          resultDataset: [],
        },
        {
          a: { status: 'empty', value: [] },
          b: { status: 'filled', value: b },
          resultDataset: Array.from(
            joinsProducingNRAs.has(joinName) ? b : [],
            e => merge([_, e]),
          ),
        },
        {
          a: { status: 'filled', value: a },
          b: { status: 'empty', value: [] },
          resultDataset: Array.from(
            joinsProducingLNAs.has(joinName) ? a : [],
            e => merge([e, _]),
          ),
        },
        {
          a: { status: 'filled', value: a },
          b: { status: 'filled', value: b },
          resultDataset: joinResultForBothFilledDatasets[joinName],
        },
      ] as const;

      for (const { a, b, resultDataset } of expectations)
        test(
          [
            /* 'Empty ' */ capitalize(a.status).padEnd(6),
            'Array<A>',
            /* 'left joined    ' */ noCase(joinName + 'ed').padStart(17),
            'with',
            /* 'filled' */ b.status.padEnd(6),
            'Array<B>',
          ].join(' '),
          () => {
            const getJoinResult = () =>
              join(
                a.value,
                b.value,
                // @ts-expect-error it's expected of ts reporting an error related to joinName being too wide
                joinName,
                merge,
                joinName === 'crossJoin' ? void 0 : passesJoinCondition,
              );

            // Allows reordering of values, but still requires all values
            // (even duplicates) to be present in the same amount as before
            const toUnorderedSet = <T>(iterable: Iterable<T>) =>
              new Set(Array.from(iterable, v => [v] as [T]));

            const initialResult = toUnorderedSet(getJoinResult());

            // tests if result is correct
            deepStrictEqual(initialResult, toUnorderedSet(resultDataset));

            // tests if function execution is pure and has no side-effects
            deepStrictEqual(toUnorderedSet(getJoinResult()), initialResult);
          },
        );
    }
  });
};

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
  { brand: brandB, id: 1, v: 7 },
  { brand: brandB, id: 2, v: 7 },
  { brand: brandB, id: 4, v: 8 },
  { brand: brandB, id: 3, v: 8 },
  { brand: brandB, id: 5, v: 10 },
] as const;
const [Bid1, Bid2, Bid3, Bid4, Bid5] = B;

type A = (typeof A)[number];
type B = (typeof B)[number];

// prettier-ignore
testSuiteForAllJoins(
  'Tests for mock db rows',
  ([l, r]) => l.v === r.v,
  e => e,
  { a: new Set(A), b: new Set(B) },
  {
    leftJoin: [
      [Aid1, _   ],
      [Aid2, _   ],
      [Aid3, Bid1],
      [Aid3, Bid2],
      [Aid4, Bid1],
      [Aid4, Bid2],
      [Aid5, _   ],
    ] as const satisfies LeftJoin<A, B, 'A'>[],
    rightJoin: [
      [Aid3, Bid1],
      [Aid3, Bid2],
      [Aid4, Bid1],
      [Aid4, Bid2],
      [_   , Bid3],
      [_   , Bid4],
      [_   , Bid5],
    ] as const satisfies RightJoin<A, B, 'A'>[],
    fullJoin: [
      [Aid1, _   ],
      [Aid2, _   ],
      [Aid3, Bid1],
      [Aid4, Bid1],
      [Aid3, Bid2],
      [Aid4, Bid2],
      [Aid5, _   ],
      [_   , Bid3],
      [_   , Bid4],
      [_   , Bid5],
    ] as const satisfies FullJoin<A, B, 'A'>[],
    innerJoin: [
      [Aid3, Bid1],
      [Aid3, Bid2],
      [Aid4, Bid1],
      [Aid4, Bid2],
    ] as const satisfies InnerJoin<A, B, 'A'>[],
    crossJoin: [
      [Aid1, Bid2],
      [Aid1, Bid1],
      [Aid1, Bid3],
      [Aid1, Bid4],
      [Aid1, Bid5],
      [Aid2, Bid1],
      [Aid2, Bid2],
      [Aid2, Bid3],
      [Aid2, Bid4],
      [Aid2, Bid5],
      [Aid3, Bid1],
      [Aid3, Bid2],
      [Aid3, Bid3],
      [Aid3, Bid4],
      [Aid3, Bid5],
      [Aid4, Bid1],
      [Aid4, Bid2],
      [Aid4, Bid3],
      [Aid4, Bid4],
      [Aid4, Bid5],
      [Aid5, Bid2],
      [Aid5, Bid1],
      [Aid5, Bid3],
      [Aid5, Bid4],
      [Aid5, Bid5],
    ] as const satisfies CrossJoin<A, B, 'A'>[],
    leftAntiJoin: [
      [Aid1, _   ],
      [Aid2, _   ],
      [Aid5, _   ],
    ] as const satisfies LeftAntiJoin<A, B, 'A'>[],
    rightAntiJoin: [
      [_   , Bid3],
      [_   , Bid4],
      [_   , Bid5],
    ] as const satisfies RightAntiJoin<A, B, 'A'>[],
    fullAntiJoin: [
      [Aid1, _   ],
      [Aid2, _   ],
      [Aid5, _   ],
      [_   , Bid3],
      [_   , Bid4],
      [_   , Bid5],
    ] as const satisfies FullAntiJoin<A, B, 'A'>[],
  },
);

type C = 1 | 2 | 3;
type D = 2 | 4 | 5;

testSuiteForAllJoins(
  'Tests for 2 intersecting arrays of numbers',
  ([l, r]) => l === r,
  e => e,
  {
    a: [1, 1, 2, 2, 3] as const,
    b: [2, 2, 4, 4, 5] as const,
  },
  {
    leftJoin: [
      [1, _],
      [1, _],
      [2, 2],
      [2, 2],
      [2, 2],
      [3, _],
      [2, 2],
    ] satisfies LeftJoin<C, D, 'A'>[],
    rightJoin: [
      [2, 2],
      [2, 2],
      [2, 2],
      [2, 2],
      [_, 4],
      [_, 4],
      [_, 5],
    ] satisfies RightJoin<C, D, 'A'>[],
    fullJoin: [
      [1, _],
      [1, _],
      [2, 2],
      [2, 2],
      [2, 2],
      [3, _],
      [_, 4],
      [2, 2],
      [_, 4],
      [_, 5],
    ] satisfies FullJoin<C, D, 'A'>[],
    innerJoin: [
      [2, 2],
      [2, 2],
      [2, 2],
      [2, 2],
    ] satisfies InnerJoin<C, D, 'A'>[],
    crossJoin: [
      [1, 2],
      [1, 2],
      [1, 4],
      [1, 4],
      [1, 5],
      [1, 2],
      [1, 2],
      [1, 4],
      [1, 4],
      [1, 5],
      [2, 2],
      [2, 2],
      [2, 4],
      [2, 5],
      [2, 2],
      [2, 2],
      [2, 4],
      [2, 4],
      [2, 5],
      [3, 2],
      [2, 4],
      [3, 2],
      [3, 4],
      [3, 4],
      [3, 5],
    ] satisfies CrossJoin<C, D, 'A'>[],
    leftAntiJoin: [
      [1, _],
      [1, _],
      [3, _],
    ] satisfies LeftAntiJoin<C, D, 'A'>[],
    rightAntiJoin: [
      [_, 4],
      [_, 4],
      [_, 5],
    ] satisfies RightAntiJoin<C, D, 'A'>[],
    fullAntiJoin: [
      [1, _],
      [1, _],
      [_, 4],
      [_, 4],
      [3, _],
      [_, 5],
    ] satisfies FullAntiJoin<C, D, 'A'>[],
  },
);
