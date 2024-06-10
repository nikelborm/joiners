import { equal } from 'node:assert';
import test, { describe } from 'node:test';

const invertBits = (x: number) => 7 - x;

describe('invert', (t) => {
  for (const [param, expected] of [
    [0b000, 0b111],
    [0b001, 0b110],
    [0b010, 0b101],
    [0b011, 0b100],
    [0b100, 0b011],
    [0b101, 0b010],
    [0b110, 0b001],
    [0b111, 0b000]
  ]) {
    test(
      `invertBits(${param}) === ${expected}`,
      () => equal(invertBits(param), expected)
    );
  }
})
