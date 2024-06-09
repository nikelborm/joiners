import { _ } from './constants';
import type {
  BBA,
  DetailingModifier,
  EulerDiagramPartsCombinations,
  Joiner,
  LNA,
  LRA,
  NRA,
  toV,
  to_
} from './types';




// function isEmpty<T>(v: T): v is to_<T> {
//   return v === _;
// }

// function isNotEmpty<T>(v: T): v is toV<T> {
//   return v !== _;
// }


// function castToBBA<L, R>(lr: [unknown, unknown]): asserts lr is BBA<L, R> {
//   // TODO: check l is L and r is R

//   const [l, r] = lr;

//   if(
//     (isEmpty   (l) && isEmpty   (r)) ||
//     (isEmpty   (l) && isNotEmpty(r)) ||
//     (isNotEmpty(l) && isEmpty   (r)) ||
//     (isNotEmpty(l) && isNotEmpty(r))
//   ) return;

//   throw new Error(`What the actual fuck??? lr is ${lr}`);
// }






export function * joinGen<
  const Detailing extends DetailingModifier,
  const EulerDiagramParts extends EulerDiagramPartsCombinations,
  L,
  R,
  TupleType = Joiner<L, R, EulerDiagramParts, Detailing>
>(
  left: Iterable<L>,
  right: Iterable<R>,
  passesJoinCondition: (tuple: LRA<L, R>) => boolean,
  merge: (tuple: TupleType) => any,
  eulerDiagramParts: EulerDiagramParts,
  detailingModifier: Detailing = 'A' as Detailing
) {
  const bits = parseInt(eulerDiagramParts, 2);
  const shouldAddLeftExclusivePart  = bits & 0b100;
  const shouldAddInnerPart          = bits & 0b010;
  const shouldAddRightExclusivePart = bits & 0b001;
  const ref = {} as { unmatchedRightIndexes: Set<number> };

  if(shouldAddRightExclusivePart)
    ref.unmatchedRightIndexes = new Set<number>(
      Array.from(right, (e, i) => i)
    );

  for (const l of left) {
    let currentLeftEntryNeverPassedJoinCondition = true;
    let rIndex = -1;
    // Starts with -1 because is being incremented before used

    for (const r of right) {
      const tuple = [l, r] satisfies LRA<L, R>;
      rIndex++;
      if (!passesJoinCondition(tuple)) continue;
      currentLeftEntryNeverPassedJoinCondition = false;

      if(shouldAddRightExclusivePart)
        ref.unmatchedRightIndexes.delete(rIndex);

      if(shouldAddInnerPart)
        yield merge(tuple as TupleType);
    }

    if(
      currentLeftEntryNeverPassedJoinCondition
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
