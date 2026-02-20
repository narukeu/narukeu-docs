---
title: 从选项数组根据 value 返回 label
---

## 说明

根据提供的选择数据数组和输入值，查找首个匹配的记录并返回其标签字符串。函数对键名提供默认值（label、value），支持自定义键名。未找到匹配项时返回字符串 "未指定"。

## 代码

```typescript
/**
 * 根据提供的选择数据数组和输入值，获取对应的标签字符串。
 *
 * @param arr - 一个包含多个记录的对象数组，每个记录通常包含 `value` 和 `label` 属性。
 * @param input - 需要查找的值，用于匹配数组中某个记录的 `value` 属性（严格相等 ===）。
 * @param labelKey - 要返回的标签字段名，默认 "label"。
 * @param valueKey - 用于匹配的值字段名，默认 "value"。
 * @returns 如果找到匹配的记录，则返回该记录的 `label` 属性值；如果没有找到，则返回 "未指定"。
 *
 * @remarks
 * - 使用严格相等（===）进行匹配，类型需一致（例如数字 1 不等于字符串 "1"）。
 * - 如果 arr 为空或不是数组，函数会安全返回 "未指定"。
 * - 可通过提供 labelKey/valueKey 来支持不同字段命名的选项数组。
 */
export const getValueBySelectData = (
  arr: Record<string, any>[],
  input: string | number,
  labelKey: string = "label",
  valueKey: string = "value"
): string => {
  if (!Array.isArray(arr) || arr.length === 0) return "未指定";
  const resultValue = arr.find((item) => item && item[valueKey] === input);
  return resultValue ? String(resultValue[labelKey]) : "未指定";
};
```

## 用法和输出

### 示例 1：基础用法

```typescript
const options = [
  { value: 1, label: "苹果" },
  { value: 2, label: "香蕉" },
  { value: 3, label: "橙子" }
];

console.log(getValueBySelectData(options, 2)); // "香蕉"
console.log(getValueBySelectData(options, 4)); // "未指定"
```

输出：

```
香蕉
未指定
```

### 示例 2：自定义键名 & 类型严格匹配

```typescript
const opts = [
  { id: "a", name: "选项A" },
  { id: "b", name: "选项B" }
];

console.log(getValueBySelectData(opts, "b", "name", "id")); // "选项B"
console.log(getValueBySelectData(opts, "B", "name", "id")); // "未指定"（大小写/精确匹配）
```

输出：

```
选项B
未指定
```

## 注意事项

- 匹配使用严格相等（===），请确保传入 input 的类型与数据源中的 value 类型一致。
- 返回值始终为字符串；如果原始 label 不是字符串，函数会调用 String(...) 转换。
- 对于大型数组，find 是 O(n) 的线性查找；若频繁查询可考虑先构建 Map 索引以提升性能。
