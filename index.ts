import "@total-typescript/ts-reset";
import { _, joinTypeToEulerDiagramParts } from './constants';
import { getSpreadObjectMerger } from './spreadObjectMerger';

import type {
  DetailingModifier,
  EulerDiagramPartsCombinations,
  Joiner,
  JoinType,
  LRA,
  Prettify
} from './types';


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
): Generator<Prettify<MergedResult>> {
  const bits = parseInt(eulerDiagramParts, 2);
  const shouldAddLeftExclusivePart  = bits & 0b100;
  const shouldAddInnerPart          = bits & 0b010;
  const shouldAddRightExclusivePart = bits & 0b001;
  let ref = {} as { unmatchedRightIndices: Set<number> };

  if(shouldAddRightExclusivePart)
    ref.unmatchedRightIndices = new Set(
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
        ref.unmatchedRightIndices.delete(rIndex);

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
      if(ref.unmatchedRightIndices.has(rIndex++))
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



const asIsMerger = <const T>(t: T): T => t;




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
  // asIsMerger,
  getSpreadObjectMerger('{ ...A, ...B }'),
  (tuple) => tuple[0].v === tuple[1].v,
  'A'
)) {

}
