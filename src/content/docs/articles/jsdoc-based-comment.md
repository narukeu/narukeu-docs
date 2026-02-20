---
title: JSDoc 注释规范
---

## 1. 基本原则

- 所有导出的函数、常量、类型、接口都必须添加 JSDoc 注释
- 注释统一放在声明语句的上方
- `interface` 和 `type` 的**体内不添加注释**，所有属性说明通过 `@property` 标签在顶部描述
- `@param` 和 `@property` 标签必须附带类型信息

## 2. 函数注释

使用标准 JSDoc 格式，`@param` 和 `@returns` 必须包含类型：

````typescript
/**
 * 函数功能描述
 * @param {string} paramName - 参数说明
 * @param {number} [optionalParam] - 可选参数说明
 * @param {boolean} [paramWithDefault=true] - 带默认值的参数说明
 * @returns {Promise<string>} 返回值说明
 *
 * @example
 * ```typescript
 * const result = await myFunction("test");
 * ```
 */
export const myFunction = async (
  paramName: string,
  optionalParam?: number,
  paramWithDefault = true
): Promise<string> => {
  // ...
};
````

## 3. Interface / Type 注释

- 描述放在第一行
- 使用 `@template` 描述泛型参数
- 使用 `@property {Type}` 描述每个属性，可选属性用 `[propertyName]` 表示
- **接口体内保持干净，不添加任何注释**

```typescript
/**
 * 接口功能描述
 * @template DataShape - 泛型参数说明
 * @property {string} requiredProp - 必填属性说明
 * @property {number} [optionalProp] - 可选属性说明
 * @property {boolean} [propWithDefault=false] - 带默认值的可选属性说明
 * @property {(error: string, code?: number) => void} [onError] - 函数类型属性说明
 */
export interface MyInterface<DataShape = unknown> {
  requiredProp: string;
  optionalProp?: number;
  propWithDefault?: boolean;
  onError?: (error: string, code?: number) => void;
}
```

## 4. 常量注释

简单常量使用单行或多行描述即可：

```typescript
/**
 * 常量功能描述
 * @type {string}
 */
export const MY_CONSTANT = "value";
```

## 5. 对象字面量中的方法注释

对象内部的方法可以在方法上方添加 JSDoc 注释：

```typescript
export const api = {
  /**
   * 方法描述
   * @template T - 响应数据类型
   * @param {string} url - 请求路径
   * @param {Options} [options] - 可选配置
   * @returns {Promise<T>} 请求结果
   */
  get: <T>(url: string, options?: Options): Promise<T> => fetch(url, options)
};
```

## 6. 常用 JSDoc 标签

| 标签          | 格式                                     | 用途         |
| ------------- | ---------------------------------------- | ------------ |
| `@param`      | `@param {Type} name - desc`              | 必填参数     |
| `@param`      | `@param {Type} [name] - desc`            | 可选参数     |
| `@param`      | `@param {Type} [name=default] - desc`    | 带默认值参数 |
| `@returns`    | `@returns {Type} desc`                   | 返回值说明   |
| `@template`   | `@template T - desc`                     | 泛型参数说明 |
| `@property`   | `@property {Type} name - desc`           | 必填属性     |
| `@property`   | `@property {Type} [name] - desc`         | 可选属性     |
| `@property`   | `@property {Type} [name=default] - desc` | 带默认值属性 |
| `@type`       | `@type {Type}`                           | 变量类型     |
| `@example`    | `@example`                               | 使用示例     |
| `@see`        | `@see`                                   | 参考链接     |
| `@deprecated` | `@deprecated`                            | 标记废弃     |

## 7. 复杂类型的书写

对于复杂类型，保持类型完整书写：

```typescript
/**
 * HTTP 请求上下文
 * @property {() => string | null | Promise<string | null>} getToken - Token 获取函数
 * @property {(error: string, statusCode?: number) => void} [onError] - 错误处理回调
 * @property {() => void} [onAuthError] - 认证失败回调
 */
export interface HttpContext {
  getToken: () => string | null | Promise<string | null>;
  onError?: (error: string, statusCode?: number) => void;
  onAuthError?: () => void;
}
```

## 8. 类注释

### 8.1 类声明

- 类的功能描述放在第一行
- 使用 `@template` 描述泛型参数
- 使用 `@extends` 标注继承关系
- 使用 `@implements` 标注实现的接口

