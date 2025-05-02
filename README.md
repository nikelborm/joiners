# Joiner

## What's this?

It's WIP continuation of ideas that were put into
[evologi/join](https://github.com/evologi/join) with **EXTREME** typescript
support, expanded join types and join aliases support, predefined result
mappers, ability to join any Iterable instead of just Maps and more!

```bash
c; npm test
```

## TODO

1. Ability to deduplicate entries on keyGenerator with ability to choose what to do with with duplicates where 1|2 slots are empty
2. Context Expander merger where entries of expandable context are accessible by Symbols and not string names
3. Pre-made join functions like `leftJoin(...)`
4. pipeline joiner which accepts multiple datasets and sequential instruction on how to join them. Pipeline types from [nikelborm/autism-stats/index.ts](https://github.com/nikelborm/autism-stats/blob/main/index.ts), allows to make multiple joins on them, can be used as a part of queryBuilder. Or integrate Integrate codegen from [ksxnodemodules/ts-pipe-compose](https://github.com/ksxnodemodules/ts-pipe-compose)
5. `USING` syntax in joins. Allow joining many columns by their respective names (also ability to determine from all the context are there any ambiguous column names with all previous datasets in join)
6. ability to name left side and right side so they can be extracted by name later (force uniqueness of the names) (just like aliases in sql)
7. ability to get generator on discarded values `not(...)`
8. remove never used stuff
9. Recursive `spreadObjectMerger`, which also merges nested objects
10. Joiner using indices
11. check how joiner aligns with [edgedb-js](https://github.com/edgedb/edgedb-js)
12. https://www.geeksforgeeks.org/introduction-of-relational-algebra-in-dbms/
13. https://github.com/dexie/Dexie.js/
14. add tests with empty objects to object merger
15. Make sure that it works the same with or without `exactOptionalPropertyTypes` <!-- https://t.me/Alexandroppolus написал в https://t.me/typescript_bowl/56?comment=244 В типе для мержа надо ещё не забыть проверить флаг exactOptionalPropertyTypes, если он не true, то с необязательных ключей может прилетать undefined: `type IsEOPT = [undefined] extends [1?] ? false : true;` -->
16. Add builder pattern as done [here](https://discord.com/channels/795981131316985866/1346967319385083968/1347160658105466913)
17. competitors comparison: [lodash-joins](https://www.npmjs.com/package/lodash-joins), [joiner](https://www.npmjs.com/package/joiner), [object-joiner](https://www.npmjs.com/package/object-joiner), [evologi/join](https://github.com/evologi/join), [joiner](https://github.com/mhkeller/joiner), [fast-cartesian-product](https://www.npmjs.com/package/fast-cartesian-product), [cartesian](https://www.npmjs.com/package/cartesian), [cartesian-product](https://www.npmjs.com/package/cartesian-product), [fast-cartesian](https://www.npmjs.com/package/fast-cartesian), [big-cartesian](https://www.npmjs.com/package/big-cartesian), [@lorefnon/collection-joiner](https://www.npmjs.com/package/@lorefnon/collection-joiner), [array-join](https://www.npmjs.com/package/array-join), [joins](https://www.npmjs.com/package/joins)

This project currently only well tested for the following `"compilerOptions"` in `tsconfig.json`

```json
{
  "exactOptionalPropertyTypes": true,
  "strictNullChecks": true
}
```
