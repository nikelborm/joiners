// TODO: When I'll finish this shit, post it to https://github.com/type-challenges/type-challenges

import { At as GetNthCharacter } from 'ts-toolbelt/out/String/At';
import { BBA, LNA, NRA } from 'types';

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
    return {
      ...(tuple[~~!AHasPriority] as object),
      ...(tuple[~~AHasPriority] as object)
    } as (
      T extends NRA<unknown, infer R>
      ? R
      : T extends LNA<infer L, unknown>
      ? L
      : T extends BBA<infer L, infer R>
      // It's intentionally not just (L & R) because we need a way to reliably
      // specify that properties from right if exist, override properties from left
      ? { [Key in keyof L | keyof R]: (
        // TODO: add optionality support so it doesn't break ?: of source objects
        Key extends keyof R
        ? R[Key]
        : Key extends keyof L
        ? L[Key]
        : never
      ) }
      : never
    )
  }
}


//! TODO: should pass with { "exactOptionalPropertyTypes": true, "strictNullChecks": true }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// L                         , R                         , Merge Candidates                     => Merge Results   , Compact Merge Results
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// { a?: string             }, { a?: number             }, [{              }, {              }] => {              }, { a?: string | number             }
//                                                       , [{ a: string    }, {              }] => { a: string    }
//                                                       , [{              }, { a: number    }] => { a: number    }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }

// { a?: string             }, { a : number             }, [{              }, { a: number    }] => { a: number    }, { a : number                      }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }

// { a : string             }, { a?: number             }, [{ a: string    }, {              }] => { a: string    }, { a : string | number             }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }

// { a : string             }, { a : number             }, [{ a: string    }, { a: number    }] => { a: number    }, { a : number                      }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// { a?: string | undefined }, { a?: number             }, [{              }, {              }] => {              }, { a?: string | number | undefined }
//                                                       , [{ a: string    }, {              }] => { a: string    }
//                                                       , [{ a: undefined }, {              }] => { a: undefined }
//                                                       , [{              }, { a: number    }] => { a: number    }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }
//                                                       , [{ a: undefined }, { a: number    }] => { a: number    }

// { a?: string | undefined }, { a : number             }, [{              }, { a: number    }] => { a: number    }, { a : number                      }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }
//                                                       , [{ a: undefined }, { a: number    }] => { a: number    }

// { a : string | undefined }, { a?: number             }, [{ a: string    }, {              }] => { a: string    }, { a : string | number | undefined }
//                                                       , [{ a: undefined }, {              }] => { a: undefined }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }
//                                                       , [{ a: undefined }, { a: number    }] => { a: number    }

// { a : string | undefined }, { a : number             }, [{ a: string    }, { a: number    }] => { a: number    }, { a : number                      }
//                                                       , [{ a: undefined }, { a: number    }] => { a: number    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// { a?: string             }, { a?: number | undefined }, [{              }, {              }] => {              }, { a?: string | number | undefined }
//                                                       , [{ a: string    }, {              }] => { a: string    }
//                                                       , [{              }, { a: number    }] => { a: number    }
//                                                       , [{              }, { a: undefined }] => { a: undefined }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }
//                                                       , [{ a: string    }, { a: undefined }] => { a: undefined }

// { a?: string             }, { a : number | undefined }, [{              }, { a: number    }] => { a: number    }, { a : number | undefined          }
//                                                       , [{              }, { a: undefined }] => { a: undefined }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }
//                                                       , [{ a: string    }, { a: undefined }] => { a: undefined }

// { a : string             }, { a?: number | undefined }, [{ a: string    }, {              }] => { a: string    }, { a : string | number | undefined }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }
//                                                       , [{ a: string    }, { a: undefined }] => { a: undefined }

// { a : string             }, { a : number | undefined }, [{ a: string    }, { a: number    }] => { a: number    }, { a : number | undefined          }
//                                                       , [{ a: string    }, { a: undefined }] => { a: undefined }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// { a?: string | undefined }, { a?: number | undefined }, [{              }, {              }] => {              }, { a?: string | number | undefined }
//                                                       , [{ a: string    }, {              }] => { a: string    }
//                                                       , [{ a: undefined }, {              }] => { a: undefined }
//                                                       , [{              }, { a: number    }] => { a: number    }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }
//                                                       , [{ a: undefined }, { a: number    }] => { a: number    }
//                                                       , [{              }, { a: undefined }] => { a: undefined }
//                                                       , [{ a: string    }, { a: undefined }] => { a: undefined }
//                                                       , [{ a: undefined }, { a: undefined }] => { a: undefined }

// { a?: string | undefined }, { a : number | undefined }, [{              }, { a: number    }] => { a: number    }, { a : number | undefined          }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }
//                                                       , [{ a: undefined }, { a: number    }] => { a: number    }
//                                                       , [{              }, { a: undefined }] => { a: undefined }
//                                                       , [{ a: string    }, { a: undefined }] => { a: undefined }
//                                                       , [{ a: undefined }, { a: undefined }] => { a: undefined }

// { a : string | undefined }, { a?: number | undefined }, [{ a: string    }, {              }] => { a: string    }, { a : string | number | undefined }
//                                                       , [{ a: undefined }, {              }] => { a: undefined }
//                                                       , [{ a: string    }, { a: number    }] => { a: number    }
//                                                       , [{ a: undefined }, { a: number    }] => { a: number    }
//                                                       , [{ a: string    }, { a: undefined }] => { a: undefined }
//                                                       , [{ a: undefined }, { a: undefined }] => { a: undefined }

// { a : string | undefined }, { a : number | undefined }, [{ a: string    }, { a: number    }] => { a: number    }, { a : number | undefined          }
//                                                       , [{ a: undefined }, { a: number    }] => { a: number    }
//                                                       , [{ a: string    }, { a: undefined }] => { a: undefined }
//                                                       , [{ a: undefined }, { a: undefined }] => { a: undefined }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
