import type { _, joinNameToVennDiagramParts, joinNameToVennDiagramPartsWithoutAliases } from './constants.ts';
import { type Equals, assert } from 'tsafe';


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
  ArrayOfValuesToCheck,
> = ArrayOfValuesToCheck extends [infer CurrentElement, ...infer Other]
  ? [CurrentElement] extends [false]
    ? false
    : And<Other>
  : true;

export type Or<
  ArrayOfValuesToCheck,
> = ArrayOfValuesToCheck extends [infer CurrentElement, ...infer Other]
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


type HasV<T> = [Exclude<T, _>] extends [never] ? false : true;
type Has_<T> = [Extract<T, _>] extends [never] ? false : true;
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



type L = 'L';
type R = 'R';



assert<Equals<IsLNA<LNA<L, R>>, true >>;
assert<Equals<IsLNA<NRA<L, R>>, false >>;
assert<Equals<IsLNA<LRA<L, R>>, false >>;
assert<Equals<IsLNA<LBA<L, R>>, false >>;
assert<Equals<IsLNA<BRA<L, R>>, false >>;
assert<Equals<IsLNA<BBA<L, R>>, false >>;
assert<Equals<IsLNA<LNC<L, R>>, true >>;
assert<Equals<IsLNA<NRC<L, R>>, false >>;
assert<Equals<IsLNA<LRC<L, R>>, false >>;
assert<Equals<IsLNA<LBC<L, R>>, false >>;
assert<Equals<IsLNA<BRC<L, R>>, false >>;
assert<Equals<IsLNA<BBC<L, R>>, false >>;
assert<Equals<IsLNA<LNE<L, R>>, true >>;
assert<Equals<IsLNA<NRE<L, R>>, false >>;
assert<Equals<IsLNA<LRE<L, R>>, false >>;
assert<Equals<IsLNA<LBE<L, R>>, false >>;
assert<Equals<IsLNA<BRE<L, R>>, false >>;
assert<Equals<IsLNA<BBE<L, R>>, false >>;

assert<Equals<IsNRA<LNA<L, R>>, false >>;
assert<Equals<IsNRA<NRA<L, R>>, true >>;
assert<Equals<IsNRA<LRA<L, R>>, false >>;
assert<Equals<IsNRA<LBA<L, R>>, false >>;
assert<Equals<IsNRA<BRA<L, R>>, false >>;
assert<Equals<IsNRA<BBA<L, R>>, false >>;
assert<Equals<IsNRA<LNC<L, R>>, false >>;
assert<Equals<IsNRA<NRC<L, R>>, true >>;
assert<Equals<IsNRA<LRC<L, R>>, false >>;
assert<Equals<IsNRA<LBC<L, R>>, false >>;
assert<Equals<IsNRA<BRC<L, R>>, false >>;
assert<Equals<IsNRA<BBC<L, R>>, false >>;
assert<Equals<IsNRA<LNE<L, R>>, false >>;
assert<Equals<IsNRA<NRE<L, R>>, true >>;
assert<Equals<IsNRA<LRE<L, R>>, false >>;
assert<Equals<IsNRA<LBE<L, R>>, false >>;
assert<Equals<IsNRA<BRE<L, R>>, false >>;
assert<Equals<IsNRA<BBE<L, R>>, false >>;

assert<Equals<IsLRA<LNA<L, R>>, false >>;
assert<Equals<IsLRA<NRA<L, R>>, false >>;
assert<Equals<IsLRA<LRA<L, R>>, true >>;
assert<Equals<IsLRA<LBA<L, R>>, false >>;
assert<Equals<IsLRA<BRA<L, R>>, false >>;
assert<Equals<IsLRA<BBA<L, R>>, false >>;
assert<Equals<IsLRA<LNC<L, R>>, false >>;
assert<Equals<IsLRA<NRC<L, R>>, false >>;
assert<Equals<IsLRA<LRC<L, R>>, true >>;
assert<Equals<IsLRA<LBC<L, R>>, false >>;
assert<Equals<IsLRA<BRC<L, R>>, false >>;
assert<Equals<IsLRA<BBC<L, R>>, false >>;
assert<Equals<IsLRA<LNE<L, R>>, false >>;
assert<Equals<IsLRA<NRE<L, R>>, false >>;
assert<Equals<IsLRA<LRE<L, R>>, true >>;
assert<Equals<IsLRA<LBE<L, R>>, false >>;
assert<Equals<IsLRA<BRE<L, R>>, false >>;
assert<Equals<IsLRA<BBE<L, R>>, false >>;

