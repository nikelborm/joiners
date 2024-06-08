import { Equals, assert, is } from 'tsafe';

const _ = Symbol('emptiness');
type _ = typeof _;

export type Merge<T> = { [P in keyof T]: T[P] } & {};

// it's intentionally [Flags] extends ['___'] so that if union of flags
// is passed, it won't ignore all elements except the first element of the
// union. It will reject the whole union and throw error
type ForbiddenLiteralUnion<
  Argument extends string,
  OfTypeName extends string
> =
  `Argument ${Argument} of ${
    OfTypeName
  }<...> accepts only single string literal (literal union is forbidden).`
;

const left = new Set([1, 2, 3, 4]);
const right = new Set([3, 4, 5, 6]);


// 3rd letter
type DetailingModifier = 'A' | 'C' | 'E';
// A - Atomic. Union of narrowest LR tuple types. Narrowest means that
// elements of the LR tuple are not unions and either _ or value (L or R,
// depending on the position)
// C - Compacted. The most high order representation of the combination
// of atoms.
// E - Expanded. Union of all possible representations of compacted tuple

// 1st letter:
type LeftTupleStructureCodePart = 'N' | 'L' | 'B';
// N - No element(empty/_). 1st element of the tuple is _
// L - Left element(L)    . 1st element of the tuple is L
// B - Both               . 1st element of the tuple is (_ | L)

// 2nd letter:
type RightTupleStructureCodePart = 'N' | 'R' | 'B';
// N - No element(empty/_). 2nd element of the tuple is _
// R - Right element(R)   . 2nd element of the tuple is R
// B - Both               . 2nd element of the tuple is (_ | R)



// ATOMS
type LNA<L, R> = [L, _];
type NRA<L, R> = [_, R];
type LRA<L, R> = [L, R];

// To better understand atoms with letter B in code, see according compacted
type LBA<L, R> = LNA<L, R> | LRA<L, R>;
type BRA<L, R> = NRA<L, R> | LRA<L, R>;
type BBA<L, R> = LNA<L, R> | NRA<L, R> | LRA<L, R>;

// COMPACTED
type LNC<L, R> = LNA<L, R>;
type NRC<L, R> = NRA<L, R>;
type LRC<L, R> = LRA<L, R>;

type LBC<L, R> = [L    , R | _];
type BRC<L, R> = [L | _, R    ];
type BBC<L, R> = LBC<L, R> | BRC<L, R>;

// EXPANDED
type LNE<L, R> = LNA<L, R>;
type NRE<L, R> = NRA<L, R>;
type LRE<L, R> = LRA<L, R>;

type LBE<L, R> = LBA<L, R> | LBC<L, R>;
type BRE<L, R> = BRA<L, R> | BRC<L, R>;
type BBE<L, R> = BBA<L, R> | BBC<L, R>;







type FilterOne<
  Tuple extends [any, any],
  Pos extends 0 | 1
> = [Tuple[Pos]] extends [never] ? never : Tuple;



type Filter<
  Tuple extends [any, any],
  By extends 'l-' | '-r' | 'lr'
> =
  [By] extends ['l-'] ? FilterOne<Tuple, 0> :
  [By] extends ['-r'] ? FilterOne<Tuple, 1> :
  [By] extends ['lr'] ? FilterOne<FilterOne<Tuple, 0>, 1> :
  ForbiddenLiteralUnion<'By', 'Filter<Tuple, By>'>
;

type to_<T> = Extract<T, _>;
type toV<T> = Exclude<T, _>;

// ATOMS
type toLNA<L, R> = Filter<[toV<L>, to_<R>], 'lr'>; // [L, _];
type toNRA<L, R> = Filter<[to_<L>, toV<R>], 'lr'>; // [_, R];
type toLRA<L, R> = Filter<[toV<L>, toV<R>], 'lr'>; // [L, R];

// To better understand atoms with letter B in code, see according compact
type toLBA<L, R> = toLNA<L, R> | toLRA<L, R>;
type toBRA<L, R> = toNRA<L, R> | toLRA<L, R>;
type toBBA<L, R> = toLNA<L, R> | toNRA<L, R> | toLRA<L, R>;

// COMPACTED
type toLNC<L, R> = toLNA<L, R>;
type toNRC<L, R> = toNRA<L, R>;
type toLRC<L, R> = toLRA<L, R>;

type toLBC<L, R> = Filter<[toV<L>, R     ], 'l-'>; // [L    , R | _];
type toBRC<L, R> = Filter<[L     , toV<R>], '-r'>; // [L | _, R    ];
type toBBC<L, R> = toLBC<L, R> | toBRC<L, R>

