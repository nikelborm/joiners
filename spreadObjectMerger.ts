// TODO: When I'll finish this shit, post it to https://github.com/type-challenges/type-challenges

import { At as GetNthCharacter } from 'ts-toolbelt/out/String/At';
import { Equals, assert } from 'tsafe';
import { BBA, LNA, NRA } from './types';

function doesAHavePriority(
  mergeStrategy: '{ ...B, ...A }' | '{ ...A, ...B }'
): mergeStrategy is '{ ...B, ...A }' {
  const firstPriorityIndex = 11;
  return mergeStrategy[firstPriorityIndex] as (
    GetNthCharacter<typeof mergeStrategy, typeof firstPriorityIndex>
  ) === 'A';
}


export const getSpreadObjectMerger = <const MergeStrategy extends '{ ...B, ...A }' | '{ ...A, ...B }'>(
  mergeStrategy: MergeStrategy
) => {

  return <
    const A,
    const B,
    const T extends BBA<A, B>
  >(tuple: T) => {
    const AHasPriority = doesAHavePriority(mergeStrategy)
    if(AHasPriority) {
      console.log(mergeStrategy);
    }
    return {
      ...(tuple[~~!AHasPriority] as object),
      ...(tuple[~~AHasPriority] as object)
    } as (
      T extends NRA<never, infer R>
      ? R
      : T extends LNA<infer L, never>
      ? L
      : T extends BBA<infer L, infer R> // TODO: check this `extends` because it's SUS AF
      ? (
        [MergeStrategy] extends ['{ ...B, ...A }']
          ? MagicGeneric<L, R>
          : [MergeStrategy] extends ['{ ...A, ...B }']
          ? MagicGeneric<R, L>
          : 'Go fuck yourself weirdo!'
      )
      : never
    )
  }
}

// It's intentionally not just (L & R) because we need a way to reliably
// specify that properties from right if exist, override properties from
// left
type MagicGeneric<L, R /* R has higher priority */> = {
  [Key in keyof L | keyof R]: (
    // TODO: add optionality support so it doesn't break ?: of source objects
    Key extends keyof R
      ? R[Key]
      : Key extends keyof L
        ? L[Key]
        : never
  )
};

//! Should pass with { "exactOptionalPropertyTypes": true, "strictNullChecks": true }

// Merge Candidates                     => Merge Results
// [{              }, {              }] => {              }
// [{ a: string    }, {              }] => { a: string    }
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
assert<Equals<MagicGeneric<{ a?: string             }, { a?: number             }>, { a?: string | number             }>>();

// Merge Candidates                     => Merge Results
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
assert<Equals<MagicGeneric<{ a?: string             }, { a : number             }>, { a : number                      }>>();

// Merge Candidates                     => Merge Results
// [{ a: string    }, {              }] => { a: string    }
// [{ a: string    }, { a: number    }] => { a: number    }
assert<Equals<MagicGeneric<{ a : string             }, { a?: number             }>, { a : string | number             }>>();

// Merge Candidates                     => Merge Results
// [{ a: string    }, { a: number    }] => { a: number    }
assert<Equals<MagicGeneric<{ a : string             }, { a : number             }>, { a : number                      }>>();

// Merge Candidates                     => Merge Results
// [{              }, {              }] => {              }
// [{ a: string    }, {              }] => { a: string    }
// [{ a: undefined }, {              }] => { a: undefined }
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
assert<Equals<MagicGeneric<{ a?: string | undefined }, { a?: number             }>, { a?: string | number | undefined }>>();

// Merge Candidates                     => Merge Results
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
assert<Equals<MagicGeneric<{ a?: string | undefined }, { a : number             }>, { a : number                      }>>();

// Merge Candidates                     => Merge Results
// [{ a: string    }, {              }] => { a: string    }
// [{ a: undefined }, {              }] => { a: undefined }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
assert<Equals<MagicGeneric<{ a : string | undefined }, { a?: number             }>, { a : string | number | undefined }>>();

// Merge Candidates                     => Merge Results
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
assert<Equals<MagicGeneric<{ a : string | undefined }, { a : number             }>, { a : number                      }>>();

// Merge Candidates                     => Merge Results
// [{              }, {              }] => {              }
// [{ a: string    }, {              }] => { a: string    }
// [{              }, { a: number    }] => { a: number    }
// [{              }, { a: undefined }] => { a: undefined }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
assert<Equals<MagicGeneric<{ a?: string             }, { a?: number | undefined }>, { a?: string | number | undefined }>>();

// Merge Candidates                     => Merge Results
// [{              }, { a: number    }] => { a: number    }
// [{              }, { a: undefined }] => { a: undefined }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
assert<Equals<MagicGeneric<{ a?: string             }, { a : number | undefined }>, { a : number | undefined          }>>();

// Merge Candidates                     => Merge Results
// [{ a: string    }, {              }] => { a: string    }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
assert<Equals<MagicGeneric<{ a : string             }, { a?: number | undefined }>, { a : string | number | undefined }>>();

// Merge Candidates                     => Merge Results
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
assert<Equals<MagicGeneric<{ a : string             }, { a : number | undefined }>, { a : number | undefined          }>>();

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
assert<Equals<MagicGeneric<{ a?: string | undefined }, { a?: number | undefined }>, { a?: string | number | undefined }>>();

// Merge Candidates                     => Merge Results
// [{              }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
// [{              }, { a: undefined }] => { a: undefined }
// [{ a: string    }, { a: undefined }] => { a: undefined }
// [{ a: undefined }, { a: undefined }] => { a: undefined }
assert<Equals<MagicGeneric<{ a?: string | undefined }, { a : number | undefined }>, { a : number | undefined          }>>();

// Merge Candidates                     => Merge Results
// [{ a: string    }, {              }] => { a: string    }
// [{ a: undefined }, {              }] => { a: undefined }
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
// [{ a: undefined }, { a: undefined }] => { a: undefined }
assert<Equals<MagicGeneric<{ a : string | undefined }, { a?: number | undefined }>, { a : string | number | undefined }>>();

// Merge Candidates                     => Merge Results
// [{ a: string    }, { a: number    }] => { a: number    }
// [{ a: undefined }, { a: number    }] => { a: number    }
// [{ a: string    }, { a: undefined }] => { a: undefined }
// [{ a: undefined }, { a: undefined }] => { a: undefined }
assert<Equals<MagicGeneric<{ a : string | undefined }, { a : number | undefined }>, { a : number | undefined          }>>();
