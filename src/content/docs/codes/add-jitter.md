---
title: 为给定的延迟时间添加抖动
---

> [!NOTE]
>
> 已在 OKUtils 中可用：https://github.com/okutils/jitter

## 简介

为基础延迟时间添加一定范围的抖动（jitter），常用于网络请求重试、定时任务等场景，避免所有请求或任务在同一时刻集中触发，减少雪崩效应和资源竞争。

抖动的实现方式是：在基础延迟 `delay` 的基础上，随机加上一个范围为 `±delay * factor` 的浮动值。即最终延迟会在 `[delay - delay*factor, delay + delay*factor]` 区间内随机波动，且不会小于 0。

## 代码

```typescript
/**
 * 为给定的延迟时间添加抖动（jitter），用于如重试、定时等场景，避免所有请求同时触发。
 *
 * @param delay - 基础延迟时间（毫秒）。
 * @param factor - 抖动因子，默认为 0.2，表示最大正负 20% 的波动。
 * @returns 返回加上抖动后的延迟时间（不会小于 0）。
 */
export const addJitter = (delay: number, factor = 0.2): number => {
  const jitter = delay * factor * (Math.random() * 2 - 1);
  return Math.max(0, delay + jitter);
};
```

## 用法和输出

### 示例

```typescript
// 多次调用，查看抖动效果
for (let i = 0; i < 5; i++) {
  const jittered = addJitter(1000, 0.2);
  console.log(jittered);
}

// 只指定 delay，使用默认抖动因子
console.log(addJitter(500));
```

### 输出示例

```
1023.45
812.12
1198.76
950.33
1075.98
489.87
```

（实际输出为 800~1200 之间的浮点数，最后一行为 500±100 之间的浮点数）

## 说明

- 抖动后的延迟时间是一个浮点数，范围为 `[delay - delay*factor, delay + delay*factor]`。
- 抖动因子可根据实际需求调整，通常建议 `0.1`~`0.5` 之间。如果设置的太大（比如大于 1）可能会产生预期意外的运行结果。

- 函数采用了 `return Math.max(0, delay + jitter)` 进行返回，之所以这么做是为了防止在极端情况下（比如原始 `delay` 很小，但 `factor` 很大，且随机数取到接近 `-1`），可能出现 `delay + jitter` 小于 0 的情况，为了避免出现预期以外的情况，所以会返回 0.
