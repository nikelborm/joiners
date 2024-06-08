import test, { describe, it } from 'node:test';
import { deepStrictEqual } from 'node:assert/strict';

const _ = Symbol('emptiness');
type _ = typeof _;
type V = { id: number, v: number }

const FilledA = new Set([
  { id: 1, v: 6 },
  { id: 2, v: 6 },
  { id: 3, v: 7 },
  { id: 4, v: 7 },
  { id: 5, v: 9 }
]);

const FilledB = new Set([
  { id: 1, v: 7  },
  { id: 2, v: 7  },
  { id: 3, v: 8  },
  { id: 4, v: 8  },
  { id: 5, v: 10 }
]);

const EmptyA = new Set([]);

const EmptyB = new Set([]);

const func = (a, b, c) => new Set([]);

type LNA<L, R> = [L, _];
type NRA<L, R> = [_, R];

describe('Filled A join empty B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<V, V>));
    const result = func(FilledA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = func(FilledA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<V, V>));
    const result = func(FilledA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = func(FilledA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = func(FilledA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<V, V>));
    const result = func(FilledA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([]);
    const result = func(FilledA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([...FilledA].map(e => [e, _] as LNA<V, V>));
    const result = func(FilledA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
})


describe('Empty A join full B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, FilledB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<V, V>));
    const result = func(EmptyA, FilledB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<V, V>));
    const result = func(EmptyA, FilledB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, FilledB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, FilledB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, FilledB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<V, V>));
    const result = func(EmptyA, FilledB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([...FilledB].map(e => [_, e] as NRA<V, V>));
    const result = func(EmptyA, FilledB, '');
    deepStrictEqual(result, ideal);
  });
})


describe('Empty A join empty B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([]);
    const result = func(EmptyA, EmptyB, '');
    deepStrictEqual(result, ideal);
  });
})
