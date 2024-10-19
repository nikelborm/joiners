// TODO: When I'll finish this shit, post it to https://github.com/type-challenges/type-challenges

import { At as GetNthCharacter } from 'ts-toolbelt/out/String/At';
import { Equals, assert } from 'tsafe';
import { BBA, ForbiddenLiteralUnion, LNA, NRA } from './types';

function doesAHavePriority(
  mergeStrategy: '{ ...B, ...A }' | '{ ...A, ...B }'
): mergeStrategy is '{ ...B, ...A }' {
  const firstPriorityIndex = 11;
  return mergeStrategy[firstPriorityIndex] as (
    GetNthCharacter<typeof mergeStrategy, typeof firstPriorityIndex>
  ) === 'A';
}


export const getSpreadObjectMerger = <
  const MergeStrategy extends '{ ...B, ...A }' | '{ ...A, ...B }'
>(
  mergeStrategy: MergeStrategy
) => <
  const T extends BBA<unknown, unknown>
>(
  tuple: T
) => {
  const AHasPriority = doesAHavePriority(mergeStrategy)

  return {
    ...(tuple[~~AHasPriority] as object),
    ...(tuple[~~!AHasPriority] as object)
  } as (
    T extends NRA<never, infer B>
    ? B
    : T extends LNA<infer A, never>
    ? A
    : T extends BBA<infer A, infer B> // TODO: check this `extends` because it's SUS AF
    ? (
      [MergeStrategy] extends ['{ ...A, ...B }']
        ? MagicGeneric<A, B>
        : [MergeStrategy] extends ['{ ...B, ...A }']
        ? MagicGeneric<B, A>
        : ForbiddenLiteralUnion<'MergeStrategy', 'getSpreadObjectMerger'>
    )
    : `getSpreadObjectMerger(\'${MergeStrategy}\') function received invalid tuple type as an argument`
  )
}


type PreserveUndefinedOnlyIfWasExplicit<T, Key extends keyof T> =
  { [K in Key]: T[Key] } extends { [K in Key]: Exclude<T[Key], undefined> }
  ? Exclude<T[Key], undefined>
  : T[Key];

assert<Equals<PreserveUndefinedOnlyIfWasExplicit<{ a?: string             }, 'a'>, string             >>();
assert<Equals<PreserveUndefinedOnlyIfWasExplicit<{ a?: string | undefined }, 'a'>, string | undefined >>();
assert<Equals<PreserveUndefinedOnlyIfWasExplicit<{ a : string             }, 'a'>, string             >>();
assert<Equals<PreserveUndefinedOnlyIfWasExplicit<{ a : string | undefined }, 'a'>, string | undefined >>();


type CommonKey<L, R> = keyof L & keyof R;

type MagicGenericMergedBodyForCommonKey<
  L,
  R,
  Key extends CommonKey<L, R>
> = R extends { [K in Key]: R[Key] }
  ? R[Key]
  :
    | PreserveUndefinedOnlyIfWasExplicit<R, Key>
    | PreserveUndefinedOnlyIfWasExplicit<L, Key>
;

type OptionalKeyof<T> = Exclude<{
  [Key in keyof T]: T extends Record<Key, T[Key]> ? never : Key;
}[keyof T], undefined>;

type BothOptionalKeys<L, R> = OptionalKeyof<L> & OptionalKeyof<R>;

// TODO: find better name instead of MagicGeneric
// TODO: God please don't tell me this shit breaks also readonly modifiers
// on fields 😭😭😭
// It's intentionally not just (L & R) because we need a way to reliably
// specify that properties from right if exist, override properties from
// left
type MagicGeneric<L, R /* R has higher priority */> = {
  [Key in Exclude<CommonKey<L, R>, BothOptionalKeys<L, R>>]-?:
    MagicGenericMergedBodyForCommonKey<L, R, Key>
} & {
  [Key in BothOptionalKeys<L, R>]+?:
    MagicGenericMergedBodyForCommonKey<L, R, Key>
} & Omit<L, keyof R> & Omit<R, keyof L>;



//! Should pass with {
//!   "exactOptionalPropertyTypes": true,
//!   "strictNullChecks": true
//! }

// Merge Candidates                     => Merge Results
// [{              }, {              }] => {              }
// [{ a: string    }, {              }] => { a: string    }
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
type Testcase1Result = MagicGeneric<
  { a?: string             },
  { a?: number             }
