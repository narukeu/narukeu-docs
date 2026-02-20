---
title: Node.js 项目开发规范
---

本规范所指的 “Node.js 项目”，指基于 `Vue`、`React`、`SolidJS`、微信小程序的 Web 前端项目，基于 `NestJS`、`Fastify`、`Express` 的 Web 后端项目，以及其他使用了 `Node.js` 并且支持 `BiomeJS` 或 `ESLint + Prettier` 进行格式化与校验的项目。

本规范旨在统一项目开发过程中的架构、工具、配置和最佳实践，而所有代码的命名、格式化与风格相关的具体规则，均遵循独立的 [《代码命名与风格规范》](/articles/frontend-naming-conventions) 文档。

> [!TIP]
>
> 由于我绝大部分项目基于 `Node.js` 运行时，本规范将重点围绕 `Node.js` 展开。若有实验性项目采用 Deno、Bun 等其他运行时，可酌情参考本规范。未来，当其他运行时的项目占比提升时，我会考虑对本规范进行修订以适配。

## 总体要求

1. 包管理器统一使用 `pnpm`。
2. **代码质量与格式化工具**：自 2025-09-24 起，新建项目默认且唯一使用 `BiomeJS` 作为代码质量与格式化工具（含导入排序）。所有代码的命名、格式化与风格规范，均遵循《代码命名与风格规范》文档的约定。存量项目可暂时沿用 `ESLint + Prettier`，但不再新增 ESLint 配置；迁移计划视项目情况推进。
3. **编辑器建议与要求**：
   - VS Code 建议安装官方 Biome 扩展并设为默认格式化器。
   - 项目应提供 `.editorconfig` 与 `.vscode/settings.json` 以统一开发体验。
4. **依赖选择**：原则上不得使用已经停止维护或长期未更新的库（如果一个活跃第三方库依赖某个已停止维护的库，则视情况评估）。
5. **JS 工具库**：原则上应使用 `es-toolkit` 等工具库代替 `lodash`。若需兼容旧操作系统或旧 `Node.js` 环境，此规定可酌情放宽。
6. **语法与构建**：采纳 `ES2022+` 语法与现代 TypeScript 配置（严格类型检查、ESM 优先、兼容现代构建工具）。运行与构建环境最低版本为 **Node.js 22.x**；如需兼容旧环境可按需降级并在文档说明。

## TypeScript 配置规范

### 现代化配置原则

#### 1. 现代化目标和模块系统

- **编译目标**：使用 `"target": "ES2022"`，支持 `top-level await`、`class` `fields` 等现代特性
- **模块系统**：

> - 前端（Vite/Webpack/Next.js 等打包器场景）：采用 `"module": "ESNext"` 配合 `"moduleResolution": "bundler"`；建议同时开启 `"verbatimModuleSyntax": true` 以确保按书写保留导入导出并配合打包器做摇树与副作用分析。
> - 后端（直接运行于 Node.js 的 NestJS/Fastify/Express 等）：优先采用 `"module": "NodeNext"` 与 `"moduleResolution": "NodeNext"`，以匹配 Node 的 ESM 解析与条件导出行为；同样建议开启 `"verbatimModuleSyntax": true`。Monorepo 场景按包分别配置。

- **模块检测**：使用 `"moduleDetection": "auto"`，智能处理 ESM/CommonJS 混合环境

#### 2. 严格类型检查（强制启用）

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true
  }
}
```

> **配置说明**：
>
> - `exactOptionalPropertyTypes`: 精确区分 `undefined` 和未定义属性，提供更严格的类型检查
> - `noUncheckedIndexedAccess`: 为索引签名访问添加 `undefined` 检查，防止运行时错误
> - `useUnknownInCatchVariables`: catch 块使用 `unknown` 类型，遵循现代错误处理最佳实践
> - `noImplicitOverride`: 要求显式使用 `override` 关键字，避免意外覆盖

#### 3. 模块互操作和兼容性

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "rewriteRelativeImportExtensions": true
  }
}
```

