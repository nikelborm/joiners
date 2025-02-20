import type { AllJoinNames, AllJoinNamesWithoutAliases } from './types';

export const _ = Symbol('_');

export const joinNameToVennDiagramPartsWithoutAliases = Object.freeze({
  leftJoin     : '110',
  rightJoin    : '011',
  fullJoin     : '111',
  innerJoin    : '010',
  crossJoin    : '010',
  leftAntiJoin : '100',
  rightAntiJoin: '001',
  fullAntiJoin : '101',
} as const);

export const joinNameToVennDiagramParts = Object.freeze({
  ...joinNameToVennDiagramPartsWithoutAliases,
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
  ...Object.keys(joinNameToVennDiagramPartsWithoutAliases),
] as readonly AllJoinNamesWithoutAliases[];

export const joinNames = [
  ...Object.keys(joinNameToVennDiagramParts),
] as readonly AllJoinNames[];


// These are not magic numbers. They intuitively show which parts of 2
// intersecting circles (Venn diagram) can be used.
//         _______ _______         |
//        /      / \      \        | 4 = 0b100 (1 bit is on the left side)
//       |   4  | 2 |  1   |       | 2 = 0b010 (1 bit is on the middle)
//        \      \ /      /        | 1 = 0b001 (1 bit is on the right side)
//         ------- -------         |
export const ShouldAdd = {
  LeftExclusivePart  : 0b100,
  InnerPart          : 0b010,
  RightExclusivePart : 0b001,
} as const
