import type { AllJoinNames, AllJoinNamesWithoutAliases } from './types';

export const _ = Symbol('_');

export const joinNameToEulerDiagramPartsWithoutAliases = Object.freeze({
  leftJoin     : '110',
  rightJoin    : '011',
  fullJoin     : '111',
  innerJoin    : '010',
  crossJoin    : '010',
  leftAntiJoin : '100',
  rightAntiJoin: '001',
  fullAntiJoin : '101',
} as const);

export const joinNameToEulerDiagramParts = Object.freeze({
  ...joinNameToEulerDiagramPartsWithoutAliases,
  leftOuterJoin     : '110',
  rightOuterJoin    : '011',
  fullOuterJoin     : '111',
  join              : '010',
  simpleJoin        : '010',
  leftOuterAntiJoin : '100',
  rightOuterAntiJoin: '001',
  fullOuterAntiJoin : '101',

  leftExclusiveJoin      : '100',
  leftJoinExcludingInner : '100',
  rightExclusiveJoin     : '001',
  rightJoinExcludingInner: '001',
  fullExclusiveJoin      : '101',
  fullJoinExcludingInner : '101',
} as const);

export const joinNamesWithoutAliases = [
  ...Object.keys(joinNameToEulerDiagramPartsWithoutAliases)
] as readonly AllJoinNamesWithoutAliases[];

export const joinNames = [
  ...Object.keys(joinNameToEulerDiagramParts)
] as readonly AllJoinNames[];