```typescript
/**
 * 用户服务类，处理用户相关的业务逻辑
 * @template T - 用户数据类型
 * @extends BaseService
 * @implements Disposable
 */
export class UserService<T = User> extends BaseService implements Disposable {
  // ...
}
```

### 8.2 构造函数

使用 `@param` 描述构造函数参数：

```typescript
export class HttpClient {
  /**
   * 创建 HTTP 客户端实例
   * @param {string} baseUrl - 基础请求地址
   * @param {HttpClientOptions} [options] - 客户端配置选项
   */
  constructor(baseUrl: string, options?: HttpClientOptions) {
    // ...
  }
}
```

### 8.3 类属性

- 公开属性使用 JSDoc 注释
- 私有属性可选择性添加注释

```typescript
export class ConfigManager {
  /**
   * 当前配置版本号
   * @type {string}
   */
  public version: string;

  /**
   * 配置缓存
   * @type {Map<string, unknown>}
   * @readonly
   */
  public readonly cache: Map<string, unknown>;

  /**
   * 内部状态标识
   * @type {boolean}
   * @private
   */
  private _initialized = false;
}
```

### 8.4 类方法

与函数注释规范一致：

````typescript
export class DataProcessor<T> {
  /**
   * 处理数据并返回结果
   * @template R - 返回数据类型
   * @param {T} data - 待处理的原始数据
   * @param {ProcessOptions} [options] - 处理选项
   * @returns {Promise<R>} 处理后的数据
   * @throws {ProcessError} 当数据格式无效时抛出
   *
   * @example
   * ```typescript
   * const processor = new DataProcessor<RawData>();
   * const result = await processor.process(rawData, { validate: true });
   * ```
   */
  async process<R>(data: T, options?: ProcessOptions): Promise<R> {
    // ...
  }
}
````

### 8.5 静态成员

静态属性和方法使用 `@static` 标签（可选，TypeScript 已有 `static` 关键字）：

```typescript
export class Logger {
  /**
   * 默认日志级别
   * @type {LogLevel}
   */
  static defaultLevel: LogLevel = "info";

  /**
   * 获取全局 Logger 实例
   * @returns {Logger} 单例实例
   */
  static getInstance(): Logger {
    // ...
  }
}
```

### 8.6 访问器（Getter / Setter）

```typescript
export class Counter {
  private _count = 0;

  /**
   * 获取当前计数值
   * @type {number}
   */
  get count(): number {
    return this._count;
  }

  /**
   * 设置计数值（必须为非负数）
   * @param {number} value - 新的计数值
   */
  set count(value: number) {
    if (value < 0) throw new Error("Count must be non-negative");
    this._count = value;
  }
}
```

### 8.7 抽象类

使用 `@abstract` 标注抽象类和抽象方法：

```typescript
/**
 * 基础仓储抽象类
 * @abstract
 * @template Entity - 实体类型
 */
export abstract class BaseRepository<Entity> {
  /**
   * 根据 ID 查找实体
   * @abstract
   * @param {string} id - 实体 ID
   * @returns {Promise<Entity | null>} 查找到的实体或 null
   */
  abstract findById(id: string): Promise<Entity | null>;
}
```

### 8.8 完整类示例

```typescript
/**
 * 事件发射器，用于管理事件的订阅和发布
 * @template Events - 事件映射类型
 */
export class EventEmitter<Events extends Record<string, unknown[]>> {
  /**
   * 事件监听器映射表
   * @type {Map<keyof Events, Set<Function>>}
   * @private
   */
  private listeners = new Map<keyof Events, Set<Function>>();

  /**
   * 创建事件发射器实例
   * @param {EmitterOptions} [options] - 发射器配置
   */
  constructor(options?: EmitterOptions) {
    // ...
  }

  /**
   * 注册事件监听器
   * @template K - 事件名称类型
   * @param {K} event - 事件名称
   * @param {(...args: Events[K]) => void} handler - 事件处理函数
   * @returns {() => void} 取消订阅函数
   */
  on<K extends keyof Events>(
    event: K,
    handler: (...args: Events[K]) => void
  ): () => void {
    // ...
  }

  /**
   * 触发事件
   * @template K - 事件名称类型
   * @param {K} event - 事件名称
   * @param {...Events[K]} args - 事件参数
   */
  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    // ...
  }
}
```