assert<Equals<IsLBA<LNA<L, R>>, false >>;
assert<Equals<IsLBA<NRA<L, R>>, false >>;
assert<Equals<IsLBA<LRA<L, R>>, false >>;
assert<Equals<IsLBA<LBA<L, R>>, true >>;
assert<Equals<IsLBA<BRA<L, R>>, false >>;
assert<Equals<IsLBA<BBA<L, R>>, false >>;
assert<Equals<IsLBA<LNC<L, R>>, false >>;
assert<Equals<IsLBA<NRC<L, R>>, false >>;
assert<Equals<IsLBA<LRC<L, R>>, false >>;
assert<Equals<IsLBA<LBC<L, R>>, false >>;
assert<Equals<IsLBA<BRC<L, R>>, false >>;
assert<Equals<IsLBA<BBC<L, R>>, false >>;
assert<Equals<IsLBA<LNE<L, R>>, false >>;
assert<Equals<IsLBA<NRE<L, R>>, false >>;
assert<Equals<IsLBA<LRE<L, R>>, false >>;
assert<Equals<IsLBA<LBE<L, R>>, false >>;
assert<Equals<IsLBA<BRE<L, R>>, false >>;
assert<Equals<IsLBA<BBE<L, R>>, false >>;

assert<Equals<IsBRA<LNA<L, R>>, false >>;
assert<Equals<IsBRA<NRA<L, R>>, false >>;
assert<Equals<IsBRA<LRA<L, R>>, false >>;
assert<Equals<IsBRA<LBA<L, R>>, false >>;
assert<Equals<IsBRA<BRA<L, R>>, true >>;
assert<Equals<IsBRA<BBA<L, R>>, false >>;
assert<Equals<IsBRA<LNC<L, R>>, false >>;
assert<Equals<IsBRA<NRC<L, R>>, false >>;
assert<Equals<IsBRA<LRC<L, R>>, false >>;
assert<Equals<IsBRA<LBC<L, R>>, false >>;
assert<Equals<IsBRA<BRC<L, R>>, false >>;
assert<Equals<IsBRA<BBC<L, R>>, false >>;
assert<Equals<IsBRA<LNE<L, R>>, false >>;
assert<Equals<IsBRA<NRE<L, R>>, false >>;
assert<Equals<IsBRA<LRE<L, R>>, false >>;
assert<Equals<IsBRA<LBE<L, R>>, false >>;
assert<Equals<IsBRA<BRE<L, R>>, false >>;
assert<Equals<IsBRA<BBE<L, R>>, false >>;

assert<Equals<IsBBA<LNA<L, R>>, false >>;
assert<Equals<IsBBA<NRA<L, R>>, false >>;
assert<Equals<IsBBA<LRA<L, R>>, false >>;
assert<Equals<IsBBA<LBA<L, R>>, false >>;
assert<Equals<IsBBA<BRA<L, R>>, false >>;
assert<Equals<IsBBA<BBA<L, R>>, true >>;
assert<Equals<IsBBA<LNC<L, R>>, false >>;
assert<Equals<IsBBA<NRC<L, R>>, false >>;
assert<Equals<IsBBA<LRC<L, R>>, false >>;
assert<Equals<IsBBA<LBC<L, R>>, false >>;
assert<Equals<IsBBA<BRC<L, R>>, false >>;
assert<Equals<IsBBA<BBC<L, R>>, false >>;
assert<Equals<IsBBA<LNE<L, R>>, false >>;
assert<Equals<IsBBA<NRE<L, R>>, false >>;
assert<Equals<IsBBA<LRE<L, R>>, false >>;
assert<Equals<IsBBA<LBE<L, R>>, false >>;
assert<Equals<IsBBA<BRE<L, R>>, false >>;
assert<Equals<IsBBA<BBE<L, R>>, false >>;

