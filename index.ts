import "@total-typescript/ts-reset";
import { At as GetNthCharacter } from 'ts-toolbelt/out/String/At';
import { _, joinTypeToEulerDiagramParts } from './constants';
import type {
  BBA,
  DetailingModifier,
  EulerDiagramPartsCombinations,
  Joiner,
  JoinType,
  LNA,
  LRA,
  NRA
} from './types';


// TODO join function types don't work

export function join<
  const InferredJoinType extends Exclude<JoinType, 'crossJoin'>,
  L,
  R,
  MergedResult,
  EulerDiagramParts extends EulerDiagramPartsCombinations
    = typeof joinTypeToEulerDiagramParts[InferredJoinType],
  const Detailing extends DetailingModifier = 'A',
  TupleType = Joiner<L, R, EulerDiagramParts, Detailing>,
>(
  left: Iterable<L>,
  right: Iterable<R>,
  joinType: InferredJoinType,
  merge: (tuple: TupleType) => MergedResult,
  passesJoinCondition: (tuple: LRA<L, R>) => boolean,
): Generator<MergedResult>;

export function join<
  const InferredJoinType extends 'crossJoin',
  L,
  R,
  MergedResult,
  EulerDiagramParts extends "010",
  const Detailing extends DetailingModifier = 'A',
  TupleType = Joiner<L, R, EulerDiagramParts, Detailing>,
>(
  left: Iterable<L>,
  right: Iterable<R>,
  joinType: InferredJoinType,
  merge: (tuple: TupleType) => MergedResult,
): Generator<MergedResult>;

export function join<
  const InferredJoinType extends JoinType,
  L,
  R,
  MergedResult,
  EulerDiagramParts extends EulerDiagramPartsCombinations
    = typeof joinTypeToEulerDiagramParts[InferredJoinType],
  const Detailing extends DetailingModifier = 'A',
  TupleType = Joiner<L, R, EulerDiagramParts, Detailing>,
>(
  left: Iterable<L>,
  right: Iterable<R>,
  joinType: InferredJoinType,
  merge: (tuple: TupleType) => MergedResult,
  passesJoinCondition?: (tuple: LRA<L, R>) => boolean,
): Generator<MergedResult> {
  if ((joinType === 'crossJoin') !== (passesJoinCondition === undefined))
    throw new Error();

  return joinGeneratorOnEulerDiagramParts(
    left,
    right,
    joinTypeToEulerDiagramParts[joinType],
    merge,
    joinType === 'crossJoin'
      ? () => true
      : passesJoinCondition as (tuple: LRA<L, R>) => boolean,
    'A'
  );
}

export function * joinGeneratorOnEulerDiagramParts<
  const EulerDiagramParts extends EulerDiagramPartsCombinations,
  L,
  R,
  MergedResult,
  const Detailing extends DetailingModifier = 'A',
  TupleType = Joiner<L, R, EulerDiagramParts, Detailing>,
>(
  left: Iterable<L>,
  right: Iterable<R>,
  eulerDiagramParts: EulerDiagramParts,
  merge: (tuple: TupleType) => MergedResult,
  passesJoinCondition: (tuple: LRA<L, R>) => boolean,
  // used to infer param for type system. Do not remove
  detailingModifier: Detailing = 'A' as Detailing
) {
  const bits = parseInt(eulerDiagramParts, 2);
  const shouldAddLeftExclusivePart  = bits & 0b100;
  const shouldAddInnerPart          = bits & 0b010;
  const shouldAddRightExclusivePart = bits & 0b001;
  let ref = {} as { unmatchedRightIndexes: Set<number> };

  if(shouldAddRightExclusivePart)
    ref.unmatchedRightIndexes = new Set(
      Array.from(right, (e, i) => i)
    );

  for (const l of left) {
    let didLeftFailAllJoinConditions = true;
    let rIndex = -1;
    // Starts with -1 because is being incremented before used

    for (const r of right) {
      const tuple = [l, r] satisfies LRA<L, R>;
      rIndex++;
      if (!passesJoinCondition(tuple)) continue;
      didLeftFailAllJoinConditions = false;

      if(shouldAddRightExclusivePart)
        ref.unmatchedRightIndexes.delete(rIndex);

      if(shouldAddInnerPart)
        yield merge(tuple as TupleType);
    }

    if(
      didLeftFailAllJoinConditions
      && shouldAddLeftExclusivePart
    )
      yield merge([l, _] as TupleType);
  }

  if(shouldAddRightExclusivePart) {
    let rIndex = 0;

    for (const r of right) {
      if(ref.unmatchedRightIndexes.has(rIndex++))
        yield merge([_, r] as TupleType);
    }
  }
}

const brandA = Symbol('A');
const brandB = Symbol('B');

