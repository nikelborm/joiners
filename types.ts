import type { _, joinNameToVennDiagramParts, joinNameToVennDiagramPartsWithoutAliases } from './constants';

export type _ = typeof _;

// TODO: define errors as unique symbol consts and return them from generic

export type Prettify<T> = { [P in keyof T]: T[P] } & {};
export type UnSet<T> = T extends Set<infer U> ? U : never;

// it's intentionally [Something] extends ['___'] so that if union of
// Something is passed, generic won't ignore all elements except the first
// element of the union. Generic will reject the whole union and throw
// error
export type ForbiddenLiteralUnion<
  Argument extends string,
  OfTypeName extends string
> =
  `Argument ${Argument} of ${
    OfTypeName
  }<...> accepts only single string literal (literal union is forbidden).`
;


// 1st letter:
export type LeftTupleStructureCodePart = 'N' | 'L' | 'B';
// N - No element(empty/_). 1st element of the tuple is _
// L - Left element(L)    . 1st element of the tuple is L
// B - Both               . 1st element of the tuple is (_ | L)

// 2nd letter:
export type RightTupleStructureCodePart = 'N' | 'R' | 'B';
// N - No element(empty/_). 2nd element of the tuple is _
// R - Right element(R)   . 2nd element of the tuple is R
// B - Both               . 2nd element of the tuple is (_ | R)

// 3rd letter
export type DetailingModifier = 'A' | 'C' | 'E';
// A - Atomic. Union of distributed LR tuple types. Distributed means that
// in each of the two slots of LR tuple there will be no unions of _
// (emptiness) and value (L or R, depending on the position inside a tuple)
// C - Compacted. The most high order representation of the combination of
// atoms. Slots inside the tuple are unions of emptiness and value.
// E - Expanded. A union of all possible representations of LR tuple, the
// union of both Atomic and Expanded types.



// ATOMS
export type LNA<L, R> = [L, _];
export type NRA<L, R> = [_, R];
export type LRA<L, R> = [L, R];

// To better understand atoms with letter B in code, see according
// compacted versions
export type LBA<L, R> = LNA<L, R> | LRA<L, R>;
export type BRA<L, R> = NRA<L, R> | LRA<L, R>;
export type BBA<L, R> = LNA<L, R> | NRA<L, R> | LRA<L, R>;

// COMPACTED
export type LNC<L, R> = LNA<L, R>;
export type NRC<L, R> = NRA<L, R>;
export type LRC<L, R> = LRA<L, R>;

export type LBC<L, R> = [L    , R | _];
export type BRC<L, R> = [L | _, R    ];
export type BBC<L, R> = LBC<L, R> | BRC<L, R>;

// EXPANDED
export type LNE<L, R> = LNA<L, R>;
export type NRE<L, R> = NRA<L, R>;
export type LRE<L, R> = LRA<L, R>;

export type LBE<L, R> = LBA<L, R> | LBC<L, R>;
export type BRE<L, R> = BRA<L, R> | BRC<L, R>;
export type BBE<L, R> = BBA<L, R> | BBC<L, R>;







export type FilterOne<
  Tuple extends [unknown, unknown],
  Pos extends 0 | 1
> = [Tuple[Pos]] extends [never] ? never : Tuple;



export type Filter<
  Tuple extends [unknown, unknown],
  By extends 'l-' | '-r' | 'lr'
> =
  [By] extends ['l-'] ? FilterOne<Tuple, 0> :
  [By] extends ['-r'] ? FilterOne<Tuple, 1> :
  [By] extends ['lr'] ? FilterOne<FilterOne<Tuple, 0>, 1> :
  ForbiddenLiteralUnion<'By', 'Filter'>
;

export type To_<T> = Extract<T, _>;
export type ToV<T> = Exclude<T, _>;

// ATOMS
export type ToLNA<L, R> = Filter<[ToV<L>, To_<R>], 'lr'>; // [L, _]
export type ToNRA<L, R> = Filter<[To_<L>, ToV<R>], 'lr'>; // [_, R]
export type ToLRA<L, R> = Filter<[ToV<L>, ToV<R>], 'lr'>; // [L, R]

// To better understand atoms with letter B in code, see according compact
export type ToLBA<L, R> = ToLNA<L, R> | ToLRA<L, R>;
export type ToBRA<L, R> = ToNRA<L, R> | ToLRA<L, R>;
export type ToBBA<L, R> = ToLNA<L, R> | ToNRA<L, R> | ToLRA<L, R>;

// COMPACTED
export type ToLNC<L, R> = ToLNA<L, R>;
export type ToNRC<L, R> = ToNRA<L, R>;
export type ToLRC<L, R> = ToLRA<L, R>;

export type ToLBC<L, R> = Filter<[ToV<L>, R     ], 'l-'>; // [L    , R | _]
export type ToBRC<L, R> = Filter<[L     , ToV<R>], '-r'>; // [L | _, R    ]
export type ToBBC<L, R> = ToLBC<L, R> | ToBRC<L, R>

// EXPANDED
export type ToLNE<L, R> = ToLNA<L, R>;
export type ToNRE<L, R> = ToNRA<L, R>;
export type ToLRE<L, R> = ToLRA<L, R>;

export type ToLBE<L, R> = ToLBA<L, R> | ToLBC<L, R>;
export type ToBRE<L, R> = ToBRA<L, R> | ToBRC<L, R>;
export type ToBBE<L, R> = ToBBA<L, R> | ToBBC<L, R>;