**配置说明**：

- `isolatedModules`: 确保每个文件可独立编译，提高构建工具兼容性
- `verbatimModuleSyntax`: 严格按书写保留 import/export；较 `importsNotUsedAsValues`/`preserveValueImports` 更现代（TS ≥5）。
- `esModuleInterop`: 改善 ES 模块与 CommonJS 互操作（同时隐式开启 `allowSyntheticDefaultImports`）。
- `rewriteRelativeImportExtensions`: 将 `.ts` 扩展名在编译后重写为 `.js`，这样的话就不用在 TS 里使用 `import xxx from './a.js'` 的别扭写法。

#### 4. 开发体验优化

```json
{
  "compilerOptions": {
    "noErrorTruncation": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "resolvePackageJsonExports": true,
    "resolvePackageJsonImports": true
  }
}
```

说明：

- `noErrorTruncation`: 显示完整的类型错误信息，便于调试和问题定位
- `resolvePackageJsonExports/Imports`: 支持现代包管理器和构建工具的标准
- `erasableSyntaxOnly`: 仅保留“可擦除”的 TypeScript 语法，限制某些仅类型场景；需与运行时/打包器的类型擦除能力匹配（Node 22.18+ 原生类型擦除）。
- Node 原生运行 TypeScript 时仅做“类型擦除”，不会读取 `tsconfig` 的 `paths/target` 等设置；若需路径别名与更完整的编译能力，请结合打包器或 `tsc`。

> [!TIP]
>
> Nest.js 等后端项目暂不考虑开启 `erasableSyntaxOnly` 配置，除非明确运行于支持原生类型擦除的运行时并已验证行为（例如 Node 22.18+），且代码中未使用需要转换的 TS 语法（如 `enum`、`namespace`、参数属性等）。

