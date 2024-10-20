# Joiner

## What's this?

It's better version of [evologi/join](https://github.com/evologi/join) with
**EXTREME** typescript support, more join types, more join aliases,
predefined result mappers, ability to join any Iterable instead of just
Maps and more!

```bash
c; npm exec tsx watch --clear-screen ./test.ts
```

## TODO

1. Ability to deduplicate entries on keyGenerator with ability to choose what to do with with duplcates where 1|2 slots are empty
2. Context Expander merger
3. Pre-made join functions like `leftJoin(...)`
4. queryBuilder that accepts multiple datasets and allows to make multiple joins on them
5. `USING` syntax in joins. Allow joining many columns by their respective names (also ability to determine from all the context are there any ambiguous column names with all previous datasets in join)
6. ability to name left side and right side so they can be extracted by name later (force uniqueness of the names) (just like aliases in sql)
7. ability to get generator on discarded values `not(...)`