assert<Equals<IsLNC<LNA<L, R>>, true >>;
assert<Equals<IsLNC<NRA<L, R>>, false >>;
assert<Equals<IsLNC<LRA<L, R>>, false >>;
assert<Equals<IsLNC<LBA<L, R>>, false >>;
assert<Equals<IsLNC<BRA<L, R>>, false >>;
assert<Equals<IsLNC<BBA<L, R>>, false >>;
assert<Equals<IsLNC<LNC<L, R>>, true >>;
assert<Equals<IsLNC<NRC<L, R>>, false >>;
assert<Equals<IsLNC<LRC<L, R>>, false >>;
assert<Equals<IsLNC<LBC<L, R>>, false >>;
assert<Equals<IsLNC<BRC<L, R>>, false >>;
assert<Equals<IsLNC<BBC<L, R>>, false >>;
assert<Equals<IsLNC<LNE<L, R>>, true >>;
assert<Equals<IsLNC<NRE<L, R>>, false >>;
assert<Equals<IsLNC<LRE<L, R>>, false >>;
assert<Equals<IsLNC<LBE<L, R>>, false >>;
assert<Equals<IsLNC<BRE<L, R>>, false >>;
assert<Equals<IsLNC<BBE<L, R>>, false >>;

assert<Equals<IsNRC<LNA<L, R>>, false >>;
assert<Equals<IsNRC<NRA<L, R>>, true >>;
assert<Equals<IsNRC<LRA<L, R>>, false >>;
assert<Equals<IsNRC<LBA<L, R>>, false >>;
assert<Equals<IsNRC<BRA<L, R>>, false >>;
assert<Equals<IsNRC<BBA<L, R>>, false >>;
assert<Equals<IsNRC<LNC<L, R>>, false >>;
assert<Equals<IsNRC<NRC<L, R>>, true >>;
assert<Equals<IsNRC<LRC<L, R>>, false >>;
assert<Equals<IsNRC<LBC<L, R>>, false >>;
assert<Equals<IsNRC<BRC<L, R>>, false >>;
assert<Equals<IsNRC<BBC<L, R>>, false >>;
assert<Equals<IsNRC<LNE<L, R>>, false >>;
assert<Equals<IsNRC<NRE<L, R>>, true >>;
assert<Equals<IsNRC<LRE<L, R>>, false >>;
assert<Equals<IsNRC<LBE<L, R>>, false >>;
assert<Equals<IsNRC<BRE<L, R>>, false >>;
assert<Equals<IsNRC<BBE<L, R>>, false >>;

assert<Equals<IsLRC<LNA<L, R>>, false >>;
assert<Equals<IsLRC<NRA<L, R>>, false >>;
assert<Equals<IsLRC<LRA<L, R>>, true >>;
assert<Equals<IsLRC<LBA<L, R>>, false >>;
assert<Equals<IsLRC<BRA<L, R>>, false >>;
assert<Equals<IsLRC<BBA<L, R>>, false >>;
assert<Equals<IsLRC<LNC<L, R>>, false >>;
assert<Equals<IsLRC<NRC<L, R>>, false >>;
assert<Equals<IsLRC<LRC<L, R>>, true >>;
assert<Equals<IsLRC<LBC<L, R>>, false >>;
assert<Equals<IsLRC<BRC<L, R>>, false >>;
assert<Equals<IsLRC<BBC<L, R>>, false >>;
assert<Equals<IsLRC<LNE<L, R>>, false >>;
assert<Equals<IsLRC<NRE<L, R>>, false >>;
assert<Equals<IsLRC<LRE<L, R>>, true >>;
assert<Equals<IsLRC<LBE<L, R>>, false >>;
assert<Equals<IsLRC<BRE<L, R>>, false >>;
assert<Equals<IsLRC<BBE<L, R>>, false >>;

