const _ = Symbol('emptiness');
type _ = typeof _;

export type Merge<T> = { [P in keyof T]: T[P] } & {};

const left = new Set([1, 2, 3, 4]);
const right = new Set([3, 4, 5, 6]);


// 3rd letter
type Possible3rdLetter = 'A' | 'C' | 'E';
// A - Atomic. Union of narrowest LR tuple types. Narrowest means that
// elements of the LR tuple are not unions ans either _ or value (L or R,
// depending on the position)
// C - Compacted. The most high order representation of the combination
// of atoms.
// E - Expanded. All possible representations of

// 1st letter:
type Possible1stLetter = 'N' | 'L' | 'B';
// N - No element(empty/_). 1st element of the tuple is _
// L - Left element(L)    . 1st element of the tuple is L
// B - Both               . 1st element of the tuple is (_ | L)

// 2nd letter:
type Possible2ndLetter = 'N' | 'R' | 'B';
// N - No element(empty/_). 2nd element of the tuple is _
// R - Right element(R)   . 2nd element of the tuple is R
// B - Both               . 2nd element of the tuple is (_ | R)



// ATOMS
type NNA<L, R> = [_, _];
type LNA<L, R> = [L, _];
type NRA<L, R> = [_, R];
type LRA<L, R> = [L, R];

// To better understand atoms with letter B in code, see according compacted
type NBA<L, R> = NRA<L, R> | NNA<L, R>;
type LBA<L, R> = LNA<L, R> | LRA<L, R>;
type BRA<L, R> = NRA<L, R> | LRA<L, R>;
type BNA<L, R> = NNA<L, R> | LNA<L, R>;
type BBA<L, R> = NNA<L, R> | LNA<L, R> | NRA<L, R> | LRA<L, R>;

// COMPACTED
type NNC<L, R> = NNA<L, R>;
type LNC<L, R> = LNA<L, R>;
type NRC<L, R> = NRA<L, R>;
type LRC<L, R> = LRA<L, R>;

type NBC<L, R> = [    _, R | _];
type LBC<L, R> = [L    , R | _];
type BRC<L, R> = [L | _, R    ];
type BNC<L, R> = [L | _,     _];
type BBC<L, R> = [L | _, R | _];

// EXPANDED
type NNE<L, R> = NNA<L, R>;
type LNE<L, R> = LNA<L, R>;
type NRE<L, R> = NRA<L, R>;
type LRE<L, R> = LRA<L, R>;

type NBE<L, R> = NBA<L, R> | NBC<L, R>;
type LBE<L, R> = LBA<L, R> | LBC<L, R>;
type BRE<L, R> = BRA<L, R> | BRC<L, R>;
type BNE<L, R> = BNA<L, R> | BNC<L, R>;

type BBE<L, R> = BBA<L, R> | BBC<L, R>
  | NBC<L, R> | LBC<L, R> | BRC<L, R> | BNC<L, R>
;







type FilterOne<
  Tuple extends [any, any],
  Pos extends 0 | 1
> = [Tuple[Pos]] extends [never] ? never : Tuple;

type Filter<
  Tuple extends [any, any],
  By extends '--' | 'l-' | '-r' | 'lr'
> =
  [By] extends '--' ? Tuple :
  [By] extends 'l-' ? FilterOne<Tuple, 0> :
  [By] extends '-r' ? FilterOne<Tuple, 1> :
  [By] extends 'lr' ? FilterOne<FilterOne<Tuple, 0>, 1> :
  never
;

type to_<T> = Extract<T, _>;
type toV<T> = Exclude<T, _>;
// ATOMS
type toNNA<L, R> = Filter<[to_<L>, to_<R>], 'lr'>; // [_, _];
type toLNA<L, R> = Filter<[toV<L>, to_<R>], 'lr'>; // [L, _];
type toNRA<L, R> = Filter<[to_<L>, toV<R>], 'lr'>; // [_, R];
type toLRA<L, R> = Filter<[toV<L>, toV<R>], 'lr'>; // [L, R];

// To better understand atoms with letter B in code, see according compact
type toNBA<L, R> = toNRA<L, R> | toNNA<L, R>;
type toLBA<L, R> = toLNA<L, R> | toLRA<L, R>;
type toBRA<L, R> = toNRA<L, R> | toLRA<L, R>;
type toBNA<L, R> = toNNA<L, R> | toLNA<L, R>;
type toBBA<L, R> = toNNA<L, R> | toLNA<L, R> | toNRA<L, R> | toLRA<L, R>;

