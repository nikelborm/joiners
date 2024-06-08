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




const left = new Array([1, 2, 3, 4]);
const right = new Array([3, 4, 5, 6]);



// comparator = (l, r) => l === r;

function isEmpty<T>(v: T): v is to_<T> {
  return v === _;
}

function isNotEmpty<T>(v: T): v is toV<T> {
  return v !== _;
}


function castToBBA<L, R>(lr: [unknown, unknown]): asserts lr is BBA<L, R> {
  // TODO: check l is L and r is R

  const [l, r] = lr;

  if(
    (isEmpty   (l) && isEmpty   (r)) ||
    (isEmpty   (l) && isNotEmpty(r)) ||
    (isNotEmpty(l) && isEmpty   (r)) ||
    (isNotEmpty(l) && isNotEmpty(r))
  ) return;

  throw new Error(`What the actual fuck??? lr is ${lr}`);
}

function * getAllCombinationsByEulerDiagramParts<
  const Detailing extends DetailingModifier,
  const EulerDiagramParts extends EulerDiagramPartsCombinations,
  L,
  R,
  ReturnedType = Joiner<L, R, EulerDiagramParts, Detailing>
>(
  left: Iterable<L>,
  right: Iterable<R>,
  eulerDiagramParts: EulerDiagramParts,
  detailingModifier: Detailing = 'A' as Detailing
): Generator<ReturnedType> {
  const bits = parseInt(eulerDiagramParts, 2);

  if(bits & 0b100) {
    for (const l of left) {
      yield ([l, _] satisfies LNA<L, R>) as ReturnedType;
    }
  }

  if(bits & 0b001) {
    for (const r of right) {
      yield ([_, r] satisfies NRA<L, R>) as ReturnedType;
    }
  }

  if(bits & 0b010) {
    for (const l of left) {
      for (const r of right) {
        yield ([l, r] satisfies LRA<L, R>) as ReturnedType;
      }
    }
  }
}

function getComparator() {}

for (const tuple of getAllCombinationsByEulerDiagramParts(
  [1, 2],
  [2, 3],
  '111',
  'A'
)) {
  console.log(tuple);

}



// function * join<
//   const Detailing extends DetailingModifier,
//   const EulerDiagramParts extends EulerDiagramPartsCombinations,
//   L,
//   R,
//   TupleType = Joiner<L, R, EulerDiagramParts, Detailing>
// >(
//   left: Iterable<L>,
//   right: Iterable<R>,
//   compare: (tuple: LRA<L, R>) => boolean,
//   merge: (tuple: TupleType) => boolean,
// ) {
//   for (const l of left) {
//     for (const r of right) {
//       const tuple = [l, r] satisfies LRA<L, R>;
//       if(compare(tuple)) {
//         yield ( satisfies LRA<L, R>) as TupleType;
//       }

//     }
//   }
// }