assert<Equals<IsLBC<LNA<L, R>>, false >>;
assert<Equals<IsLBC<NRA<L, R>>, false >>;
assert<Equals<IsLBC<LRA<L, R>>, false >>;
assert<Equals<IsLBC<LBA<L, R>>, false >>;
assert<Equals<IsLBC<BRA<L, R>>, false >>;
assert<Equals<IsLBC<BBA<L, R>>, false >>;
assert<Equals<IsLBC<LNC<L, R>>, false >>;
assert<Equals<IsLBC<NRC<L, R>>, false >>;
assert<Equals<IsLBC<LRC<L, R>>, false >>;
assert<Equals<IsLBC<LBC<L, R>>, true >>;
assert<Equals<IsLBC<BRC<L, R>>, false >>;
assert<Equals<IsLBC<BBC<L, R>>, false >>;
assert<Equals<IsLBC<LNE<L, R>>, false >>;
assert<Equals<IsLBC<NRE<L, R>>, false >>;
assert<Equals<IsLBC<LRE<L, R>>, false >>;
assert<Equals<IsLBC<LBE<L, R>>, false >>;
assert<Equals<IsLBC<BRE<L, R>>, false >>;
assert<Equals<IsLBC<BBE<L, R>>, false >>;

assert<Equals<IsBRC<LNA<L, R>>, false >>;
assert<Equals<IsBRC<NRA<L, R>>, false >>;
assert<Equals<IsBRC<LRA<L, R>>, false >>;
assert<Equals<IsBRC<LBA<L, R>>, false >>;
assert<Equals<IsBRC<BRA<L, R>>, false >>;
assert<Equals<IsBRC<BBA<L, R>>, false >>;
assert<Equals<IsBRC<LNC<L, R>>, false >>;
assert<Equals<IsBRC<NRC<L, R>>, false >>;
assert<Equals<IsBRC<LRC<L, R>>, false >>;
assert<Equals<IsBRC<LBC<L, R>>, false >>;
assert<Equals<IsBRC<BRC<L, R>>, true >>;
assert<Equals<IsBRC<BBC<L, R>>, false >>;
assert<Equals<IsBRC<LNE<L, R>>, false >>;
assert<Equals<IsBRC<NRE<L, R>>, false >>;
assert<Equals<IsBRC<LRE<L, R>>, false >>;
assert<Equals<IsBRC<LBE<L, R>>, false >>;
assert<Equals<IsBRC<BRE<L, R>>, false >>;
assert<Equals<IsBRC<BBE<L, R>>, false >>;

assert<Equals<IsBBC<LNA<L, R>>, false >>;
assert<Equals<IsBBC<NRA<L, R>>, false >>;
assert<Equals<IsBBC<LRA<L, R>>, false >>;
assert<Equals<IsBBC<LBA<L, R>>, false >>;
assert<Equals<IsBBC<BRA<L, R>>, false >>;
assert<Equals<IsBBC<BBA<L, R>>, false >>;
assert<Equals<IsBBC<LNC<L, R>>, false >>;
assert<Equals<IsBBC<NRC<L, R>>, false >>;
assert<Equals<IsBBC<LRC<L, R>>, false >>;
assert<Equals<IsBBC<LBC<L, R>>, false >>;
assert<Equals<IsBBC<BRC<L, R>>, false >>;
assert<Equals<IsBBC<BBC<L, R>>, true >>;
assert<Equals<IsBBC<LNE<L, R>>, false >>;
assert<Equals<IsBBC<NRE<L, R>>, false >>;
assert<Equals<IsBBC<LRE<L, R>>, false >>;
assert<Equals<IsBBC<LBE<L, R>>, false >>;
assert<Equals<IsBBC<BRE<L, R>>, false >>;
assert<Equals<IsBBC<BBE<L, R>>, false >>;

