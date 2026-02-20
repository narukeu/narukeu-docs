---
title: 根据 id 列表从对象数组中过滤出项并返回匹配项和在其在原数组的索引
---

## 说明

根据给定的 id 列表，从对象数组 A 中筛选出匹配项，同时返回这些匹配项在原数组 A 中的索引。

默认键名为 "id"，支持自定义键名。返回结果保持原数组 A 的顺序，不按 id 列表 B 排序。

内置清洗功能，会跳过缺失目标 key 或 key 为 undefined 的项，返回的 indices 对应原始数组 A 的索引。

## 代码

```typescript
/**
 * 从数组 A 中筛选出其 key 值位于数组 B 中的项，并返回这些项及其在 A 中的索引。
 *
 * 内置清洗：会跳过缺失目标 key 或 key 为 undefined 的项，返回的 indices 对应原始数组 A 的索引。
 *
 * @param A - 源对象数组，例如 [{ id: 1, ... }, { id: 2, ... }, ...]。
 * @param B - 需要筛选的 id 列表（可以是字符串或数字）。
 * @param key - 用于匹配的对象键名，默认 "id"。
 * @returns 返回一个对象：{ items, indices }，
 *          items 为匹配到的对象数组（顺序与 A 保持一致），indices 为对应的原始索引数组。
 *
 * @remarks
 * - 使用 Set(B) 进行快速查找，时间复杂度约为 O(n + m)（n = A.length, m = B.length）。
 * - 如果 A 中存在重复 id，会将每个匹配项都包含在结果中（并返回各自索引）。
 * - 如果 B 中包含 A 未包含的 id，则该 id 会被忽略（不会报错）。
 * - 函数内部会跳过缺失 key 或 key 为 undefined 的项；若需特殊处理，请在调用前另外处理。
 */
export const filterArrayWithIndexByIds = (
  A: Record<string, any>[],
  B: Array<string | number>,
  key: string = "id"
): { items: Record<string, any>[]; indices: number[] } => {
  const idSet = new Set(B);
  const resultItems: Record<string, any>[] = [];
  const resultIndices: number[] = [];

  A.forEach((item, index) => {
    // 内置清洗：跳过空项、缺失 key 或 key 为 undefined 的项
    if (
      !item ||
      !Object.prototype.hasOwnProperty.call(item, key) ||
      item[key] === undefined
    ) {
      return;
    }

    if (idSet.has(item[key])) {
      resultItems.push(item);
      resultIndices.push(index);
    }
  });

  return { items: resultItems, indices: resultIndices };
};
```

## 用法与输出

### 示例 1：基础用法（默认 key 为 id）

```typescript
const A = [
  { id: 11, name: "小明" },
  { id: 22, name: "小红" },
  { id: 33, name: "小刚" },
  { id: 22, name: "重复的小红" }
];

const B = [22, 99];

console.log(filterArrayWithIndexByIds(A, B));
```

输出（说明：只匹配到 id = 22 的两项，99 被忽略）：

```
{
  items: [
    { id: 22, name: "小红" },
    { id: 22, name: "重复的小红" }
  ],
  indices: [1, 3]
}
```

### 示例 2：自定义 key（例如 id 字段名为 uid）

```typescript
const A2 = [
  { uid: "a", val: 1 },
  { uid: "b", val: 2 },
  { uid: "c", val: 3 }
];

const B2 = ["b", "c"];

console.log(filterArrayWithIndexByIds(A2, B2, "uid"));
```

输出：

```
{
  items: [
    { uid: "b", val: 2 },
    { uid: "c", val: 3 }
  ],
  indices: [1, 2]
}
```

## 注意事项

- 匹配使用 Set.has，比较遵循 JavaScript 的严格相等（对于不同类型的 1 和 "1" 不会匹配）。
- 返回 items 的顺序和原数组 A 保持一致；如果需要按 B 的顺序返回，请改用 Map 索引并按 B 遍历。
- 如果 A 非常大且需要多次查询，建议预先建立 id -> { item, index } 的 Map 以提高重复查询性能。
- 函数内部会跳过缺失目标 key 或 key 为 undefined 的项，返回的 indices 是相对于原始数组 A 的索引。
- 对于可能不存在 key 的项，如果需要保留这些项或以特殊值匹配，请在调用前进行自定义清洗或预处理。

### 示例：预构建 Map 提升多次查询性能

当需要对同一数组进行大量查找时，使用 Map 将查找复杂度从 O(n) 降为 O(1)。

```typescript
// 示例：将 A 构建为 id -> { item, index } 的 Map
const A = [
  { id: 11, name: "小明" },
  { id: 22, name: "小红" },
  { id: 33, name: "小刚" }
];

const key = "id";
// 构建 Map
const idMap = new Map<
  number | string,
  { item: Record<string, any>; index: number }
>();
A.forEach((item, idx) => {
  if (item && item[key] !== undefined) {
    idMap.set(item[key], { item, index: idx });
  }
});

// 多次查询示例
const idsToQuery = [22, 33, 99];
const results = idsToQuery.map((id) => idMap.get(id) ?? null);
console.log(results);
/*
输出：
[
  { item: { id: 22, name: '小红' }, index: 1 },
  { item: { id: 33, name: '小刚' }, index: 2 },
  null
]
*/
```
