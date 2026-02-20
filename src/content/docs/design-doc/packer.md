---
title: PRD 文档
---

## 1. 前言

一个个人项目，做一个类似 WebPack 风格的打包工具。比较喜欢 Webpack 的设计，但是 Webpack 历史包袱太重了，就打算抱着试一试的心态做一个所谓的「现代化 Webpack」。

## 2. 设计目标

### 2.1 前端优先

现在 Node.js 生态中，ESM 已经成为未来的，对于后端和许多工具库场景，打包的必要性在下降，越来越多项目选择直接以源码形式、或者简单经过 TSC 编译后就发布。

所以 Packer 关注于前端的应用打包，以及前端相关的库打包。

### 2.2 框架无关

从框架本身来说，Packer 可以用于多种前端框架，而不仅仅局限于某一种框架。

但从项目初期开发目标来看，优先支持 React 生态。

### 2.3 Unplugin 生态兼容

Packer 既然是一个独立于 Vite 和 Webpack 的打包器，那么不会去直接做与 Vite、Webpack 的兼容，这个没有意义，但为了复用现有的生态，Packer 会兼容 Unplugin 生态。

### 2.4 现代化

Packer 目前来说是一个个人项目，没有商业化和大规模兼容性的需求，因此在设计上会进行一些激进的取舍。

- 仅面向现代化的运行环境和工具链：运行环境假定为 Node.js 22+
- 只关心 ESM，不兜底 CJS 互操作：不提供 CommonJS 输出。对于必须依赖 CJS 的场景，交由 Node.js 22+ 的原生互操作能力自行解决，或者由上层应用显式处理。
- 不兼容现有生态：不支持 Webpack、Vite 等，仅支持 Unplugin。
- Node.js 22.18 之后已经原生支持 TypeScript 可擦除语法的直接运行，因此配置文件也可以直接使用 TypeScript 编写，然后通过 Node.js 直接运行。
在个人项目的前提下，尽可能简化实现与心智负担，把精力集中在「现代前端开发体验」本身，而不是解决历史技术债。

## 3. 预期的项目结构
- packages
  - core
  - cli
  - config
  - dev-server
  - plugins（但 plugins 目录本身不是一个包）
    - plugin-css
  - loaders（但 loaders 目录本身不是一个包）
    - loader-swc
    - loader-babel
## 3. 配置文件和核心功能

我们可以从配置文件入手。

```typescript
export type SupportFormat = "esm" | "iife";

export interface BaseOptions {
  entry: string | string[];
  output?: {
    dir: string;
    format: SupportFormat;
  };
}

export interface LoaderOptions {
  test: string;
  exclude?: string;
  name: string;
}

export interface PluginOptions {
  name: string;
  options?: Record<string, any>;
}
export interface ServerOptions {
  port?: number;
  host?: string;
  static?: string; // 静态资源目录，默认 public
}

export interface AssetsOptions {
  inlineLimit?: number; // 资源内联限制，单位字节，默认 8192
  types?: string[]; // 支持的资源类型，会写在常量里面
}

export interface BuildOptions {
  sourcemap?: boolean;
}

export interface PackerConfig extends BaseOptions {
  loaders?: LoaderOptions[];
  plugins?: PluginOptions[];
  devServer?: ServerOptions;
  assets?: AssetsOptions;
}
```

### 3.1 入口和出口

### 3.2 Loaders

这里的 Loader 类似 Webpack 的 Loader，负责对特定类型的文件进行处理。每个 Loader 通过 `test` 字段来匹配文件类型。与 Webpack 不同的是，这里的 test 仅支持 glob 模式的字符串匹配。

Webpack 需要 `asset/resource` 来处理静态资源文件，但 Packer 这里并不需要，除非需要自定义逻辑，否则内置的静态资源处理已经足够。

### 3.3 Plugins

### 3.4 开发服务器

基于 `h3js/h3` 这一轻量级的 HTTP 框架，Packer 内置了一个开发服务器，支持热更新和静态资源服务。

开发服务器采用**全量打包**模式，而不是 Vite 中通过 Esbuild 实现的按需编译，为什么这么做？

- 现在基于原生的转译工具速度已经非常快，全量打包的时间开销已经可以接受。
- 全量打包可以更好地模拟生产环境，减少开发和生产环境的差异。
- Vite 的按需编译在大型项目中可能会导致性能瓶颈，尤其是在复杂依赖关系的情况下。
- Vite Rolldown 新版也已经明确表示将会用回全量打包模式[^1]。

[^1]: https://vite.dev/guide/rolldown#future-plans

#### 3.4.2

## 4. 核心概念
### 4.1 Compiler 和 Compilation
Webpack 的 Compiler 和 Compilation 仍然是一个不错的设计，但是需要在此基础上进行简化和现代化。



## 5. 官方插件

### 5.1 `@packer/swc-loader`

作为默认的 JS/TS Loader，基于 SWC 实现。因为 Packer 目前目标是完成 React 的打包，又需要性能，因此结合 swc-loader 进行。

## 6. 依赖

### 6.1 核心依赖

| 软件包  | 仓库地址 | 作用               |
| ------- | -------- | ------------------ |
| Consola |          | 日志               |
| h3      |          | 轻量 HTTP 服务器   |
| parse5  |          | 提供 HTTP 解析能力 |

### 5.2 SWC Loader 依赖