// COMPACTED
type toNNC<L, R> = toNNA<L, R>;
type toLNC<L, R> = toLNA<L, R>;
type toNRC<L, R> = toNRA<L, R>;
type toLRC<L, R> = toLRA<L, R>;

type toNBC<L, R> = Filter<[to_<L>, R     ], 'l-'>; // [_    , R | _];
type toLBC<L, R> = Filter<[toV<L>, R     ], 'l-'>; // [L    , R | _];
type toBRC<L, R> = Filter<[L     , toV<R>], '-r'>; // [L | _, R    ];
type toBNC<L, R> = Filter<[L     , to_<R>], '-r'>; // [L | _, _    ];
type toBBC<L, R> = Filter<[L     , R     ], '--'>; // [L | _, R | _];

// EXPANDED
type toNNE<L, R> = toNNA<L, R>;
type toLNE<L, R> = toLNA<L, R>;
type toNRE<L, R> = toNRA<L, R>;
type toLRE<L, R> = toLRA<L, R>;

type toNBE<L, R> = toNBA<L, R> | toNBC<L, R>;
type toLBE<L, R> = toLBA<L, R> | toLBC<L, R>;
type toBRE<L, R> = toBRA<L, R> | toBRC<L, R>;
type toBNE<L, R> = toBNA<L, R> | toBNC<L, R>;

type toBBE<L, R> = toBBA<L, R> | toBBC<L, R>
  | toNBC<L, R> | toLBC<L, R> | toBRC<L, R> | toBNC<L, R>
;










type ShouldAddLeftExclusivePart = '0' | '1';
type ShouldAddInnerPart = '0' | '1';
type ShouldAddRightExclusivePart = '0' | '1';

type PossiblePartsFlagCombinations =
  `${ShouldAddLeftExclusivePart}${ShouldAddInnerPart}${ShouldAddRightExclusivePart}`
;

type Magic1<Flags extends PossiblePartsFlagCombinations> =
  [Flags] extends ['000'] ? 'NN' :
  [Flags] extends ['001'] ? 'NR' : // right join excluding inner
  [Flags] extends ['010'] ? 'LR' : // inner join
  [Flags] extends ['011'] ? 'BR' : // right outer join (right join)
  [Flags] extends ['100'] ? 'LN' : // left join excluding inner
  [Flags] extends ['101'] ? 'LB' | 'BR' : // full outer join excluding inner
  [Flags] extends ['110'] ? 'LB' : // left outer join (left join)
  [Flags] extends ['111'] ? 'BB' : // full outer join (full join)
  never
;

type Magic2<Flags extends PossiblePartsFlagCombinations> =
  {
    '000': 'NN';
    '001': 'NR';
    '010': 'LR';
    '011': 'BR';
    '100': 'LN';
    '101': 'LB' | 'BR';
    '110': 'LB';
    '111': 'BB';
  }[Flags]
;

// TODO: attempt to integrate 'exists' joins here?

type UsedFlags = Magic2<PossiblePartsFlagCombinations>
type UnusedFlags = Exclude<PossibleFirstTwoLettersCombinations, UsedFlags>;


type PossibleAllLettersCombinations =
  `${Possible1stLetter}${Possible2ndLetter}${Possible3rdLetter}`;

type PossibleFirstTwoLettersCombinations =
  `${Possible1stLetter}${Possible2ndLetter}`;

type SelectUnion1<
  L,
  R,
  Letters extends PossibleAllLettersCombinations
> =
  [Letters] extends ['NNA'] ? NNA<L, R> :
  [Letters] extends ['LNA'] ? LNA<L, R> :
  [Letters] extends ['NRA'] ? NRA<L, R> :
  [Letters] extends ['LRA'] ? LRA<L, R> :
  [Letters] extends ['NBA'] ? NBA<L, R> :
  [Letters] extends ['LBA'] ? LBA<L, R> :
  [Letters] extends ['BRA'] ? BRA<L, R> :
  [Letters] extends ['BNA'] ? BNA<L, R> :
  [Letters] extends ['BBA'] ? BBA<L, R> :
  [Letters] extends ['NNC'] ? NNC<L, R> :
  [Letters] extends ['LNC'] ? LNC<L, R> :
  [Letters] extends ['NRC'] ? NRC<L, R> :
  [Letters] extends ['LRC'] ? LRC<L, R> :
  [Letters] extends ['NBC'] ? NBC<L, R> :
  [Letters] extends ['LBC'] ? LBC<L, R> :
  [Letters] extends ['BRC'] ? BRC<L, R> :
  [Letters] extends ['BNC'] ? BNC<L, R> :
  [Letters] extends ['BBC'] ? BBC<L, R> :
  [Letters] extends ['NNE'] ? NNE<L, R> :
  [Letters] extends ['LNE'] ? LNE<L, R> :
  [Letters] extends ['NRE'] ? NRE<L, R> :
  [Letters] extends ['LRE'] ? LRE<L, R> :
  [Letters] extends ['NBE'] ? NBE<L, R> :
  [Letters] extends ['LBE'] ? LBE<L, R> :
  [Letters] extends ['BRE'] ? BRE<L, R> :
  [Letters] extends ['BNE'] ? BNE<L, R> :
  [Letters] extends ['BBE'] ? BBE<L, R> :
  never