#### 5. 构建优化配置

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "importHelpers": true,
    "removeComments": true
  }
}
```

说明：开启 `importHelpers` 需同时安装运行时辅助依赖 `tslib`（dev 或 prod 依业务打包策略决定）。当目标为 `ES2022` 及以上时，一般无需 `downlevelIteration`。

#### 6. Monorepo 项目配置（启用条件 + 基础配置 + references）

启用条件（何时开启 composite/projects 引用）：

- 需要跨包类型检查、增量编译或独立构建产物时启用。
- 单包项目或无需项目引用的简单项目可不启用。

基础配置（建议放在仓库共享配置，如 `shared/tsconfig.base.json`）：

```json
{
  "compilerOptions": {
    "composite": true
  }
}
```

根目录配置（使用项目引用，而非在根直接编译）：

```json
{
  "files": [],
  "references": [{ "path": "./packages/core" }, { "path": "./packages/utils" }]
}
```

#### 7. 枚举策略

枚举命名与使用策略遵循 [《代码命名与风格规范》](/articles/frontend-naming-conventions) 中的统一要求（不使用 `enum`/`const enum`，改用 `as const` 对象 + 字面量联合类型）。

## 前端项目通用规范

### 组件设计原则

1.  **单一职责**：一个组件文件只应包含一个主要组件。若一个页面需要多个组件，应将它们拆分到各自的文件中。
2.  **关注点分离**：业务模块的编辑表单组件应与主表组件分开存放，不得放在同一文件中，以实现逻辑解耦。
3.  **文档化**：凡是封装的公共组件，其目录下应包含一个 `README.md` 说明文件，用于解释组件的用途、props 和事件（布局文件除外）。

### 其他通用规范

1. 进行删除操作的时候应当有确认。
2. 如果使用的组件库的表格组件支持无分页的虚拟滚动功能，则无需进行分页设置。
3. 封装公共组件时应当将组件本体和组件 props 类型分离，例如，要封装一个 `CommonInput` 的 Vue 组件，该组件所在目录下应该是这个样子：

```
- index.ts
- common-input.vue
- types.ts
```

其中，index.ts 内容如下：

```typescript
export { default as CommonInput } from "./common-input.vue";
export * from "./types";
```

4. 对于采用 Vite、Webpack、Next.js 构建的项目，团队约定推荐设置路径前缀 `@`（可按需采用其他前缀），并确保与推荐的 TypeScript 配置兼容：
   `vite.config.ts`：

```typescript
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
```

`tsconfig.app.json`（继承基础配置）：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

5. 对于复杂状态，应当考虑使用状态管理库进行统一管理，也要对这些状态进行持久化存储。
6. 可以对 localStorage 进行封装。
7. 主表页面的列配置（columns）应当放在单独的 JS/TS 文件中，因为有些地方可能需要复用这些列配置。
8. 路由中组件应该使用懒加载导入。

## Vue 项目规范

1. 基于 Vue 3 的项目必须使用 TypeScript。
2. 在 Vue 组件中，必须采用组合式 API（Composition API）进行逻辑组织。
3. 对于状态较为复杂的组件（例如包含多个 loading 状态、表单数据、表格数据等），**推荐**将这些离散的状态聚合到一个 `pageData` 响应式对象中进行管理。这有助于收敛状态，方便整体操作（如重置），并使模板中的访问逻辑更清晰（如 `pageData.loading`）。

   ```typescript
   const pageData = reactive({
     loading: false,
     tableData: [],
     selectedRow: {},
     selectedRowId: "",
     showEditForm: false,
     editFormMode: ""
   });
   ```

4. 若在 JavaScript 部分遇到需要使用 JSX 语法渲染的情况（如主表列配置），应将其单独提取到合适的位置。
5. 主表的按钮配置应以“计算属性”形式实现（动机：避免在模板中做复杂计算、便于逻辑复用，并利用 `computed` 的缓存特性减少重复计算）。
6. Vue 3 项目的状态管理库使用 `pinia`，持久化使用 `pinia-plugin-persistedstate`。
7. 当导入的组件比较复杂或者打包时出现了 JS 体积较大的情况，应当使用 `defineAsyncComponent`，这样可以优化性能以及减少单个 JS 体积。
8. 集成 `vite-plugin-vue-devtools`。
9. 编辑表单组件（EditForm.vue）应当异步加载：`const EditForm = defineAsyncComponent(() => import("./components/EditForm.vue"));`。
10. 表选择组件（SelectTable）也应当异步加载。
11. 使用 `withDefaults(defineProps<DialogProps>(), {})` 去定义组件的 props：

```typescript
// 导入顺序与分组由 Biome 负责自动组织，遵循《代码命名与风格规范》中的分组顺序
import { withDefaults, defineProps } from "vue";

export interface DialogProps {
  overlayZIndex?: number;
  zIndex?: number;
  title?: string;
  visible?: boolean;
  theme?: "blue";
  confirmBtn?: string | boolean;
  cancelBtn?: string | boolean;
  size?: "normal" | "large";
  width?: string | number;
}

