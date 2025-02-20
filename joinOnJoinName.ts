import { joinNameToVennDiagramParts } from './constants';
import { joinOnVennDiagramParts } from './joinOnVennDiagramParts';
import { AllJoinNames, DetailingModifier, JoinOnJoinName, LRA } from './types';

export function buildJoinerOnJoinNameWithCustomDetailingModifier<
  Detailing extends DetailingModifier = 'A',
>(): JoinerOnJoinNameWithCustomDetailingModifier<Detailing> {
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
    trustElementsOrderConsistencyOfRightIterable?: boolean,
  ): Generator<MergedResult> {
    if ((joinName === 'crossJoin') !== (passesJoinCondition === undefined))
      throw new Error();

    return joinOnVennDiagramParts(
      left,
      right,
      joinNameToVennDiagramParts[joinName],
      merge,
      joinName === 'crossJoin'
        ? () => true
        : (passesJoinCondition as (tuple: LRA<L, R>) => boolean),
      trustElementsOrderConsistencyOfRightIterable,
    );
  }

  return __joinOnJoinName satisfies JoinerOnJoinNameWithCustomDetailingModifier<Detailing>;
}

export const joinWithAtomicMergeArgs =
  buildJoinerOnJoinNameWithCustomDetailingModifier<'A'>();
export const joinWithCompactedMergeArgs =
  buildJoinerOnJoinNameWithCustomDetailingModifier<'C'>();
export const joinWithExtendedMergeArgs =
  buildJoinerOnJoinNameWithCustomDetailingModifier<'E'>();

export const join = joinWithAtomicMergeArgs;

export type CrossJoinerWithCustomDetailingModifier<
  Detailing extends DetailingModifier,
> = <L, R, MergedResult, const JoinName extends 'crossJoin'>(
  left: Iterable<L>,
  right: Iterable<R>,
  joinName: JoinName,
  merge: (tuple: JoinOnJoinName<L, R, JoinName, Detailing>) => MergedResult,
) => Generator<MergedResult>;

export type NonCrossJoinerWithCustomDetailingModifier<
  Detailing extends DetailingModifier,
> = <
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
  trustElementsOrderConsistencyOfRightIterable?: boolean,
) => Generator<MergedResult>;

export type JoinerOnJoinNameWithCustomDetailingModifier<
  Detailing extends DetailingModifier,
> = NonCrossJoinerWithCustomDetailingModifier<Detailing> &
  CrossJoinerWithCustomDetailingModifier<Detailing>;