;

type SelectUnion2<
  L,
  R,
  LettersUnion extends PossibleAllLettersCombinations
> = {
  'NNA': NNA<L, R>;
  'LNA': LNA<L, R>;
  'NRA': NRA<L, R>;
  'LRA': LRA<L, R>;
  'NBA': NBA<L, R>;
  'LBA': LBA<L, R>;
  'BRA': BRA<L, R>;
  'BNA': BNA<L, R>;
  'BBA': BBA<L, R>;
  'NNC': NNC<L, R>;
  'LNC': LNC<L, R>;
  'NRC': NRC<L, R>;
  'LRC': LRC<L, R>;
  'NBC': NBC<L, R>;
  'LBC': LBC<L, R>;
  'BRC': BRC<L, R>;
  'BNC': BNC<L, R>;
  'BBC': BBC<L, R>;
  'NNE': NNE<L, R>;
  'LNE': LNE<L, R>;
  'NRE': NRE<L, R>;
  'LRE': LRE<L, R>;
  'NBE': NBE<L, R>;
  'LBE': LBE<L, R>;
  'BRE': BRE<L, R>;
  'BNE': BNE<L, R>;
  'BBE': BBE<L, R>;
}[LettersUnion];




// comparator = (l, r) => l === r;

function isEmpty<T>(v: T): v is to_<T> {
  return v === _;
}

function isNotEmpty<T>(v: T): v is toV<T> {
  return v !== _;
}

type helper<LettersUnion extends PossibleAllLettersCombinations> =
  Merge<SelectUnion2<number, string, LettersUnion>>
;

const nn = [_, _  ] as helper<'NNA'>;
const nr = [_, 's'] as helper<'NRA'>;
const nb = [_, 'a'] as helper<'NBA'>;
const ln = [1, _  ] as helper<'LNA'>;
const lr = [1, 's'] as helper<'LRA'>;
const lb = [1, '1'] as helper<'LBA'>;
const bn = [1, _  ] as helper<'BNA'>;
const br = [_, '1'] as helper<'BRA'>;
const bb = [1, '1'] as helper<'BBA'>;


let test = nb[0]


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

function getAllCombinations<L, R>(
  left: Set<L>,
  right: Set<R>,
  isL: (l: unknown) => l is L,
  isR: (r: unknown) => r is R
) {
  const extendedLeft  = new Set<L | _>(left);
  extendedLeft.add(_);

  const extendedRight = new Set<R | _>(right);
  extendedRight.add(_);

  const result = new Set<BBA<L, R>>();

  for (const l of extendedLeft) {
    for (const r of extendedRight) {
      const lr = [l, r] as Merge<BBE<L, R>>;
      castToBBA<L, R>(lr);
      result.add(lr);
    }
  }

  return result;
}





type Joiner<L, R, Flags extends PossiblePartsFlagCombinations> =
  Merge<SelectUnion2<L, R, `${Magic1<Flags>}E`>>
;

type LeftExclusiveJoin <L, R> = Joiner<L, R, '100'>;
type InnerJoin         <L, R> = Joiner<L, R, '010'>;
type RightExclusiveJoin<L, R> = Joiner<L, R, '001'>;
type LeftJoin          <L, R> = Joiner<L, R, '110'>;
type RightJoin         <L, R> = Joiner<L, R, '011'>;
type FullJoin          <L, R> = Joiner<L, R, '111'>;
type FullExclusiveJoin <L, R> = Joiner<L, R, '101'>;

type LeftOuterJoin<L, R> = LeftJoin<L, R>;
type RightOuterJoin<L, R> = RightJoin<L, R>;
type FullOuterJoin<L, R> = FullJoin<L, R>;

let asd: FullOuterJoin<number, string>;
asd = [123, _]

function join<L, R>(
  left: Set<L>,
  right: Set<R>,
  compare: (l: L, r: R) => boolean,
  merge: (l: L, r: R) => boolean,
) {}
