---
title: '聊下 `rewriteRelativeImportExtensions` 这个 TS 配置项'
---

## 0. 前言

这个配置项是 TypeScript 5.7+ 版本中存在的，距离 5.7 发布也有一年多了，不过感觉国内的技术文章里面提及这一块的不算太多。结合我之前写前端的时候对 ESM 模块系统有一些误会，所以我觉得可以从 ESM 模块系统开始，一直科普到 TypeScript 5.7 的 `rewriteRelativeImportExtensions` 这个配置项。

## 1. 为什么我们在开发前端项目的时候很多时候不需要写扩展名

其实用 Webpack + JavaScript 的年代很多时候我们就会在 import 的时候省略掉扩展名。

`Ruoyi-Vue` 仓库的主分支还是 Webpack + Vue CLI + JavaScript + Vue 2 的老项目，我们以它为例，我们会看到有这样的写法：

```javascript
import { parseTime } from "./ruoyi";
```

```javascript
import store from "@/store";
```

实际上，`./ruoyi` 解析的是 `./ruoyi.js`，`@/store` 解析的是 `src/store/index.js`（`@` 是路径别名，我们这里不介绍）。

对于那些用 Vite、TypeScript、Nextjs 的新项目也是类似的，很多时候我们也不会写扩展名。

这样写当然有不少好处，比如代码更简洁、重构路径更方便等等。

不过这样写多了，可能会造成一个误会，会以为，我们导入 JS 模块的时候，不需要写后缀，或者，导入一个有 index 模块的目录的时候，也不需要写后缀。我以前也是这么想的。

其实没有。这些之所以能不写扩展名，是因为打包工具帮我们处理好了。如果从 ESM 规范的角度来看，导入模块的时候，还是必须要写扩展名的。

所以，当一个 JavaScript 项目在没有使用打包工具的时候，通过 ESM 语法 `import` 导入另一个模块需要这样：

```javascript
import { foo } from "./foo.js";
```

否则的话就会解析出问题。

## 2. Pure ESM 和去打包工具化

ES6 定义了一套官方层面的模块系统，即 ES Modules，简称 ESM。这一套系统比什么 CommonJS 之类的解决方案更标准、更现代。ES6 如今已经 10 多年了，Node.js 对 ESM 的支持当然越来越好。我记得去年我在 CommonJS 包里导入 ESM 的时候 Node.js 控制台还会报警告，现在新版已经没有了。

言归正传，就因为上述原因，有一种 Pure ESM 和去打包工具化的的潮流正在兴起，特别是在后端和现在的库领域。

Pure ESM 意味着，一个包在发布的时候已经完全不提供 CommonJS 版本，只有 ESM 版本，新版的 Node.js 对 ESM、CommonJS 的互操作已经足够好了，我们完全可以直接使用 ESM，而且 CommonJS 包确实在消亡了。

去打包工具化就意味着不再使用 Rollup/Webpack/tsup 之类的对后端和库进行打包，最多就用 TSC 之类的转译成 JS。后端当然使用打包的场景不多，但现在库领域也在慢慢减少对打包的依赖了。

库当初选择用打包工具，一是为了打包在一起压缩体积；二是，毕竟我同时生成 CommonJS、ESM、UMD，配置一下 Rollup 就完事了，很方便。但库绝大多数情况下本来就是要被打包进最终项目的，库本身再打包意义不大。

在这种 Pure ESM + 去打包工具化的场景下，我们就必须要遵守 ESM 规范了，打包工具也不会帮我们兜底了。

在一个后端/库的 tsconfig.json 里面，在打包器模式下，我们会将 `moduleResolution` 配置成 `bundler`，TS 会认为我们最后有打包器兜底，不会强制要求我们写扩展名，但是 `bundler` 不适用于不使用打包器的情况，因此我们既要在编译之后仍然是 ESM 形态，又不使用打包器，那么 `moduleResolution` 必须要配置成 `nodenext` 或者 `node16`（这两个差别不是很大，如果你在 Node.js 22 之后，我更建议你用 `nodenext`）。

但是在 TypeScript 5.7 之前，使用扩展名的写法真的很别扭。可能在以前，这不是个太大的问题，因为大家会选择用打包工具来打包一个库，而且当初很多后端虽然代码本身用 TS 写，但是编译的时候是 CommonJS 输出的，没必要遵守 ESM 规范。但是，现在新趋势已经有了，TypeScript 迫切需要解决这个问题。

## 3. 以前是需要在 TS 里面写 .js 后缀

TypeScript 5.7 之前坚持比较原教旨的设计，不希望介入太多运行时逻辑，通俗来说就是：

> 我只是一个类型检查、LSP 和转译工具，扩展名这一块不是我负责。

可能有点像下面的一个古代笑话：

> 一人前去观武场，飞箭不小心伤到了他，他请外科医生去帮他治疗。医生说：“这很简单”，就把外截的箭杆锯掉了，之后向病人索要报酬。病人问：“里面的怎么办？”，医生说：“这是内科的事。”

所以在 `node16/next` 下，我们当时为了在一个 TS 模块里面引入另一个 TS 模块，就必须写成下面这样：

```typescript
// foo.ts
export const foo = 123;

// index.ts
import { foo } from "./foo.js";
```

你看，这里明明是 `foo.ts` 文件，我们却要写成 `./foo.js`，这就很别扭。

如果你强行写成 `import { foo } from "./foo.ts"`，反而会出现问题。

就算你在 tsconfig.json 里面配置了 `allowImportingTsExtensions`，但因为没有重写后缀，运行的时候还是会报错，Node 会提示找不到模块。

## 4. rewriteRelativeImportExtensions 解决的问题

TypeScript 5.7 出现了 `rewriteRelativeImportExtensions` 这个配置项，解决了上面的问题。

要开始使用它，我们需要在 tsconfig.json 里面开启它：

```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true, // 最好显式地开启这个选项
    "rewriteRelativeImportExtensions": true
  }
}
```

根据文档，当导入路径为相对路径（以 `./` 或 `../` 开头）、以 TypeScript 扩展名（如 `.ts`、`.tsx`、`.mts`）结尾，并且不是声明文件时，编译器会将该路径重写为对应的 JavaScript 扩展名（`.js`、`.jsx`、`.mjs`）。

也就是说，我们可以像下面这样写：

```typescript
// foo.ts
export const foo = 123;
// index.ts
import { foo } from "./foo.ts";
```

编译后，TSC 自动把 `./foo.ts` 重写成了 `./foo.js`：

```javascript
// dist/foo.js
export const foo = 123;
// dist/index.js
import { foo } from "./foo.js";
```

这样我们在 TS 代码里面就可以很自然地使用 `.ts` 扩展名了，而不需要刻意去写 `.js`。

除 TSC 已经支持，Babel 在 7.23.0、SWC　在 1.13.7 之后也都开始支持这个配置项了。
