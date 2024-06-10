import "@total-typescript/ts-reset";
import { _, joinTypeToEulerDiagramParts } from './constants';
import type {
  DetailingModifier,
  EulerDiagramPartsCombinations,
  Joiner,
  LRA,
  humanReadableJoinNames
} from './types';

export function * join<L,R>(
  left: Iterable<L>,
  right: Iterable<R>,
  joinType: humanReadableJoinNames,
  passesJoinCondition: (tuple: LRA<L, R>) => boolean,
) {
  yield * joinGeneratorOnEulerDiagramParts(
    left,
    right,
    joinType === 'crossJoin' ? () => true : passesJoinCondition,
    e => e,
    joinTypeToEulerDiagramParts[joinType],
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
  passesJoinCondition: (tuple: LRA<L, R>) => boolean,
  merge: (tuple: TupleType) => MergedResult,
  eulerDiagramParts: EulerDiagramParts,
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
    let lNeverPassedJoinCondition = true;
    let rIndex = -1;
    // Starts with -1 because is being incremented before used

    for (const r of right) {
      const tuple = [l, r] satisfies LRA<L, R>;
      rIndex++;
      if (!passesJoinCondition(tuple)) continue;
      lNeverPassedJoinCondition = false;

      if(shouldAddRightExclusivePart)
        ref.unmatchedRightIndexes.delete(rIndex);

      if(shouldAddInnerPart)
        yield merge(tuple as TupleType);
    }

    if(
      lNeverPassedJoinCondition
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
