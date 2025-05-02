import type { _, joinNameToVennDiagramParts, joinNameToVennDiagramPartsWithoutAliases } from './constants.ts';


export type AllJoinNames = keyof typeof joinNameToVennDiagramParts;
export type AllJoinNamesWithoutAliases =
  keyof typeof joinNameToVennDiagramPartsWithoutAliases;

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
  }<...> accepts only single string literal and can't be union.`
;


/**
 * It's the 1st letter
 * - N - No element(empty/_). 1st element of the tuple is _
 * - L - Left element(L)    . 1st element of the tuple is L
 * - B - Both               . 1st element of the tuple is (_ | L)
 */
export type LeftTupleStructureCodePart = 'N' | 'L' | 'B';

/**
 * It's the 2nd letter
 * - N - No element(empty/_). 2nd element of the tuple is _
 * - R - Right element(R)   . 2nd element of the tuple is R
 * - B - Both               . 2nd element of the tuple is (_ | R)
 */
export type RightTupleStructureCodePart = 'N' | 'R' | 'B';

// 3rd letter

/**
 * This union represents 3 possible characteristics that can describe a certain
 * LR tuple. Each characteristic has a name and according short single letter
 * version.
 *
 * **1. `A` stands for `Atomic`.**
 *
 * These types represent either a single primitive LR tuple (e.g. `[L, R]`, `[_,
 * R]`, `[L, _]`) or a distributed union of them (e.g. `[L, R] | [_, R]`).
 * Distributed means that in each of the two slots of LR tuple there will be no
 * unions of _ (emptiness) and value (L or R, depending on the position inside a
 * tuple). There will be either one or the other.
 *
 * **2. `C` stands for `Compact`.**
 *
 * These types try to be as dense as possible. They can be a result of combining
 * atoms, but instead of being distributed, they try to pack unions of atomic LR
 * tuples with different values at some slot into a single LR tuple with a union
 * of different values at that slot. E.g. union of atoms `[L, R] | [_, R]` is
 * represented by Compact tuple `[_ | L, R]`. Slot inside of a compact LR tuple
 * will have either a union of emptiness and value, or something of those 2.
 *
 * **3. `E` stands for `Expanded`.**
 *
 * A union of all possible representations of LR tuple, the union of both Atomic
 * and Compact types.
 */
export type LevelOfDetailModifier = 'A' | 'C' | 'E';

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



export type And<
  ArrayOfValuesToCheck extends boolean[],
> = ArrayOfValuesToCheck extends [infer CurrentElement, ...infer Other extends boolean[]]
  ? [CurrentElement] extends [false]
    ? false
    : And<Other>
  : true;

export type Or<
  ArrayOfValuesToCheck extends boolean[],
> = ArrayOfValuesToCheck extends [infer CurrentElement, ...infer Other extends boolean[]]
  ? [CurrentElement] extends [true]
    ? true
    : And<Other>
  : false;




export type AreAllNotNever<
  ArrayOfValuesToCheck extends unknown[] | [],
  ReturnIfAllAreNotNever = true,
  ReturnIfAllSomeAreNever = false
> = ArrayOfValuesToCheck extends [infer CurrentElement, ...infer Other]
  ? [CurrentElement] extends [never]
    ? ReturnIfAllSomeAreNever
    : AreAllNotNever<Other, ReturnIfAllAreNotNever, ReturnIfAllSomeAreNever>
  : ReturnIfAllAreNotNever;


type Not<T extends boolean> = [T] extends [true] ? false : true;


type HasV<T> = Exclude<T, _> extends [never] ? true : false;
type Has_<T> = Extract<T, _> extends [never] ? true : false
type IsV<T>  = And<[HasV<T>, Not<Has_<T>>]>;
type Is_<T>  = And<[Has_<T>, Not<HasV<T>>]>;



type UnknownTuple = [unknown, unknown]

// `IS` is a precise match. If expected LBA<L, R>, `Tuple` should be precisely `[L, _] | [_, R]`
// `AssignableTo` is a loose match.

// ATOMS
export type IsLNA<Tuple extends UnknownTuple> = And<[IsV<Tuple[0]>, Is_<Tuple[1]>]>; // [L, _]
export type IsNRA<Tuple extends UnknownTuple> = And<[Is_<Tuple[0]>, IsV<Tuple[1]>]>; // [_, R]
export type IsLRA<Tuple extends UnknownTuple> = And<[IsV<Tuple[0]>, IsV<Tuple[1]>]>; // [L, R]

// To better understand atoms with letter B in code, see according compact
export type IsLBA<Tuple extends UnknownTuple> = And<[IsLNA<Tuple>, IsLRA<Tuple>]>;
export type IsBRA<Tuple extends UnknownTuple> = And<[IsNRA<Tuple>, IsLRA<Tuple>]>;
export type IsBBA<Tuple extends UnknownTuple> = And<[IsLNA<Tuple>, IsNRA<Tuple>, IsLRA<Tuple>]>;

