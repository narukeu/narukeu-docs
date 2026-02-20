---
title: 简易版生成随机 UID
---

## 作用

用于生成指定长度的随机唯一标识符（UID），适用于前端开发中需要简单唯一标识的场景，例如生成组件的 key 或模拟数据的主键等。如果对随机性和安全性有更高要求，建议使用 Web Crypto API 等更专业的方案。

## 代码

```typescript
export const uid = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
```

## 示例输出

```typescript
console.log(uid(20));
// 输出 6QUNOE7wgnTrCRMC68k1
```

每次调用结果都不同，长度和内容均为随机。