assert<Equals<IsLNE<LNA<L, R>>, true >>;
assert<Equals<IsLNE<NRA<L, R>>, false >>;
assert<Equals<IsLNE<LRA<L, R>>, false >>;
assert<Equals<IsLNE<LBA<L, R>>, false >>;
assert<Equals<IsLNE<BRA<L, R>>, false >>;
assert<Equals<IsLNE<BBA<L, R>>, false >>;
assert<Equals<IsLNE<LNC<L, R>>, true >>;
assert<Equals<IsLNE<NRC<L, R>>, false >>;
assert<Equals<IsLNE<LRC<L, R>>, false >>;
assert<Equals<IsLNE<LBC<L, R>>, false >>;
assert<Equals<IsLNE<BRC<L, R>>, false >>;
assert<Equals<IsLNE<BBC<L, R>>, false >>;
assert<Equals<IsLNE<LNE<L, R>>, true >>;
assert<Equals<IsLNE<NRE<L, R>>, false >>;
assert<Equals<IsLNE<LRE<L, R>>, false >>;
assert<Equals<IsLNE<LBE<L, R>>, false >>;
assert<Equals<IsLNE<BRE<L, R>>, false >>;
assert<Equals<IsLNE<BBE<L, R>>, false >>;

assert<Equals<IsNRE<LNA<L, R>>, false >>;
assert<Equals<IsNRE<NRA<L, R>>, true >>;
assert<Equals<IsNRE<LRA<L, R>>, false >>;
assert<Equals<IsNRE<LBA<L, R>>, false >>;
assert<Equals<IsNRE<BRA<L, R>>, false >>;
assert<Equals<IsNRE<BBA<L, R>>, false >>;
assert<Equals<IsNRE<LNC<L, R>>, false >>;
assert<Equals<IsNRE<NRC<L, R>>, true >>;
assert<Equals<IsNRE<LRC<L, R>>, false >>;
assert<Equals<IsNRE<LBC<L, R>>, false >>;
assert<Equals<IsNRE<BRC<L, R>>, false >>;
assert<Equals<IsNRE<BBC<L, R>>, false >>;
assert<Equals<IsNRE<LNE<L, R>>, false >>;
assert<Equals<IsNRE<NRE<L, R>>, true >>;
assert<Equals<IsNRE<LRE<L, R>>, false >>;
assert<Equals<IsNRE<LBE<L, R>>, false >>;
assert<Equals<IsNRE<BRE<L, R>>, false >>;
assert<Equals<IsNRE<BBE<L, R>>, false >>;

assert<Equals<IsLRE<LNA<L, R>>, false >>;
assert<Equals<IsLRE<NRA<L, R>>, false >>;
assert<Equals<IsLRE<LRA<L, R>>, false >>;
assert<Equals<IsLRE<LBA<L, R>>, false >>;
assert<Equals<IsLRE<BRA<L, R>>, false >>;
assert<Equals<IsLRE<BBA<L, R>>, false >>;
assert<Equals<IsLRE<LNC<L, R>>, false >>;
assert<Equals<IsLRE<NRC<L, R>>, false >>;
assert<Equals<IsLRE<LRC<L, R>>, false >>;
assert<Equals<IsLRE<LBC<L, R>>, false >>;
assert<Equals<IsLRE<BRC<L, R>>, false >>;
assert<Equals<IsLRE<BBC<L, R>>, false >>;
assert<Equals<IsLRE<LNE<L, R>>, false >>;
assert<Equals<IsLRE<NRE<L, R>>, false >>;
assert<Equals<IsLRE<LRE<L, R>>, true >>;
assert<Equals<IsLRE<LBE<L, R>>, false >>;
assert<Equals<IsLRE<BRE<L, R>>, false >>;
assert<Equals<IsLRE<BBE<L, R>>, false >>;

