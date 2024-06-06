const emptiness = Symbol('emptyElement');


const left = new Set([1, 2, 3, 4]);
const right = new Set([3, 4, 5, 6]);


type Possible3rdLetter = 'A' | 'C' | 'E';
// 3rd letter
// A - Atom. The most basic element. the most LR-pair-union of only one element
// C - Compacted. The most high order representation of the combination of atoms.
// E - Expanded. All possible representations of

type Possible1stLetter = 'N' | 'L' | 'B';
// 1st letter:
// N - No element(empty/_). 1st element of the tuple is _
// L - Left element(L)    . 1st element of the tuple is L
// B - Both               . 1st element of the tuple is (_ | L)

type Possible2ndLetter = 'N' | 'R' | 'B';
// 2nd letter:
// N - No element(empty/_). 2nd element of the tuple is _
// R - Right element(R)   . 2nd element of the tuple is R
// B - Both               . 2nd element of the tuple is (_ | R)


type Filter<Tuple extends [any, any], By extends '--' | 'l-' | '-r' | 'lr'> =
  [By] extends '--' ? Tuple :
  [By] extends 'l-' ? ([Tuple[0]] extends [never] ? never : Tuple) :
  [By] extends '-r' ? ([Tuple[1]] extends [never] ? never : Tuple) :
  [By] extends 'lr' ? ([Tuple[0]] extends [never] ? never : ([Tuple[1]] extends [never] ? never : Tuple)) :
  never
;


// ATOMS
type NNA<L, R> = Filter<[Extract<L, _>, Extract<R, _>], 'lr'>; // [_, _];
type LNA<L, R> = Filter<[Exclude<L, _>, Extract<R, _>], 'lr'>; // [L, _];
type NRA<L, R> = Filter<[Extract<L, _>, Exclude<R, _>], 'lr'>; // [_, R];
type LRA<L, R> = Filter<[Exclude<L, _>, Exclude<R, _>], 'lr'>; // [L, R];

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

type NBC<L, R> = Filter<[Extract<L, _>, R            ], 'l-'>; // [_    , R | _];
type LBC<L, R> = Filter<[Exclude<L, _>, R            ], 'l-'>; // [L    , R | _];
type BRC<L, R> = Filter<[L            , Exclude<R, _>], '-r'>; // [L | _, R    ];
type BNC<L, R> = Filter<[L            , Extract<R, _>], '-r'>; // [L | _, _    ];
type BBC<L, R> = Filter<[L            , R            ], '--'>; // [L | _, R | _];

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




type ShouldAddLeftExclusivePart = '0' | '1';
type ShouldAddInnerPart = '0' | '1';
type ShouldAddRightExclusivePart = '0' | '1';

type PossiblePartsFlagCombinations =
  `${ShouldAddLeftExclusivePart}${ShouldAddInnerPart}${ShouldAddRightExclusivePart}`
;

type Magic1<
  Flags extends PossiblePartsFlagCombinations,
> =
  [Flags] extends ['000'] ? 'NN' :
  [Flags] extends ['001'] ? 'NR' : // right join excluding inner
  [Flags] extends ['010'] ? 'LR' : // inner join
  [Flags] extends ['011'] ? 'BR' : // right outer join (right join)
  [Flags] extends ['100'] ? 'LN' : // left join excluding inner
  [Flags] extends ['101'] ? 'LB' | 'BR' : // full outer join excluding inner
  [Flags] extends ['110'] ? 'LB' : // left outer join (left join)
  [Flags] extends ['111'] ? 'BB' : // full outer join
  never
;

type Magic2<
  Flags extends PossiblePartsFlagCombinations,
> =
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




//






// comparator = (l, r) => l === r;

function isEmpty<T>(v: T): v is Extract<T, _> {
  return v === emptiness;
}

function isNotEmpty<T>(v: T): v is Exclude<T, _> {
  return v !== emptiness;
}

function castToBBA<L, R>(lr: BBE<L, R>): asserts lr is BBA<L, R> {
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

function getAllCombinations<L extends number, R extends number>(
  left: Set<L>,
  right: Set<R>,
  isL: (l: L | _) => l is L,
  isR: (r: R | _) => r is R
): Set<BBA<L, R>> {
  const extendedLeft  = new Set<L | _>(left);

  extendedLeft.add(emptiness);

  const extendedRight = new Set<R | _>(right);
  extendedRight.add(emptiness);

  const result = new Set<BBA<L, R>>();

  for (const l of extendedLeft) {
    for (const r of extendedRight) {
      const lr = [l, r] as [_|L, _|R];
      castToBBA(lr);
      result.add(lr);
    }
  }

  return result;
}



type _ = typeof emptiness;





type LeftExclusiveJoin <L, R> = Magic1<'100'>;
type InnerJoin         <L, R> = Magic1<'010'>;
type RightExclusiveJoin<L, R> = Magic1<'001'>;

type LeftJoin          <L, R> = Magic1<'110'>;
type RightJoin         <L, R> = Magic1<'011'>;
type FullJoin          <L, R> = Magic1<'111'>;
type FullExclusiveJoin <L, R> = Magic1<'101'>;

type LeftOuterJoin<L, R> = LeftJoin<L, R>;
type RightOuterJoin<L, R> = RightJoin<L, R>;
type FullOuterJoin<L, R> = FullJoin<L, R>;



function join<L, R>(
  left: Set<L>,
  right: Set<R>,
  compare: (l: L, r: R) => boolean,
  merge: (l: L, r: R) => boolean,
) {}