// COMPACTED
export type IsLNC<Tuple extends UnknownTuple> = IsLNA<Tuple>;
export type IsNRC<Tuple extends UnknownTuple> = IsNRA<Tuple>;
export type IsLRC<Tuple extends UnknownTuple> = IsLRA<Tuple>;

export type IsLBC<Tuple extends UnknownTuple> = And<[IsV<Tuple[0]>, HasV<Tuple[1]>, Has_<Tuple[1]>]>; // [L    , R | _]
export type IsBRC<Tuple extends UnknownTuple> = And<[HasV<Tuple[0]>, Has_<Tuple[0]>, IsV<Tuple[1]>]>; // [L | _, R    ]
export type IsBBC<Tuple extends UnknownTuple> = And<[IsLBC<Tuple>, IsBRC<Tuple>]>

// EXPANDED
export type IsLNE<Tuple extends UnknownTuple> = IsLNA<Tuple>;
export type IsNRE<Tuple extends UnknownTuple> = IsNRA<Tuple>;
export type IsLRE<Tuple extends UnknownTuple> = IsLRA<Tuple>;

export type IsLBE<Tuple extends UnknownTuple> = And<[IsLBA<Tuple>, IsLBC<Tuple>]>;
export type IsBRE<Tuple extends UnknownTuple> = And<[IsBRA<Tuple>, IsBRC<Tuple>]>;
export type IsBBE<Tuple extends UnknownTuple> = And<[IsBBA<Tuple>, IsBBC<Tuple>]>;




type asd = IsBBC<[string | _, string | _]>





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


/**
 * Excluding `NN`, `NB` (`NN | NR`) and `BN` (`NN | LN`) doesn't mean there will
 * be no emptiness (unique symbol stored in constant named `_`) as values in the
 * result. It means that merge function will never get emptiness in both left
 * and right slot of the same tuple, because such merge is impossible
 */
export type TupleStructureCode = Exclude<
  `${LeftTupleStructureCodePart}${RightTupleStructureCodePart}`,
  'NN' | 'NB' | 'BN'
>;

export type TupleStructureCodeToDetailingModifierCombinations =
  `${TupleStructureCode}${LevelOfDetailModifier}`;


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
  Detailing extends LevelOfDetailModifier,
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
  LevelOfDetail extends LevelOfDetailModifier,
> = JoinOnVennDiagramParts<
  L,
  R,
  typeof joinNameToVennDiagramParts[JoinName],
  LevelOfDetail
>;



export type LeftExclusiveJoin <L, R, Detailing extends LevelOfDetailModifier> = JoinOnVennDiagramParts<L, R, '100', Detailing>;
export type InnerJoin         <L, R, Detailing extends LevelOfDetailModifier> = JoinOnVennDiagramParts<L, R, '010', Detailing>;
export type RightExclusiveJoin<L, R, Detailing extends LevelOfDetailModifier> = JoinOnVennDiagramParts<L, R, '001', Detailing>;
export type LeftJoin          <L, R, Detailing extends LevelOfDetailModifier> = JoinOnVennDiagramParts<L, R, '110', Detailing>;
export type RightJoin         <L, R, Detailing extends LevelOfDetailModifier> = JoinOnVennDiagramParts<L, R, '011', Detailing>;
export type FullJoin          <L, R, Detailing extends LevelOfDetailModifier> = JoinOnVennDiagramParts<L, R, '111', Detailing>;
export type FullExclusiveJoin <L, R, Detailing extends LevelOfDetailModifier> = JoinOnVennDiagramParts<L, R, '101', Detailing>;

export type LeftOuterJoin <L, R, Detailing extends LevelOfDetailModifier> = LeftJoin          <L, R, Detailing>;
export type RightOuterJoin<L, R, Detailing extends LevelOfDetailModifier> = RightJoin         <L, R, Detailing>;
export type FullOuterJoin <L, R, Detailing extends LevelOfDetailModifier> = FullJoin          <L, R, Detailing>;
export type LeftAntiJoin  <L, R, Detailing extends LevelOfDetailModifier> = LeftExclusiveJoin <L, R, Detailing>;
export type RightAntiJoin <L, R, Detailing extends LevelOfDetailModifier> = RightExclusiveJoin<L, R, Detailing>;
export type FullAntiJoin  <L, R, Detailing extends LevelOfDetailModifier> = FullExclusiveJoin <L, R, Detailing>;
export type Join          <L, R, Detailing extends LevelOfDetailModifier> = InnerJoin         <L, R, Detailing>;
export type SimpleJoin    <L, R, Detailing extends LevelOfDetailModifier> = InnerJoin         <L, R, Detailing>;
export type CrossJoin     <L, R, Detailing extends LevelOfDetailModifier> = InnerJoin         <L, R, Detailing>;
