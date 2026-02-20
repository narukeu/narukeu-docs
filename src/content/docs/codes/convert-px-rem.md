---
title: 实现 px 和 rem 的互相转换
---

## 简介

通过获取**根字体大小**实现 px 和 rem 之间的互相转换。

## 代码

```typescript
/**
 * 将 px 和 rem 进行互相转换。
 *
 * @param value - 需要转换的数值，必须为非负数字。
 * @param mode - 转换模式："toRem" 表示 px 转 rem，"toPx" 表示 rem 转 px。
 *
 * @returns 转换后的数值，若参数错误或异常则返回 null。
 *
 */
export const convertRemPx = (value: number, mode: "toRem" | "toPx") => {
  if (typeof value !== "number" || isNaN(value) || value < 0) {
    console.error("value 必须为非负数字");
    return null;
  }

  let htmlFontSize = 16; // 默认值
  try {
    if (typeof window !== "undefined" && window.getComputedStyle) {
      const fontSize = window.getComputedStyle(
        document.documentElement
      ).fontSize;
      htmlFontSize = parseFloat(fontSize) || 16;
    }
  } catch (e) {
    console.warn("无法获取根元素 font-size，使用默认值 16px");
  }

  if (mode === "toRem") {
    // 转rem
    return value / parseFloat(htmlFontSize);
  } else if (mode === "toPx") {
    // 转px
    return value * parseFloat(htmlFontSize);
  } else {
    console.error("参数错误！");
  }
  return null;
};
```

## 用法

```typescript
// 从 rem 转换到 px
const px = convertRemPx(1, "toPx");
// 输出 16

// 从 px 转换到 rem
const rem = convertRemPx(16, "toRem");
```