// EXPANDED
type toLNE<L, R> = toLNA<L, R>;
type toNRE<L, R> = toNRA<L, R>;
type toLRE<L, R> = toLRA<L, R>;

type toLBE<L, R> = toLBA<L, R> | toLBC<L, R>;
type toBRE<L, R> = toBRA<L, R> | toBRC<L, R>;
type toBBE<L, R> = toBBA<L, R> | toBBC<L, R>;










type ShouldAddLeftExclusivePart = '0' | '1';
type ShouldAddInnerPart = '0' | '1';
type ShouldAddRightExclusivePart = '0' | '1';

type EulerDiagramPartsCombinations =
  Exclude<`${
    ShouldAddLeftExclusivePart
  }${
    ShouldAddInnerPart
  }${
    ShouldAddRightExclusivePart
  }`, '000'>
;



type TupleStructureCodeBy<
  EulerDiagramParts extends EulerDiagramPartsCombinations
> =
  [EulerDiagramParts] extends ['001'] ? 'NR' : // right join excluding inner
  [EulerDiagramParts] extends ['010'] ? 'LR' : // inner join
  [EulerDiagramParts] extends ['011'] ? 'BR' : // right outer join (right join)
  [EulerDiagramParts] extends ['100'] ? 'LN' : // left join excluding inner
  [EulerDiagramParts] extends ['101'] ? 'LN' | 'NR' : // full outer join excluding inner
  [EulerDiagramParts] extends ['110'] ? 'LB' : // left outer join (left join)
  [EulerDiagramParts] extends ['111'] ? 'BB' : // full outer join (full join)
  ForbiddenLiteralUnion<'EulerDiagramParts', 'TupleStructureCodeBy'>
;

type TupleStructureCodeAcceptingUnionBy<
  EulerDiagramPartsUnion extends EulerDiagramPartsCombinations
> =
  {
    '001': 'NR';
    '010': 'LR';
    '011': 'BR';
    '100': 'LN';
    '101': 'LN' | 'NR';
    '110': 'LB';
    '111': 'BB';
  }[EulerDiagramPartsUnion]
;

type TupleStructureCode = Exclude<
  `${LeftTupleStructureCodePart}${RightTupleStructureCodePart}`,
  'NN' | 'NB' | 'BN'
>;

type TupleStructureCodeToDetailingModifierCombinations =
  `${TupleStructureCode}${DetailingModifier}`;


type SelectJoinedTuples<
  L,
  R,
  Comb extends TupleStructureCodeToDetailingModifierCombinations
> =
  [Comb] extends ['LNA'] ? LNA<L, R> :
  [Comb] extends ['NRA'] ? NRA<L, R> :
  [Comb] extends ['LRA'] ? LRA<L, R> :
  [Comb] extends ['LBA'] ? LBA<L, R> :
  [Comb] extends ['BRA'] ? BRA<L, R> :
  [Comb] extends ['BBA'] ? BBA<L, R> :
  [Comb] extends ['LNC'] ? LNC<L, R> :
  [Comb] extends ['NRC'] ? NRC<L, R> :
  [Comb] extends ['LRC'] ? LRC<L, R> :
  [Comb] extends ['LBC'] ? LBC<L, R> :
  [Comb] extends ['BRC'] ? BRC<L, R> :
  [Comb] extends ['BBC'] ? BBC<L, R> :
  [Comb] extends ['LNE'] ? LNE<L, R> :
  [Comb] extends ['NRE'] ? NRE<L, R> :
  [Comb] extends ['LRE'] ? LRE<L, R> :
  [Comb] extends ['LBE'] ? LBE<L, R> :
  [Comb] extends ['BRE'] ? BRE<L, R> :
  [Comb] extends ['BBE'] ? BBE<L, R> :
  ForbiddenLiteralUnion<'Comb', 'SelectJoinedTuples'>
;

type SelectJoinedTuplesAcceptUnion<
  L,
  R,
  CombUnion extends TupleStructureCodeToDetailingModifierCombinations
> = {
  'LNA': LNA<L, R>;
  'NRA': NRA<L, R>;
  'LRA': LRA<L, R>;
  'LBA': LBA<L, R>;
  'BRA': BRA<L, R>;
  'BBA': BBA<L, R>;
  'LNC': LNC<L, R>;
  'NRC': NRC<L, R>;
  'LRC': LRC<L, R>;
  'LBC': LBC<L, R>;
  'BRC': BRC<L, R>;
  'BBC': BBC<L, R>;
  'LNE': LNE<L, R>;
  'NRE': NRE<L, R>;
  'LRE': LRE<L, R>;
  'LBE': LBE<L, R>;
  'BRE': BRE<L, R>;
  'BBE': BBE<L, R>;
}[CombUnion];



