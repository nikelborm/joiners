import test, { describe, it } from 'node:test';

const _ = Symbol('emptiness');
type _ = typeof _;

const A = new Set([
  { id: 1, v: 6 },
  { id: 2, v: 6 },
  { id: 3, v: 7 },
  { id: 4, v: 7 },
  { id: 5, v: 9 }
]);

const B = new Set([
  { id: 1, v: 7  },
  { id: 2, v: 7  },
  { id: 3, v: 8  },
  { id: 4, v: 8  },
  { id: 5, v: 10 }
]);

describe('Full A join empty B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([
      [{ id: 1, v: 6 }, _],
      [{ id: 2, v: 6 }, _],
      [{ id: 3, v: 7 }, _],
      [{ id: 4, v: 7 }, _],
      [{ id: 5, v: 9 }, _],
    ]);
    const result = func();
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([
      [{ id: 1, v: 6 }, _],
      [{ id: 2, v: 6 }, _],
      [{ id: 3, v: 7 }, _],
      [{ id: 4, v: 7 }, _],
      [{ id: 5, v: 9 }, _],
    ]);
    const result = func();
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([
      [{ id: 1, v: 6 }, _],
      [{ id: 2, v: 6 }, _],
      [{ id: 3, v: 7 }, _],
      [{ id: 4, v: 7 }, _],
      [{ id: 5, v: 9 }, _],
    ]);
    const result = func();
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([
      [{ id: 1, v: 6 }, _],
      [{ id: 2, v: 6 }, _],
      [{ id: 3, v: 7 }, _],
      [{ id: 4, v: 7 }, _],
      [{ id: 5, v: 9 }, _],
    ]);
    const result = func();
  });
})


describe('Empty A join full B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([
      [_, { id: 1, v: 7  }],
      [_, { id: 2, v: 7  }],
      [_, { id: 3, v: 8  }],
      [_, { id: 4, v: 8  }],
      [_, { id: 5, v: 10 }],
    ]);
    const result = func();
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([
      [_, { id: 1, v: 7  }],
      [_, { id: 2, v: 7  }],
      [_, { id: 3, v: 8  }],
      [_, { id: 4, v: 8  }],
      [_, { id: 5, v: 10 }],
    ]);
    const result = func();
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([
      [_, { id: 1, v: 7  }],
      [_, { id: 2, v: 7  }],
      [_, { id: 3, v: 8  }],
      [_, { id: 4, v: 8  }],
      [_, { id: 5, v: 10 }],
    ]);
    const result = func();
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([
      [_, { id: 1, v: 7  }],
      [_, { id: 2, v: 7  }],
      [_, { id: 3, v: 8  }],
      [_, { id: 4, v: 8  }],
      [_, { id: 5, v: 10 }],
    ]);
    const result = func();
  });
})


describe('Empty A join empty B', () => {
  test('select * from a left  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a right outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a full  outer join b using (v);', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a inner       join b using (v);', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a cross       join b;', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a left  outer join b using (v) where b.v is null;', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a right outer join b using (v) where a.v is null;', () => {
    const ideal = new Set([]);
    const result = func();
  });
  test('select * from a full  outer join b using (v) where a.v is null or b.v is null;', () => {
    const ideal = new Set([]);
    const result = func();
  });
})
