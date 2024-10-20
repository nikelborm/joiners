import { _ } from './constants';
import { DetailingModifier, EulerDiagramPartsCombinations, JoinOnEulerDiagramParts, LRA } from './types';


export function buildJoinerOnEulerDiagramPartsWithCustomDetailingModifier<
  Detailing extends DetailingModifier = 'A'
>() {
  return function * __joinOnEulerDiagramParts<
    const EulerDiagramParts extends EulerDiagramPartsCombinations,
    L,
    R,
    MergedResult,
    TupleType = JoinOnEulerDiagramParts<L, R, EulerDiagramParts, Detailing>,
  >(
    left: Iterable<L>,
    right: Iterable<R>,
    eulerDiagramParts: EulerDiagramParts,
    merge: (tuple: TupleType) => MergedResult,
    passesJoinCondition: (tuple: LRA<L, R>) => boolean,
  ): Generator<MergedResult> {
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
}

export const joinOnEulerDiagramPartsWithAtomicMergeArgs = buildJoinerOnEulerDiagramPartsWithCustomDetailingModifier<"A">();
export const joinOnEulerDiagramPartsWithCompactedMergeArgs = buildJoinerOnEulerDiagramPartsWithCustomDetailingModifier<"C">();
export const joinOnEulerDiagramPartsWithExtendedMergeArgs = buildJoinerOnEulerDiagramPartsWithCustomDetailingModifier<"E">();

export const joinOnEulerDiagramParts = joinOnEulerDiagramPartsWithAtomicMergeArgs;