type Joiner<
  L,
  R,
  EulerDiagramParts extends EulerDiagramPartsCombinations,
  Detailing extends DetailingModifier,
> =
  TupleStructureCodeBy<EulerDiagramParts> extends TupleStructureCode
    ? Merge<SelectJoinedTuplesAcceptUnion<
      L,
      R,
      `${TupleStructureCodeBy<EulerDiagramParts>}${Detailing}`
    >>
    : ForbiddenLiteralUnion<'EulerDiagramParts', 'Joiner'>
;

const A = Symbol('A');
const B = Symbol('B');
type A = typeof A;
type B = typeof B;

assert<Equals<LeftExclusiveJoin <A, B>,  [A, _]>>();
assert<Equals<InnerJoin         <A, B>,  [A, B]>>();
assert<Equals<RightExclusiveJoin<A, B>,  [_, B]>>();
assert<Equals<LeftJoin          <A, B>,  [A, B] | [A, _] | [A,     B | _]>>();
assert<Equals<RightJoin         <A, B>,  [A, B] | [_, B] | [A | _, B    ]>>();
assert<Equals<FullExclusiveJoin <A, B>,  [A, _] | [_, B]>>();
assert<Equals<FullJoin<A, B>,
  | [A, B]
  | [A, _]
  | [_, B]
  | [A | _, B    ]
  | [A,     B | _]
>>();



type LeftExclusiveJoin <L, R> = Joiner<L, R, '100', 'E'>;
type InnerJoin         <L, R> = Joiner<L, R, '010', 'E'>;
type RightExclusiveJoin<L, R> = Joiner<L, R, '001', 'E'>;
type LeftJoin          <L, R> = Joiner<L, R, '110', 'E'>;
type RightJoin         <L, R> = Joiner<L, R, '011', 'E'>;
type FullJoin          <L, R> = Joiner<L, R, '111', 'E'>;
type FullExclusiveJoin <L, R> = Joiner<L, R, '101', 'E'>;
type LeftOuterJoin<L, R> = LeftJoin<L, R>;
type RightOuterJoin<L, R> = RightJoin<L, R>;
type FullOuterJoin<L, R> = FullJoin<L, R>;


// comparator = (l, r) => l === r;

function isEmpty<T>(v: T): v is to_<T> {
  return v === _;
}

function isNotEmpty<T>(v: T): v is toV<T> {
  return v !== _;
}

type helper<LettersUnion extends TupleStructureCodeToDetailingModifierCombinations> =
  Merge<SelectJoinedTuples<number, string, LettersUnion>>
;

const nr = [_, 's'] as helper<'NRA'>;
const ln = [1, _  ] as helper<'LNA'>;
const lr = [1, 's'] as helper<'LRA'>;
const lb = [1, '1'] as helper<'LBA'>;
const br = [_, '1'] as helper<'BRA'>;
const bb = [1, '1'] as helper<'BBA'>;


let test = nr[0]


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
  Detailing extends DetailingModifier,
  const EulerDiagramParts extends EulerDiagramPartsCombinations,
  L,
  R,
  ReturnType = Joiner<L, R, EulerDiagramParts, Detailing>
>(
  left: Set<L>,
  right: Set<R>,
  eulerDiagramParts: EulerDiagramParts,
  detailingModifier: DetailingModifier = 'A'
): Generator<ReturnType> {
  const bits = parseInt(eulerDiagramParts, 2);

  if(bits & 0b100) {
    for (const l of left) {
      yield ([l, _] satisfies LNA<L, R>) as ReturnType;
    }
  }

  if(bits & 0b001) {
    for (const r of right) {
      yield ([_, r] satisfies NRA<L, R>) as ReturnType;
    }
  }

  if(bits & 0b010) {
    for (const l of left) {
      for (const r of right) {
        yield ([l, r] satisfies LRA<L, R>) as ReturnType;
      }
    }
  }
}

const generator = getAllCombinationsByEulerDiagramParts(
  new Set(['12']),
  new Set([12]),
  '101'
)


for (const tuple of generator) {

}





let asd: FullOuterJoin<number, string>;
asd = [123, _]

function join<L, R>(
  left: Set<L>,
  right: Set<R>,
  compare: (l: L, r: R) => boolean,
  merge: (l: L, r: R) => boolean,
) {}