assert<Equals<IsLBE<LNA<L, R>>, false >>;
assert<Equals<IsLBE<NRA<L, R>>, false >>;
assert<Equals<IsLBE<LRA<L, R>>, false >>;
assert<Equals<IsLBE<LBA<L, R>>, false >>;
assert<Equals<IsLBE<BRA<L, R>>, false >>;
assert<Equals<IsLBE<BBA<L, R>>, false >>;
assert<Equals<IsLBE<LNC<L, R>>, false >>;
assert<Equals<IsLBE<NRC<L, R>>, false >>;
assert<Equals<IsLBE<LRC<L, R>>, false >>;
assert<Equals<IsLBE<LBC<L, R>>, false >>;
assert<Equals<IsLBE<BRC<L, R>>, false >>;
assert<Equals<IsLBE<BBC<L, R>>, false >>;
assert<Equals<IsLBE<LNE<L, R>>, false >>;
assert<Equals<IsLBE<NRE<L, R>>, false >>;
assert<Equals<IsLBE<LRE<L, R>>, false >>;
assert<Equals<IsLBE<LBE<L, R>>, true >>;
assert<Equals<IsLBE<BRE<L, R>>, false >>;
assert<Equals<IsLBE<BBE<L, R>>, false >>;

assert<Equals<IsBRE<LNA<L, R>>, false >>;
assert<Equals<IsBRE<NRA<L, R>>, false >>;
assert<Equals<IsBRE<LRA<L, R>>, false >>;
assert<Equals<IsBRE<LBA<L, R>>, false >>;
assert<Equals<IsBRE<BRA<L, R>>, false >>;
assert<Equals<IsBRE<BBA<L, R>>, false >>;
assert<Equals<IsBRE<LNC<L, R>>, false >>;
assert<Equals<IsBRE<NRC<L, R>>, false >>;
assert<Equals<IsBRE<LRC<L, R>>, false >>;
assert<Equals<IsBRE<LBC<L, R>>, false >>;
assert<Equals<IsBRE<BRC<L, R>>, false >>;
assert<Equals<IsBRE<BBC<L, R>>, false >>;
assert<Equals<IsBRE<LNE<L, R>>, false >>;
assert<Equals<IsBRE<NRE<L, R>>, false >>;
assert<Equals<IsBRE<LRE<L, R>>, false >>;
assert<Equals<IsBRE<LBE<L, R>>, false >>;
assert<Equals<IsBRE<BRE<L, R>>, true >>;
assert<Equals<IsBRE<BBE<L, R>>, false >>;

assert<Equals<IsBBE<LNA<L, R>>, false >>;
assert<Equals<IsBBE<NRA<L, R>>, false >>;
assert<Equals<IsBBE<LRA<L, R>>, false >>;
assert<Equals<IsBBE<LBA<L, R>>, false >>;
assert<Equals<IsBBE<BRA<L, R>>, false >>;
assert<Equals<IsBBE<BBA<L, R>>, false >>;
assert<Equals<IsBBE<LNC<L, R>>, false >>;
assert<Equals<IsBBE<NRC<L, R>>, false >>;
assert<Equals<IsBBE<LRC<L, R>>, false >>;
assert<Equals<IsBBE<LBC<L, R>>, false >>;
assert<Equals<IsBBE<BRC<L, R>>, false >>;
assert<Equals<IsBBE<BBC<L, R>>, false >>;
assert<Equals<IsBBE<LNE<L, R>>, false >>;
assert<Equals<IsBBE<NRE<L, R>>, false >>;
assert<Equals<IsBBE<LRE<L, R>>, false >>;
assert<Equals<IsBBE<LBE<L, R>>, false >>;
assert<Equals<IsBBE<BRE<L, R>>, false >>;
assert<Equals<IsBBE<BBE<L, R>>, true >>;


















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
