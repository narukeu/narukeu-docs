---
title: 对对象数组的指定一个或多个键的值进行求和
---

## 代码

```typescript
/**
 * 对对象数组中指定的一个或多个键进行求和，跳过不存在或非有效数字的值。
 *
 * @param arr - 要遍历的对象数组。
 * @param keys - 需要求和的属性键数组。
 * @returns 返回一个 Record<string, number>，其中每个键对应输入 keys 中的项，值为该键在数组中所有有效数字的和。
 *
 * @remarks
 * - 仅对 typeof value === "number" 且 Number.isFinite(value) 的值进行累加。
 * - 如果某个键在数组中没有任何有效数字，会在控制台发出警告并将该键的结果设为 0。
 * - 如果某个键存在部分无效或缺失的值，会跳过这些元素并在控制台警告被跳过的数量。
 *
 * @example
 * const data = [{ a: 1 }, { a: 2 }, { a: "x" }];
 * // 返回 { a: 3 }，并在控制台警告有 1 个值被跳过
 * sumKeysInObjects(data, ["a"]);
 */
export const sumKeysInObjects = (
  arr: Record<string, any>[],
  keys: string[]
): Record<string, number> => {
  const result: Record<string, number> = {};

  for (const key of keys) {
    let sum = 0;
    let validCount = 0;

    for (const obj of arr) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === "number" && Number.isFinite(value)) {
          sum += value;
          validCount++;
        } // 否则跳过该值
      } // 键不存在也跳过
    }

    if (validCount === 0) {
      console.warn(`键 "${key}" 在数组中没有有效数字，结果为 0。`);
      result[key] = 0;
    } else {
      if (validCount < arr.length) {
        console.warn(
          `键 "${key}" 有 ${arr.length - validCount} 个值被跳过（不存在或非有效数字）。`
        );
      }
      result[key] = sum;
    }
  }

  return result;
};
```

## 用法和输出

### 示例

```typescript
const data1 = [
  { a: 32, b: 64, c: "不知道" },
  { a: 32 },
  {
    // 汉字 “一” 同样无效
    a: "一",
    b: "字符串",
    c: "汉字"
  },
  { c: 16 },
  {
    a: 16,
    b: 64,
    c: 16
  }
];

const data2 = [{ a: "不知道" }, { a: "不知道" }, { a: "不知道" }];

const result1 = sumKeysInObjects(data1, ["a", "b", "c"]);
console.log(result1);

const result2 = sumKeysInObjects(data2, ["a", "b", "c"]);
console.log(result2);
```

### 输出

```
键 "a" 有 2 个值被跳过（不存在或非有效数字）。
键 "b" 有 3 个值被跳过（不存在或非有效数字）。
键 "c" 有 3 个值被跳过（不存在或非有效数字）。
{ a: 80, b: 128, c: 32 }

键 "a" 在数组中没有有效数字，结果为 0。
键 "b" 在数组中没有有效数字，结果为 0。
键 "c" 在数组中没有有效数字，结果为 0。
{ a: 0, b: 0, c: 0 }
```