>
assert<Equals<Testcase1Result, { a?: string | number             }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
type Testcase2Result = MagicGeneric<
  { a?: string             },
  { a : number             }
>
assert<Equals<Testcase2Result, { a : number                      }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{ a: string    }, {              }] => { a: string    }
// [{ a: string    }, { a: number    }] => { a: number    }
type Testcase3Result = MagicGeneric<
  { a : string             },
  { a?: number             }
>
assert<Equals<Testcase3Result, { a : string | number             }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{ a: string    }, { a: number    }] => { a: number    }
type Testcase4Result = MagicGeneric<
  { a : string             },
  { a : number             }
>
assert<Equals<Testcase4Result, { a : number                      }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{              }, {              }] => {              }
// [{ a: string    }, {              }] => { a: string    }
// [{ a: undefined }, {              }] => { a: undefined }
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
type Testcase5Result = MagicGeneric<
  { a?: string | undefined },
  { a?: number             }
>
assert<Equals<Testcase5Result, { a?: string | number | undefined }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
type Testcase6Result = MagicGeneric<
  { a?: string | undefined },
  { a : number             }
>
assert<Equals<Testcase6Result, { a : number                      }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{ a: string    }, {              }] => { a: string    }
// [{ a: undefined }, {              }] => { a: undefined }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
type Testcase7Result = MagicGeneric<
  { a : string | undefined },
  { a?: number             }
>
assert<Equals<Testcase7Result, { a : string | number | undefined }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
type Testcase8Result = MagicGeneric<
  { a : string | undefined },
  { a : number             }
>
assert<Equals<Testcase8Result, { a : number                      }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{              }, {              }] => {              }
// [{ a: string    }, {              }] => { a: string    }
// [{              }, { a: number    }] => { a: number    }
// [{              }, { a: undefined }] => { a: undefined }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
type Testcase9Result = MagicGeneric<
  { a?: string             },
  { a?: number | undefined }
>
assert<Equals<Testcase9Result, { a?: string | number | undefined }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{              }, { a: number    }] => { a: number    }
// [{              }, { a: undefined }] => { a: undefined }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
type Testcase10Result = MagicGeneric<
  { a?: string             },
  { a : number | undefined }
>
assert<Equals<Testcase10Result, { a : number | undefined          }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{ a: string    }, {              }] => { a: string    }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
type Testcase11Result = MagicGeneric<
  { a : string             },
  { a?: number | undefined }
>
assert<Equals<Testcase11Result, { a : string | number | undefined }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
type Testcase12Result = MagicGeneric<
  { a : string             },
  { a : number | undefined }
>
assert<Equals<Testcase12Result, { a : number | undefined          }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{              }, {              }] => {              }
// [{ a: string    }, {              }] => { a: string    }
// [{ a: undefined }, {              }] => { a: undefined }
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
// [{              }, { a: undefined }] => { a: undefined }
// [{ a: string    }, { a: undefined }] => { a: undefined }
// [{ a: undefined }, { a: undefined }] => { a: undefined }
type Testcase13Result = MagicGeneric<
  { a?: string | undefined },
  { a?: number | undefined }
>
assert<Equals<Testcase13Result, { a?: string | number | undefined }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
// [{              }, { a: undefined }] => { a: undefined }
// [{ a: string    }, { a: undefined }] => { a: undefined }
// [{ a: undefined }, { a: undefined }] => { a: undefined }
type Testcase14Result = MagicGeneric<
  { a?: string | undefined },
  { a : number | undefined }
>
assert<Equals<Testcase14Result, { a : number | undefined          }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{ a: string    }, {              }] => { a: string    }
// [{ a: undefined }, {              }] => { a: undefined }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
// [{ a: undefined }, { a: undefined }] => { a: undefined }
type Testcase15Result = MagicGeneric<
  { a : string | undefined },
  { a?: number | undefined }
>
assert<Equals<Testcase15Result, { a : string | number | undefined }>>();
//            ^?



// Merge Candidates                     => Merge Results
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
// [{ a: undefined }, { a: undefined }] => { a: undefined }
type Testcase16Result = MagicGeneric<
  { a : string | undefined },
  { a : number | undefined }
>
assert<Equals<Testcase16Result, { a : number | undefined          }>>();
//            ^?
