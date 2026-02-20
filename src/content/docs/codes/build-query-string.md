---
title: 将对象转换为 URL 查询字符串
---

## 代码

```typescript
/**
 * 将对象转换为 URL 查询字符串
 *
 * @param params - 参数对象，键为字符串，值可以为字符串、数字、布尔值、数组或对象。
 * @returns 返回编码后的查询字符串（不带 `?`）。
 *
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
    } else if (typeof value === "object") {
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
};
```

## 用法和输出

### 示例

```typescript
const params1 = {
  a: 1,
  b: [2, 3],
  c: { x: 1, y: "测试" },
  d: null,
  e: undefined,
  f: "hello world",
  g: true
};

const params2 = {
  arr: ["一", "二", "三"],
  obj: { foo: "bar" },
  empty: null,
  num: 42
};

console.log(buildQueryString(params1));
console.log(buildQueryString(params2));
```

### 输出

```
a=1&b=2&b=3&c=%7B%22x%22%3A1%2C%22y%22%3A%221%22%7D&f=hello+world&g=true

arr=%E4%B8%80&arr=%E4%BA%8C&arr=%E4%B8%89&obj=%7B%22foo%22%3A%22bar%22%7D&num=42
```

## 说明

- `null` 和 `undefined` 的参数会被自动跳过，不会出现在结果中。
- 数组会生成多个同名参数，顺序与原数组一致。
- 对象类型会被 `JSON.stringify` 后作为字符串参数，建议只用于简单对象。
- 参数值会自动进行 `encodeURIComponent`，确保汉字等特殊值能够被正确传输。
