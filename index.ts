import "@total-typescript/ts-reset";
import { join } from './joinOnJoinName';
import { joinOnEulerDiagramParts } from './joinOnEulerDiagramParts';


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




const left = new Set<A1>([
  { brand: brandA, id: 1, v: 6, requiredColumnSpecificToTypeA: brandA, requiredColumnTypeAgnostic: brandA },
  { brand: brandA, id: 2, v: 6, requiredColumnSpecificToTypeA: brandA, requiredColumnTypeAgnostic: brandA },
  { brand: brandA, id: 3, v: 7, requiredColumnSpecificToTypeA: brandA, requiredColumnTypeAgnostic: brandA },
  { brand: brandA, id: 4, v: 7, requiredColumnSpecificToTypeA: brandA, requiredColumnTypeAgnostic: brandA },
  { brand: brandA, id: 5, v: 9, requiredColumnSpecificToTypeA: brandA, requiredColumnTypeAgnostic: brandA }
])

const right = new Set<B1>([
  { brand: brandB, id: 1, v: 7 , requiredColumnSpecificToTypeB: brandB, requiredColumnTypeAgnostic: brandB },
  { brand: brandB, id: 2, v: 7 , requiredColumnSpecificToTypeB: brandB, requiredColumnTypeAgnostic: brandB },
  { brand: brandB, id: 3, v: 8 , requiredColumnSpecificToTypeB: brandB, requiredColumnTypeAgnostic: brandB },
  { brand: brandB, id: 4, v: 8 , requiredColumnSpecificToTypeB: brandB, requiredColumnTypeAgnostic: brandB },
  { brand: brandB, id: 5, v: 10, requiredColumnSpecificToTypeB: brandB, requiredColumnTypeAgnostic: brandB }
]);

for (const iterator of join(
  left,
  right,
  'leftJoin',
  // (tuple) => ({...(tuple[0] as object), ...(tuple[0] as object)}) as ((typeof tuple)[0] & (typeof tuple)[0]),
  asIsMerger,
  // getSpreadObjectMerger('{ ...A, ...B }'),
  (tuple) => tuple[0].v === tuple[1].v
)) {

}


for (const iterator of joinOnEulerDiagramParts(
  left,
  right,
  '110',
  // (tuple) => ({...(tuple[0] as object), ...(tuple[0] as object)}) as ((typeof tuple)[0] & (typeof tuple)[0]),
  asIsMerger,
  // getSpreadObjectMerger('{ ...A, ...B }'),
  (tuple) => tuple[0].v === tuple[1].v
)) {

}