export type ShouldAddLeftExclusivePart = '0' | '1';
export type ShouldAddInnerPart = '0' | '1';
export type ShouldAddRightExclusivePart = '0' | '1';

export type VennDiagramPartsCombinations =
  Exclude<`${
    ShouldAddLeftExclusivePart
  }${
    ShouldAddInnerPart
  }${
    ShouldAddRightExclusivePart
  }`, '000'>
;



export type TupleStructureCodeBy<
  VennDiagramParts extends VennDiagramPartsCombinations
> =
  [VennDiagramParts] extends ['001'] ? 'NR' : // right join excluding inner
  [VennDiagramParts] extends ['010'] ? 'LR' : // inner join
  [VennDiagramParts] extends ['011'] ? 'BR' : // right outer join (right join)
  [VennDiagramParts] extends ['100'] ? 'LN' : // left join excluding inner
  [VennDiagramParts] extends ['101'] ? 'LN' | 'NR' : // full outer join excluding inner
  [VennDiagramParts] extends ['110'] ? 'LB' : // left outer join (left join)
  [VennDiagramParts] extends ['111'] ? 'BB' : // full outer join (full join)
  ForbiddenLiteralUnion<'VennDiagramParts', 'TupleStructureCodeBy'>
;

export type TupleStructureCodeAcceptingUnionBy<
  VennDiagramPartsUnion extends VennDiagramPartsCombinations
> =
  {
    '001': 'NR';
    '010': 'LR';
    '011': 'BR';
    '100': 'LN';
    '101': 'LN' | 'NR';
    '110': 'LB';
    '111': 'BB';
  }[VennDiagramPartsUnion]
;

export type TupleStructureCode = Exclude<
  `${LeftTupleStructureCodePart}${RightTupleStructureCodePart}`,
  'NN' | 'NB' | 'BN'
>;
// excluding NN, NB (== NN | NR) and BN (== NN | LN) doesn't mean there
// will be no nulls as values in the result. It means that merge function
// will never get EMPTINESS (unique symbol stored in constant named "_") in
// both left and right slot, because such merge is impossible

export type TupleStructureCodeToDetailingModifierCombinations =
  `${TupleStructureCode}${DetailingModifier}`;


export type SelectJoinedTuples<
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

export type SelectJoinedTuplesAcceptUnion<
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



export type JoinOnVennDiagramParts<
  L,
  R,
  VennDiagramParts extends VennDiagramPartsCombinations,
  Detailing extends DetailingModifier,
> =
  // TupleStructureCodeBy can return string literal describing the error
  // (thrown when VennDiagramParts consists of union like "001" | "010"
  // instead of single string literal like "010") and for that `extends
  // TupleStructureCode` was added.
  TupleStructureCodeBy<VennDiagramParts> extends infer U extends TupleStructureCode
    ? SelectJoinedTuplesAcceptUnion<L, R, `${U}${Detailing}`>
    : ForbiddenLiteralUnion<'VennDiagramParts', 'Joiner'>
;


export type JoinOnJoinName<
  L,
  R,
  JoinName extends AllJoinNames,
  Detailing extends DetailingModifier,
> = JoinOnVennDiagramParts<
  L,
  R,
  typeof joinNameToVennDiagramParts[JoinName],
  Detailing
>;



export type LeftExclusiveJoin <L, R, Detailing extends DetailingModifier> = JoinOnVennDiagramParts<L, R, '100', Detailing>;
export type InnerJoin         <L, R, Detailing extends DetailingModifier> = JoinOnVennDiagramParts<L, R, '010', Detailing>;
export type RightExclusiveJoin<L, R, Detailing extends DetailingModifier> = JoinOnVennDiagramParts<L, R, '001', Detailing>;
export type LeftJoin          <L, R, Detailing extends DetailingModifier> = JoinOnVennDiagramParts<L, R, '110', Detailing>;
export type RightJoin         <L, R, Detailing extends DetailingModifier> = JoinOnVennDiagramParts<L, R, '011', Detailing>;
export type FullJoin          <L, R, Detailing extends DetailingModifier> = JoinOnVennDiagramParts<L, R, '111', Detailing>;
export type FullExclusiveJoin <L, R, Detailing extends DetailingModifier> = JoinOnVennDiagramParts<L, R, '101', Detailing>;

export type LeftOuterJoin <L, R, Detailing extends DetailingModifier> = LeftJoin          <L, R, Detailing>;
export type RightOuterJoin<L, R, Detailing extends DetailingModifier> = RightJoin         <L, R, Detailing>;
export type FullOuterJoin <L, R, Detailing extends DetailingModifier> = FullJoin          <L, R, Detailing>;
export type LeftAntiJoin  <L, R, Detailing extends DetailingModifier> = LeftExclusiveJoin <L, R, Detailing>;
export type RightAntiJoin <L, R, Detailing extends DetailingModifier> = RightExclusiveJoin<L, R, Detailing>;
export type FullAntiJoin  <L, R, Detailing extends DetailingModifier> = FullExclusiveJoin <L, R, Detailing>;
export type Join          <L, R, Detailing extends DetailingModifier> = InnerJoin         <L, R, Detailing>;
export type SimpleJoin    <L, R, Detailing extends DetailingModifier> = InnerJoin         <L, R, Detailing>;
export type CrossJoin     <L, R, Detailing extends DetailingModifier> = InnerJoin         <L, R, Detailing>;

export type AllJoinNames = keyof typeof joinNameToVennDiagramParts;
export type AllJoinNamesWithoutAliases =
  keyof typeof joinNameToVennDiagramPartsWithoutAliases;
