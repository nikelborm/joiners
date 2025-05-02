import { noCase } from 'change-case';
import { capitalize, objectEntries, objectKeys } from 'tsafe';
import { describe } from 'vitest';
import {
  _,
  joinNameToVennDiagramParts,
  joinNameToVennDiagramPartsWithoutAliases,
} from './constants.ts';
import { getShufflingIterable } from './getShufflingIterable.helper.spec.ts';
import { join } from './joinOnJoinName.ts';
import type {
  AllJoinNames,
  BBA,
  LRA,
  Prettify,
  VennDiagramPartsCombinations,
} from './types.ts';

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

/**
 * For cases when to filled with data base of A we join empty B, here we collect
 * types of joins that return exclusively LNAs for every row of A ([A, empty])
 * and no other rows
 */
const joinsProducingLNAs = getJoinNamesBy<`1${string}`>(e => e.startsWith('1'));

/**
 * For cases when to empty base of A we join filled with data B, here we collect
 * types of joins that return exclusively NRAs for every row of B ([empty, B])
 * and no other rows
 */
const joinsProducingNRAs = getJoinNamesBy<`${string}1`>(e => e.endsWith('1'));

/**
 * Allows arrays of values pass equality tests regardless of order of elements,
 * but still requires all values (even duplicates) to be present in the same
 * amount as before
 */
const toUnorderedSet = <T>(iterable: Iterable<T>) =>
  new Set(Array.from(iterable, v => [v] as [T]));

export const testSuiteForAllJoins = <L, R, MergeResult>(
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

  describe(suiteName, test => {
    for (const joinName of objectKeys(joinResultForBothFilledDatasets)) {
      const expectations = [
        {
          a: { status: 'empty', value: [] },
          b: { status: 'empty', value: [] },
          expectedResult: [],
        },
        {
          a: { status: 'empty', value: [] },
          b: { status: 'filled', value: b },
          expectedResult: Array.from(
            joinsProducingNRAs.has(joinName) ? b : [],
            e => merge([_, e]),
          ),
        },
        {
          a: { status: 'filled', value: a },
          b: { status: 'empty', value: [] },
          expectedResult: Array.from(
            joinsProducingLNAs.has(joinName) ? a : [],
            e => merge([e, _]),
          ),
        },
        {
          a: { status: 'filled', value: a },
          b: { status: 'filled', value: b },
          expectedResult: joinResultForBothFilledDatasets[joinName],
        },
      ] as const;

      for (const { a, b, expectedResult } of expectations)
        test(
          [
            /* 'Empty ' */ capitalize(a.status).padEnd(6),
            'Array<A>',
            /* 'left joined    ' */ noCase(joinName + 'ed').padStart(17),
            'with',
            /* 'filled' */ b.status.padEnd(6),
            'Array<B>',
          ].join(' '),
          ctx => {
            const getJoinResult = () =>
              join(
                a.value,
                b.value,
                // @ts-expect-error it's expected of ts reporting an error related to joinName being too wide
                joinName,
                merge,
                joinName === 'crossJoin' ? void 0 : passesJoinCondition,
              );

            const initialResult = toUnorderedSet(getJoinResult());

            // tests if result is correct
            ctx
              .expect(initialResult)
              .toStrictEqual(toUnorderedSet(expectedResult));

            // tests if function execution is pure and has no side-effects
            ctx
              .expect(toUnorderedSet(getJoinResult()))
              .toStrictEqual(initialResult);
          },
        );
    }
  });
};