type A1 = {
  brand: typeof brandA;
  id: number;
  v: number;
  optionalColumnSpecificToTypeA?: typeof brandA
  requiredColumnSpecificToTypeA: typeof brandA
  optionalColumnTypeAgnostic?: typeof brandA
  requiredColumnTypeAgnostic: typeof brandA
};

type B1 = {
  brand: typeof brandB;
  id: number;
  v: number;
  optionalColumnSpecificToTypeB?: typeof brandB
  requiredColumnSpecificToTypeB: typeof brandB
  optionalColumnTypeAgnostic?: typeof brandB
  requiredColumnTypeAgnostic: typeof brandB
};







function doesAHavePriority(
  mergeStrategy: '{ ...B, ...A }' | '{ ...A, ...B }'
): mergeStrategy is '{ ...B, ...A }' {
  const firstPriorityIndex = 11;
  return mergeStrategy[firstPriorityIndex] as (
    GetNthCharacter<typeof mergeStrategy, typeof firstPriorityIndex>
  ) === 'A';
}


const returnSpreadObjectMerger = <const MergeStrategy extends '{ ...B, ...A }' | '{ ...A, ...B }'>(
  mergeStrategy: MergeStrategy
) => {

  return <
    const A,
    const B,
    const T extends BBA<A, B>
  >(tuple: T) => {
    const AHasPriority = doesAHavePriority(mergeStrategy)
    return {
      ...(tuple[~~!AHasPriority] as object),
      ...(tuple[~~AHasPriority] as object)
    } as (
      T extends NRA<any, infer R> //? TODO: replace with unknown?
      ? R
      : T extends LNA<infer L, any> //? TODO: replace with unknown?
      ? L
      : T extends BBA<infer L, infer R>
      // It's intentionally not just (L & R) because we need a way to reliably
      // specify that properties from right if exist, override properties from left
      ? { [Key in keyof L | keyof R]: (
        // TODO: add optionality support so it doesn't break ?: of source objects
        Key extends keyof R
        ? R[Key]
        : Key extends keyof L
        ? L[Key]
        : never
      ) }
      : never
    )
  }
}

// TODO also think of tests for {asd?: anything | undefined}
// L,            R,            OrderedMerge<L, R>
// {a?: string}, {a?: number}, {a?: string | number}
// {a?: string}, {a: number} , {a: number}
// {a: string},  {a?: number}, {a: string | number}
// {a: string},  {a: number},  {a: number}

const returnAsIsMerger = <const T>(t: T): T => t;




for (const iterator of joinGeneratorOnEulerDiagramParts(
  new Set<A1>([
    { brand: brandA, id: 1, v: 6, requiredColumnSpecificToTypeA: brandA, requiredColumnTypeAgnostic: brandA },
    { brand: brandA, id: 2, v: 6, requiredColumnSpecificToTypeA: brandA, requiredColumnTypeAgnostic: brandA },
    { brand: brandA, id: 3, v: 7, requiredColumnSpecificToTypeA: brandA, requiredColumnTypeAgnostic: brandA },
    { brand: brandA, id: 4, v: 7, requiredColumnSpecificToTypeA: brandA, requiredColumnTypeAgnostic: brandA },
    { brand: brandA, id: 5, v: 9, requiredColumnSpecificToTypeA: brandA, requiredColumnTypeAgnostic: brandA }
  ]),
  new Set<B1>([
    { brand: brandB, id: 1, v: 7 , requiredColumnSpecificToTypeB: brandB, requiredColumnTypeAgnostic: brandB },
    { brand: brandB, id: 2, v: 7 , requiredColumnSpecificToTypeB: brandB, requiredColumnTypeAgnostic: brandB },
    { brand: brandB, id: 3, v: 8 , requiredColumnSpecificToTypeB: brandB, requiredColumnTypeAgnostic: brandB },
    { brand: brandB, id: 4, v: 8 , requiredColumnSpecificToTypeB: brandB, requiredColumnTypeAgnostic: brandB },
    { brand: brandB, id: 5, v: 10, requiredColumnSpecificToTypeB: brandB, requiredColumnTypeAgnostic: brandB }
  ]),
  '011',
  // (tuple) => ({...(tuple[0] as object), ...(tuple[0] as object)}) as ((typeof tuple)[0] & (typeof tuple)[0]),
  returnAsIsMerger,
  // returnSpreadObjectMerger('{ ...A, ...B }'),
  (tuple) => tuple[0].v === tuple[1].v,
  'A'
)) {

}

for (const element of join(
  [0, 5, 8, 2],
  ['2', 4, 8, 2],
  // 'crossJoin',
  'rightJoin',
  <const E>(e: E) => [e, 'wtf'] as (E extends any ? [E, 'wtf'] : never)
  , (tuple) => tuple[0] === tuple[1]
)
) {
  console.log(element)
}
