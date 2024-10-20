import { joinNameToEulerDiagramParts } from './constants';
import { joinOnEulerDiagramParts } from './joinOnEulerDiagramParts';
import { AllJoinNames, DetailingModifier, JoinOnJoinName, LRA } from './types';



export function buildJoinerOnJoinNameWithCustomDetailingModifier<
  Detailing extends DetailingModifier = 'A'
>() {
  function __joinOnJoinName<
    L,
    R,
    MergedResult,
    const JoinName extends Exclude<AllJoinNames, 'crossJoin'>,
  >(
    left: Iterable<L>,
    right: Iterable<R>,
    joinName: JoinName,
    merge: (tuple: JoinOnJoinName<L, R, JoinName, Detailing>) => MergedResult,
    passesJoinCondition: (tuple: LRA<L, R>) => boolean,
  ): Generator<MergedResult>;

  function __joinOnJoinName<
    L,
    R,
    MergedResult,
    const JoinName extends 'crossJoin',
  >(
    left: Iterable<L>,
    right: Iterable<R>,
    joinName: JoinName,
    merge: (tuple: JoinOnJoinName<L, R, JoinName, Detailing>) => MergedResult,
  ): Generator<MergedResult>;

  function __joinOnJoinName<
    L,
    R,
    MergedResult,
    const JoinName extends AllJoinNames,
  >(
    left: Iterable<L>,
    right: Iterable<R>,
    joinName: JoinName,
    merge: (tuple: JoinOnJoinName<L, R, JoinName, Detailing>) => MergedResult,
    passesJoinCondition?: (tuple: LRA<L, R>) => boolean,
  ): Generator<MergedResult> {
    if ((joinName === 'crossJoin') !== (passesJoinCondition === undefined))
      throw new Error();

    return joinOnEulerDiagramParts(
      left,
      right,
      joinNameToEulerDiagramParts[joinName],
      merge,
      joinName === 'crossJoin'
        ? () => true
        : passesJoinCondition as (tuple: LRA<L, R>) => boolean
      ,
    );
  }

  return __joinOnJoinName;
}


export const joinWithAtomicMergeArgs = buildJoinerOnJoinNameWithCustomDetailingModifier<"A">();
export const joinWithCompactedMergeArgs = buildJoinerOnJoinNameWithCustomDetailingModifier<"C">();
export const joinWithExtendedMergeArgs = buildJoinerOnJoinNameWithCustomDetailingModifier<"E">();

export const join = joinWithAtomicMergeArgs;