const props = withDefaults(defineProps<DialogProps>(), {
  overlayZIndex: 2499,
  zIndex: 2500,
  visible: false,
  theme: "blue",
  size: "normal",
  width: "50%"
});
```

12. 使用 `<script setup>` 语法糖，避免 Options API。
13. 合理使用 `computed` 和 `watch`，避免不必要的重新计算。
14. 组件事件使用 `defineEmits` 定义，确保类型安全。
15. 使用 `Teleport` 组件处理模态框、通知等需要在 DOM 树特定位置渲染的组件。
16. 避免在模板中进行复杂计算，将逻辑提取到计算属性或方法中。因为“计算属性”具备缓存，模板更简洁、易测试，也便于多处复用。

## React 项目规范

1. 基于 React 16+ 的项目必须使用 TypeScript。
2. 基于 React 16+ 的项目应当使用函数式组件，简化组件生命周期管理。
3. 对于非 SSR 的项目，状态管理库首要考虑 `zustand`，其次考虑 `redux`。
4. 在定义函数式组件时，应严格声明 Props 类型。推荐采用“函数签名 + Props 类型”的方式定义组件，让返回类型由 TypeScript 推断，而非默认使用 `React.FC`。仅在确有需要时（如需通过类型系统显式提供 `children`）再使用 `React.FC`。

   ```tsx
   import type { ReactNode } from "react";

   interface AuthCardProps {
     title: string;
     content: ReactNode;
     footer?: ReactNode;
   }

   const AuthCard = (props: AuthCardProps) => {
     // 此处省略 500 字
   };
   ```

5. 较为复杂的状态，应当使用 `useReducer` 进行管理。
6. 使用 `React.memo` 包装纯组件以优化性能。
7. 合理使用 `useMemo` 和 `useCallback` 避免不必要的重新渲染。
8. 使用 `React.lazy` 和 `Suspense` 实现组件懒加载。
9. 错误边界（Error Boundaries）用于捕获和处理组件错误（可使用类组件 ErrorBoundary 或社区库进行封装）。
10. 使用 `useEffect` 的依赖数组时，确保包含所有依赖项。
11. 使用 Context API 共享全局状态，避免 prop drilling。
12. 对于表单处理，推荐使用 `react-hook-form`。
13. 使用 `react-use` 作为 hook 工具库。

## SolidJS 项目规范

1. 必须使用 TypeScript。
2. 使用 SolidJS 的细粒度响应式系统，避免不必要的重新渲染。
3. 使用 `createSignal` 创建响应式状态。
4. 使用 `createMemo` 创建派生状态，类似于 Vue 的计算属性。
5. 使用 `createEffect` 处理副作用。
6. 组件应为函数组件，使用 JSX 语法。
7. 使用 `Show`、`For`、`Switch` 等控制流组件替代条件渲染。
8. 状态管理使用 SolidJS Store 或第三方库如 `solid-zustand`。
9. 路由使用 `@solidjs/router`。
10. 使用 `createResource` 处理异步数据获取。
11. 合理使用 `batch` 批量更新状态。
12. 使用 `onMount` 和 `onCleanup` 处理组件生命周期。

## 微信小程序项目规范

1. 尽量使用 TypeScript。
2. 不要使用模板里自带的 `typings` 作为小程序项目的 TS 类型定义，删掉，用 pnpm 安装 `miniprogram-api-typings` 然后配置 tsconfig.json 使用。
3. 小程序有的时候需要用到列表页面，当列表数量过多的时候应该使用分页，后端也要做配合。
4. 为了方便维护起见，小程序源码目录和项目根目录应当为同一层级（也为了方便 npm）。
5. 小程序体积有限，不应该引入过多的库，当项目功能过多的时候应该使用分包。
6. 使用 `wx.cloud` 云开发时，应合理规划数据库结构。
7. 使用小程序原生组件时，注意性能优化，避免频繁的 `setData`。
8. 图片资源应该压缩，使用 webp 格式。
9. 合理使用小程序的生命周期钩子。
10. 非必要不使用 `Taro`、`uni-app` 等跨端框架，在微信小程序基础上再套一层框架会增加复杂度和不确定性。

## 工具库开发规范

1. 函数应该是纯函数，尽量避免副作用。
2. 提供完整的 TypeScript 类型定义，遵循严格的类型检查配置。
3. 支持树摇（tree-shaking），每个函数独立导出。
4. 错误处理应该一致且可预测，遵循 `useUnknownInCatchVariables` 原则。
5. 支持链式调用（如果适用）。
6. 避免依赖过多的第三方库。
7. 原则上可以只提供 ESM 格式，除非有需求必须要兼容 CommonJS 和 UMD。配置应启用 `isolatedModules` 和 `verbatimModuleSyntax` 确保模块兼容性。
8. 在常规场景下，优先以 `rollup` 打包、`tsc` 生成类型，避免引入额外工具链。

> [!TIP]
>
> 微软正在推进 [TypeScript 编译器等核心功能的 Go 原生移植](https://devblogs.microsoft.com/typescript/typescript-native-port) 以提升性能。因此在未来 TS 编译性能将不再是个问题，如果工具库因性能问题而采用 `SWC` 等工具链打包，可酌情考虑改回 `tsc`。

## Node.js 后端项目规范

所有后端项目的通用开发规范，请参阅 [《后端项目开发规范（通用）》](./backend-rules.md) 文档。

### NestJS 项目规范

请参见《[NestJS 开发规范](/articles/nestjs-dev-conventions.md)》。

## 命名与文件命名

所有代码的命名、文件命名、格式化与风格规范均遵循 [《代码命名与风格规范》](/articles/frontend-naming-conventions) 文档的统一约定。

## 测试规范

### 单元测试

1. 测试描述使用英文，清晰表达测试意图。
2. 使用 AAA 模式：Arrange（准备）、Act（执行）、Assert（断言）。
3. 每个测试应该独立，不依赖其他测试的结果。
4. 使用 `describe` 分组相关测试。
5. Mock 外部依赖，专注测试当前单元。
6. 测试覆盖率应该达到 80% 以上。

### 集成测试

1. 测试真实的数据库连接和 API 调用。
2. 使用测试数据库，避免污染生产数据。
3. 测试完整的业务流程。
4. 清理测试数据，确保测试环境干净。

### E2E 测试

1. 使用 Playwright 或 Cypress 进行端到端测试。
2. 测试关键用户路径。
3. 使用 Page Object 模式组织测试代码。
4. 考虑并发测试，确保测试稳定性。

## 性能优化规范

### 前端性能优化

1. 使用代码分割（Code Splitting）减少初始包大小。
2. 图片使用懒加载和适当的格式（WebP、AVIF）。
3. 使用 CDN 加速静态资源。
4. 启用 Gzip/Brotli 压缩。
5. 使用 Service Worker 实现离线缓存，并制定缓存失效与更新策略（例如：版本化缓存 + manifest、stale-while-revalidate、后台同步更新与用户提示刷新）。
6. 避免内存泄漏，及时清理事件监听器。
7. 使用 Web Workers 处理计算密集型任务。
8. 合理使用缓存策略。

### 后端性能优化

1. 数据库查询优化，使用索引。
2. 使用连接池管理数据库连接。
3. 实现 API 缓存策略（Redis、内存缓存）。
4. 使用压缩中间件减少响应体积。
5. 实现请求限流和防护措施。
6. 监控性能指标，及时发现问题。
7. 使用 CDN 分发静态内容。
8. 数据库读写分离，提高并发能力。

## 安全规范

### 前端安全

1. 输入验证和输出编码防止 XSS 攻击。
2. 使用 HTTPS 传输敏感数据。
3. 实施内容安全策略（CSP）。
4. 避免在客户端存储敏感信息。
5. 使用 SRI（子资源完整性）验证外部资源。
6. 定期更新依赖包，修复安全漏洞。

### 后端安全

1. 使用参数化查询防止 SQL 注入。
2. 实施适当的身份验证和授权机制。
3. 使用 CORS 控制跨域访问。
4. 限制请求频率，防止 DDoS 攻击。
5. 验证和清理用户输入。
6. 使用安全的会话管理。
7. 记录安全相关的日志。
8. 定期进行安全审计和渗透测试。

## LLM 相关

1. 可以将本规范进行裁剪，或者将本规范的关键内容提炼成提示词（Prompt）供 AI Agent 使用。
2. 在编码时应当开启 AI Agent 的 `fetch` 功能，以便其能访问所开发的项目相关的 API 文档、代码仓库等资源，保证准确度。
