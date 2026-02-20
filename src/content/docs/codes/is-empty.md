---
title: isEmpty 判空函数
---

> [!TIP]
> 这个函数修改自 [radash](https://github.com/sodiray/radash) 项目，遵守 MIT 许可证。

## 代码

```typescript
export const isEmpty = (value: unknown): boolean => {
  type NumericLength = { length: number };
  type NumericSize = { size: number };

  const hasNumericLength = (value: unknown): value is NumericLength => {
    if (typeof value === "string") return true;
    if (Array.isArray(value)) return true;
    if (typeof value === "object" && value !== null && "length" in value) {
      return typeof (value as NumericLength).length === "number";
    }
    return false;
  };

  const hasNumericSize = (value: unknown): value is NumericSize => {
    return (
      typeof value === "object" &&
      value !== null &&
      "size" in value &&
      typeof (value as NumericSize).size === "number"
    );
  };

  if (typeof value === "boolean") return true;
  if (value === null || value === undefined) return true;

  if (typeof value === "number") {
    return Number.isFinite(value) && value === 0;
  }

  if (typeof value === "bigint") {
    return value === 0n;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime());
  }

  if (typeof value === "function") return false;
  if (typeof value === "symbol") return false;

  if (hasNumericLength(value)) {
    return value.length === 0;
  }

  if (hasNumericSize(value)) {
    return value.size === 0;
  }

  const keys = Object.keys(Object(value));
  return keys.length === 0;
};
```

## 测试用例

```typescript
import { describe, expect, test } from "vitest";

import { isEmpty } from "../is-empty";

describe("isEmpty", () => {
  class BareClass {}
  class TestClass {
    name = "isEmptyTest";
  }

  test("treats boolean values as empty", () => {
    expect(isEmpty(true)).toBe(true);
    expect(isEmpty(false)).toBe(true);
  });

  test("handles nullish values", () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  test("handles numbers", () => {
    expect(isEmpty(0)).toBe(true);
    expect(isEmpty(1)).toBe(false);
    expect(isEmpty(-5)).toBe(false);
    expect(isEmpty(Number.POSITIVE_INFINITY)).toBe(false);
  });

  test("handles bigint values", () => {
    expect(isEmpty(0n)).toBe(true);
    expect(isEmpty(123n)).toBe(false);
  });

  test("handles Date objects", () => {
    expect(isEmpty(new Date("invalid"))).toBe(true);
    expect(isEmpty(new Date())).toBe(false);
  });

  test("functions and symbols are not empty", () => {
    expect(isEmpty(() => null)).toBe(false);
    expect(isEmpty(Symbol(""))).toBe(false);
    expect(isEmpty(Symbol("id"))).toBe(false);
  });

  test("handles values with numeric length", () => {
    expect(isEmpty("")).toBe(true);
    expect(isEmpty("text")).toBe(false);

    expect(isEmpty([])).toBe(true);
    expect(isEmpty([1])).toBe(false);

    expect(isEmpty({ length: 0 })).toBe(true);
    expect(isEmpty({ length: 2 })).toBe(false);
  });

  test("handles values with numeric size", () => {
    expect(isEmpty(new Map())).toBe(true);
    expect(isEmpty(new Map([["key", "value"]]))).toBe(false);

    expect(isEmpty(new Set())).toBe(true);
    expect(isEmpty(new Set([1]))).toBe(false);
  });

  test("handles plain and object values", () => {
    expect(isEmpty({})).toBe(true);
    expect(isEmpty({ a: 1 })).toBe(false);

    const child = Object.create({ a: 1 });
    expect(isEmpty(child)).toBe(true);

    expect(isEmpty(new BareClass())).toBe(true);
    expect(isEmpty(new TestClass())).toBe(false);
  });
});
```
