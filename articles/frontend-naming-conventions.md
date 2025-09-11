# Node.js 项目开发规范

本规范所指的 “Node.js 项目”，指基于 `Vue`、`React`、`SolidJS`、微信小程序的 Web 前端项目，基于 `NestJS`、`Fastify`、`Express` 的 Web 后端项目，以及其他使用了 `Node.js` 并且支持 `ESLint`、`Prettier` 进行格式化的项目。

> [!TIP]
>
> 由于我绝大部分项目基于 `Node.js` 运行时，本规范将重点围绕 `Node.js` 展开。若有实验性项目采用 Deno、Bun 等其他运行时，可酌情参考本规范。未来，当其他运行时的项目占比提升时，我会考虑对本规范进行修订以适配。

> [!TIP]
>
> 经过评估我认为 [BiomeJS](https://biomejs.dev/)、[OXC Linter](https://oxc.rs/docs/guide/usage/linter.html) 等新兴代码格式化工具目前还不够成熟，暂不纳入本规范的考虑范围。

## 总体要求

1. 使用 `pnpm` 进行包管理。
2. 目前所有项目均已经安装了 ESLint 和 Prettier，编辑器也要进行如此配置；通用代码风格请见“代码风格规范”一章。
3. 变量、类型、组件、方法不得用汉语拼音，特别是拼音缩写。
4. ESLint 配置文件必须为 flatConfig 格式，并集成 `prettier`、`import-x`、`tsdoc` 与 `typescript-eslint`。为避免重复，请直接参考示例文件：[codes/eslint-flat-config.md](https://narukeu.github.io/codes/eslint-flat-config.html)（含基础版、带 `import-x`、React 版）。
   - 使用 `import-x.flatConfigs.recommended` 与 `import-x.flatConfigs.typescript`；
   - files 覆盖 `**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}`；
   - TypeScript 场景优先启用 `projectService: true`；必要时再配置 `parserOptions.project`，同时设置 `tsconfigRootDir`；如需默认项目，可启用 `projectService.allowDefaultProject`；
   - 在 flat config 下使用 `settings["import-x/resolver-next"] = [createTypeScriptImportResolver(...)]` 启用 TS 路径与类型分辨；
   - 需要 Node 与浏览器全局时可合并 `globals.browser` 与 `globals.node`。
5. 原则上不得使用已经停止维护或长期没有更新的库（如果一个活跃开发的第三方库依赖某个已经停止维护的库，则视情况而定）。
6. 原则上应使用 `es-toolkit` 等工具库代替 `lodash` 作为 `JS` 工具库。但如果开发的项目需要运行在旧的操作系统或旧的 `Node.js` 环境中，则不适用此规定。
7. 语法规范为 `ES2022+`，采用现代化的 TypeScript 配置，包括严格类型检查、ES 模块优先、现代构建工具兼容等设计原则。但如果开发的项目需要运行在旧的操作系统或旧的 `Node.js` 环境中，则不适用此规定。

## TypeScript 配置规范

### 现代化配置原则

#### 1. 现代化目标和模块系统

- **编译目标**：使用 `"target": "ES2022"`，支持 `top-level await`、`class` `fields` 等现代特性
- **模块系统**：

> - 前端（Vite/Webpack/Next.js 等打包器场景）：采用 `"module": "ESNext"` 配合 `"moduleResolution": "bundler"`；建议同时开启 `"verbatimModuleSyntax": true` 以确保按书写保留导入导出并配合打包器做摇树与副作用分析。
> - 后端（直接运行于 Node.js 的 NestJS/Fastify/Express 等）：优先采用 `"module": "NodeNext"` 与 `"moduleResolution": "NodeNext"`，以匹配 Node 的 ESM 解析与条件导出行为；同样建议开启 `"verbatimModuleSyntax": true`。Monorepo 场景按包分别配置。

- **模块检测**：使用 `"moduleDetection": "auto"`，智能处理 ESM/CommonJS 混合环境

#### 2. 严格类型检查（强制启用）

以下配置项在所有项目中都应该启用，以确保最高的类型安全：

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
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
    "verbatimModuleSyntax": true
  }
}
```

**配置说明**：

- `isolatedModules`: 确保每个文件可独立编译，提高构建工具兼容性
- `verbatimModuleSyntax`: 严格按书写保留 import/export；较 `importsNotUsedAsValues`/`preserveValueImports` 更现代（TS ≥5）。
- `esModuleInterop`: 改善 ES 模块与 CommonJS 互操作（同时隐式开启 `allowSyntheticDefaultImports`）。

#### 4. 开发体验优化

```json
{
  "compilerOptions": {
    "noErrorTruncation": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "resolvePackageJsonExports": true,
    "resolvePackageJsonImports": true
    // "erasableSyntaxOnly": true // Node.js ≥ 22.18 默认启用“类型擦除”；仅在运行时已验证无 enum/namespace/参数属性等需转换语法，或需与 SWC 的 type stripping 对齐时再考虑开启
  }
}
```

**配置说明**：

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

- 需要跨包类型检查、增量编译或独立构建产物时启用
- 单包项目或无需项目引用的简单项目可不启用

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

#### 7. const enum 与 isolatedModules 注意事项

- `const enum` 在由 `tsc` 产出时会被内联，可减小体积；但许多仅转译的链路（如 Babel、部分 SWC、某些 Jest 转译配置）不会内联，可能导致运行时引用缺失。
- 在启用 `isolatedModules` 或“仅转译不类型检查”的工具链中，若工具不处理 `const enum`，建议：
  - 开启 `preserveConstEnums` 并配合可替换的编译链路，或
  - 改用对象常量配合 `as const`、普通 `enum`，或字面量联合类型。
- 选择 `const enum` 前请确认构建链路（含测试与文档构建）均能正确处理；否则按上面替代方案落地。

## 代码风格规范

### 1. 代码格式化（以 Prettier 为准）

- 缩进：2 个空格。
- 最大行宽：80 字符，必要时进行适当换行。
- 分号：语句末尾必须加分号。
- 引号：统一使用双引号。
- 结尾逗号：尽可能添加（trailingComma: "all"）。
- 箭头函数参数：一律保留括号（arrowParens: "always"）。
- 花括号空格：启用（bracketSpacing: true）。
- JSX/HTML 的尖括号换行：不与前一行同列（bracketSameLine: false）。
- 换行符：LF；Git 也应配置为提交时强制 LF。

一个基本的 Prettier 配置如下：

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": true,
  "tabWidth": 2,
  "singleQuote": false,
  "printWidth": 80,
  "trailingComma": "all",
  "arrowParens": "always",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "endOfLine": "lf"
}
```

注：本文档中所有格式化相关要求以以上 Prettier 配置为唯一准绳；如有不一致，以此配置为准。

### 2. 语法与写法偏好

- 变量声明：尽量使用 `const` 或 `let`，避免使用 `var`；能 `const` 则不 `let`（符合 ESLint `prefer-const`）。
- 函数形式：明确以箭头函数为优先，除非确有使用 `function` 关键字的必要（可在 ESLint 中配置 `func-style`）。
- `any`：谨慎使用。必须使用时应添加注释说明原因（符合 `@typescript-eslint/no-explicit-any` 与 `@typescript-eslint/no-unsafe-assignment`）。
- 目录与仓库级换行符：统一为 LF，并确保 Git 与编辑器一致。
- 禁止使用 `@ts-ignore`。若在测试等场景确有必要，必须紧随其后添加说明性注释，解释原因与影响范围。

### 3. 导入与模块组织风格

- 导入顺序与分组遵循 ESLint `import-x/order` 统一配置（见“总体要求”中 ESLint 示例）。推荐按内建模块、第三方依赖、工作区/别名、本地父级、本地同级、类型导入、样式/副作用等分组，并在组间使用空行分隔。
- 导出风格应与模块职责一致：默认导出用于表达文件的主功能；具名导出用于表达多功能并行的工具集合（命名与取舍详见“代码命名规范”中的相关条款）。

---

## 代码命名规范

- 常量: 使用 UPPER_SNAKE_CASE（如 `DEFAULT_PORT`, `MAX_THREADS`, `BUILD_TIMEOUT`），全局常量建议加模块前缀（如 `BUILD_DEFAULT_PORT`）。
- 私有方法: 使用 `_` 前缀（如 `_processModule`, `_handleError`, `_validateConfig`）。
- 类名: 使用 PascalCase（如 `Compiler`, `DevServer`, `AssetLoader`）。
  - 如果类为基础类或公共基类，建议名称中包含 `Base` 或 `Abstract` 字样（如 `BaseController`, `AbstractService`），便于识别继承体系。
- 函数/变量: 使用 camelCase（如 `buildProject`, `configPath`, `moduleInfo`）。
  - 不限制名称长度，推荐根据实际用途使用有意义且描述性强的长名称，如 `getUserProfileByIdAsync`、`defaultUserAvatarUrl`，好的名字比注释更直观。
- 未使用的参数和变量: 使用 `_` 前缀，防止产生歧义和 ESLint 警告（如 `array.map((_item, index) => index * 2)`）。当只用第二或后续参数时，前面未用参数也应加 `_` 前缀。这符合 ESLint `@typescript-eslint/no-unused-vars` 规则的 `argsIgnorePattern` 和 `varsIgnorePattern` 配置。
- 文件名: 使用 kebab-case（如 `build-config.ts`, `dev-server.ts`, `asset-loader.ts`），避免与保留字、已有 npm 包重名。
- 目录名: 使用 kebab-case（如 `build-tools/`, `config-parser/`, `utils/`），避免单字符目录名。
- 测试文件命名规则请参见“测试规范”章节，此处不再赘述。
- 缩写：类型/类名中的缩写统一大写（如 `APIClient`, `HTMLParser`）；变量/函数中的缩写遵循 camelCase（如 `apiClient`）；避免无意义缩写。
- 异步函数建议以 Async 结尾或用动词前缀（如 `fetchDataAsync`, `getUserInfo`）。
- React 组件名用 PascalCase，hooks 用 use 前缀（如 `useUserInfo`）。
- 类型守卫函数统一用 isXxx 命名（如 `isString`）。

### 布尔值命名规范

- 使用 `is`, `has`, `can`, `should`, `will` 等前缀（如 `isLoading`, `hasError`, `canBuild`, `shouldOptimize`），避免 `isNotX`、`flagX` 等反模式，布尔变量应表达正向含义。
- 控制对话框、抽屉、下拉框等组件显示状态的变量名也要遵循上面的规范。

### 事件和回调命名

- 事件处理函数: 使用 `handle` 或 `on` 前缀（如 `handleClick`, `onFileChange`），事件名用 PascalCase（如 `onUserLogin`）。
- 回调函数: 使用描述性动词（如 `onComplete`, `onError`, `beforeBuild`），回调参数用 `event` 结尾（如 `onChangeEvent`）。

### 模块导出命名

- 默认导出: 使用文件主要功能的名称
- 命名导出: 使用具体的功能名称
- 模块导入顺序与分组规范请见“代码风格规范 > 导入与模块组织风格”。

## TypeScript 类型命名

### 基础类型命名

- Interface: 使用 PascalCase（如 `UserConfig`, `APIResponse`, `DatabaseConnection`）
  - 如果接口为公共或基础接口，建议在名称中包含 `Base` 或 `Public` 字样（如 `BaseOptions`, `PublicFormDataType`）
- Type: 使用 PascalCase（如 `BuildMode`, `AssetInfo`, `LoaderResult`）
- Enum：使用 PascalCase（如 `UserStatus`, `APIEndpoint`, `ErrorCode`）
- Enum 成员：使用 UPPER_SNAKE_CASE（如 `ACTIVE`, `INACTIVE`, `PENDING`）
- Enum：在工具链支持（由 tsc 产出或明确支持 `const enum` 内联）的项目中优先使用 `const enum` 以减少产物体积；否则改用对象常量配合 `as const`、普通 `enum`，或字面量联合类型（详见 TS 配置章节“const enum 与 isolatedModules 注意事项”）。

### 泛型命名

- 简单泛型：使用单个大写字母，从 T 开始（如 `T`, `U`, `K`, `V`）
- 复杂泛型：使用 PascalCase 组合词（如 `TResultData`, `TRequestOptions`）
- 集合类泛型：可使用复数形式（如 `TItems`, `TEntities`）
- 约束泛型：使用有意义的名称表达约束关系（如 `TEntity extends BaseEntity`）

### 函数类型

- 函数类型表达式：使用描述性 PascalCase（如 `EventHandler`, `DataValidator`, `AsyncProcessor`）
- 回调函数类型：以用途命名（如 `OnChangeCallback`, `ErrorHandler`）

### 高级类型

- 映射类型：使用 PascalCase，体现转换关系（如 `Partial<T>`, `ReadonlyKeys<T>`）
- 条件类型：使用 PascalCase，体现条件逻辑（如 `ApiResult<T>`, `NonNullable<T>`）
- 工具类型：使用 PascalCase（如 `DeepPartial<T>`, `KeysOfType<T, U>`）

### 模块和命名空间

- 命名空间：仅用于遗留代码维护或第三方类型补充。不在新代码中使用 `namespace`；统一使用 ES 模块（文件即模块）。
- 模块声明：使用 PascalCase（如 `declare module 'CustomModule'`）；应尽量通过模块化与类型导出替代全局声明。

### 类型组合原则

- Interface 主要用于对象结构描述，支持声明合并和继承
- Type 适合联合类型、交叉类型、条件类型等复杂场景
- 优先使用 Interface 定义对象结构，Type 定义计算类型
- 开启 `noUncheckedIndexedAccess` 后，索引访问结果自动变为 `T | undefined`，不需要也不应在索引签名里额外写 `undefined`；请通过显式判空、默认值或非空断言处理。

### 其他

- 类型断言建议谨慎使用，优先类型收窄。

## 注释规范

- 注释应清晰、有效，重点解释“为什么”（The Why），而非“做了什么”（The What）。代码应尽量自解释其功能，注释补充设计意图、背景与原因。（参见 [Vite 的 Copilot 提示词](https://github.com/vitejs/vite/blob/main/.github/copot-instructions.md)）

- 代码注释建议用 TSDoc 风格，除非这个模块不用 TS 而用 JS。TSDoc 注释应符合 `tsdoc/syntax` 规则，包括：
  - 使用 `/**` 开始多行注释
  - 使用标准的 TSDoc 标签如 `@param`、`@returns`、`@example` 等
  - 避免无效的标签组合和语法错误

## 前端项目通用规范

1. 一个页面中用到的多个组件不得放在同一文件中。
2. 凡是封装的公共组件，组件文件的统一目录下，应该要有一个 README.md 说明文件，布局文件除外。
3. 进行删除操作的时候应当有确认。
4. 如果使用的组件库的表格组件支持无分页的虚拟滚动功能，则无需进行分页设置。
5. 封装公共组件时应当将组件本体和组件 props 类型分离，例如，要封装一个 `CommonInput` 的 Vue 组件，该组件所在目录下应该是这个样子：

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

6. 对于采用 Vite、Webpack、Next.js 构建的项目，团队约定推荐设置路径前缀 `@`（可按需采用其他前缀），并确保与推荐的 TypeScript 配置兼容：
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

7. 对于复杂状态，应当考虑使用状态管理库进行统一管理，也要对这些状态进行持久化存储。
8. 可以对 localStorage 进行封装。
9. 【适用于微信小程序，以及采用了文件系统路由的项目】关于页面的命名，如果页面名称包含两个以上单词时，应当使用短横线 `-` 连接，比如：`user-list`。不要使用小驼峰命名。
10. 主表页面的列配置（columns）应当放在单独的 JS/TS 文件中，因为有些地方可能需要复用这些列配置。
11. 路由中组件应该使用懒加载导入。
12. 业务模块的编辑表单组件应与主表组件分开存放，不得放在同一文件中。

## CSS 规范

1. 如果一个项目中**没有**使用 Tailwind CSS，那么可使用 `less` 或 `scss` 作为 CSS 预处理器。若项目**使用** Tailwind CSS：
   - 使用 Tailwind v4 时：不得与 Sass/Less/Stylus 等预处理器混用，应将 Tailwind 视为完整的 CSS 构建工具链。
   - 使用 Tailwind v3 及更早版本时：可以与预处理器配合，但不推荐；优先通过 PostCSS 工作流集成。
2. CSS 命名基于 BEM 规范。
3. 关于样式隔离与模块化：
   - React/SolidJS 项目：推荐使用 CSS Modules（`*.module.(css|scss|less)`）
   - Vue 项目：一般不使用 CSS Modules，推荐使用 `<style scoped>` 或结合 `:global`/`:deep` 的局部化方案；如需跨组件复用，使用预处理器的分层组织（如 `components/xxx/index.scss` 并按需导入）。

样式细节以本章节为准，Vue 小节不再重复。

## Vue 项目规范

1. 基于 Vue 3 的项目必须使用 TypeScript。
2. 在 Vue 组件中，必须采用组合式 API（Composition API）进行逻辑组织。
3. 样式组织：优先使用 `<style scoped>`；若单独文件，放置在与组件同目录，文件名与组件名保持一致（如 `UserCard.vue` 搭配 `user-card.scss`），避免在 Vue 项目中使用 CSS Modules。
4. 当组件定义的数据较多时，应该把所有组件数据定义在 `pageData` 这个响应式对象之下，比如：

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

5. 若在 JavaScript 部分遇到需要使用 JSX 语法渲染的情况（如主表列配置），应将其单独提取到合适的位置。
6. 主表的按钮配置应以**计算属性**形式实现（动机：避免在模板中做复杂计算、便于逻辑复用，并利用 `computed` 的缓存特性减少重复计算）。
7. Vue 3 项目的状态管理库使用 `pinia`，持久化使用 `pinia-plugin-persistedstate`。
8. 当导入的组件比较复杂或者打包时出现了 JS 体积较大的情况，应当使用 `defineAsyncComponent`，这样可以优化性能以及减少单个 JS 体积。
9. 集成 `vite-plugin-vue-devtools`。
10. 编辑表单组件（EditForm.vue）应当异步加载：`const EditForm = defineAsyncComponent(() => import("./components/EditForm.vue"));`。
11. 表选择组件（SelectTable）也应当异步加载。
12. 使用 `withDefaults(defineProps<DialogProps>(), {})` 去定义组件的 props：

```typescript
// 按照 import-x/order 规则排序导入
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

13. 使用 `<script setup>` 语法糖，避免 Options API。
14. 合理使用 `computed` 和 `watch`，避免不必要的重新计算。
15. 组件事件使用 `defineEmits` 定义，确保类型安全。
16. 使用 `Teleport` 组件处理模态框、通知等需要在 DOM 树特定位置渲染的组件。
17. 避免在模板中进行复杂计算，将逻辑提取到计算属性或方法中。因为**计算属性**具备缓存，模板更简洁、易测试，也便于多处复用。

## React 项目规范

1. 基于 React 16+ 的项目必须使用 TypeScript。
2. 基于 React 16+ 的项目应当使用函数式组件，简化组件生命周期管理。
3. 对于非 SSR 的项目，状态管理库首要考虑 `zustand`，其次考虑 `redux`。
4. 在定义组件时，应严格声明 props 的类型并据此使用，建议将接收 props 的参数统一命名为 `props`。对于函数式组件，不要默认使用 `React.FC`；采用“函数签名 + Props 类型”的方式定义组件，让返回类型由 TypeScript 推断，仅在确有需要时（如需通过类型系统显式提供 `children`）再使用 `React.FC`。

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
6. 使用 React.memo 包装纯组件以优化性能。
7. 合理使用 useMemo 和 useCallback 避免不必要的重新渲染。
8. 使用 React.lazy 和 Suspense 实现组件懒加载。
9. 错误边界（Error Boundaries）用于捕获和处理组件错误。
10. 使用 useEffect 的依赖数组时，确保包含所有依赖项。
11. 自定义 Hook 应以 `use` 开头，复用组件逻辑。
12. 使用 Context API 共享全局状态，避免 prop drilling。
13. 对于表单处理，推荐使用 `react-hook-form`。
14. 使用 `react-use` 作为 hook 工具库。

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
10. 样式使用 CSS Modules 或 solid-styled-components。
11. 使用 `createResource` 处理异步数据获取。
12. 合理使用 `batch` 批量更新状态。
13. 使用 `onMount` 和 `onCleanup` 处理组件生命周期。

## 微信小程序项目规范

1. 尽量使用 TypeScript。
2. 不要使用模板里自带的 `typings` 作为小程序项目的 TS 类型定义，删掉，用 pnpm 安装 `miniprogram-api-typings` 然后配置 tsconfig.json 使用。
3. 小程序有的时候需要用到列表页面，当列表数量过多的时候应该使用分页，后端也要做配合。
4. 为了方便维护起见，小程序源码目录和项目根目录应当为同一层级（也为了方便 npm）。
5. 小程序体积有限，不应该引入过多的库，当项目功能过多的时候应该使用分包。
6. 使用 `wx.cloud` 云开发时，应合理规划数据库结构。
7. 使用小程序原生组件时，注意性能优化，避免频繁的 setData。
8. 图片资源应该压缩，使用 webp 格式。
9. 合理使用小程序的生命周期钩子。
10. 非必要不使用 `Taro`、`uni-app` 等跨端框架，在微信小程序基础上再套一层框架会增加复杂度和不确定性。

## 工具库开发规范

1. 函数应该是纯函数，尽量避免副作用。
2. 提供完整的 TypeScript 类型定义，遵循严格的类型检查配置。
3. 函数命名应该清晰表达其功能。
4. 提供详细的 TSDoc 文档。
5. 支持树摇（tree-shaking），每个函数独立导出。
6. 错误处理应该一致且可预测，遵循 `useUnknownInCatchVariables` 原则。
7. 支持链式调用（如果适用）。
8. 避免依赖过多的第三方库。
9. 原则上可以只提供 ESM 格式，除非有需求必须要兼容 CommonJS 和 UMD。配置应启用 `isolatedModules` 和 `verbatimModuleSyntax` 确保模块兼容性。
10. 在常规场景下，优先以 `rollup` 打包、`tsc` 生成类型，避免引入额外工具链。

> [!TIP]
>
> 微软正在推进 [TypeScript 编译器等核心功能的 Go 原生移植](https://devblogs.microsoft.com/typescript/typescript-native-port) 以提升性能。因此在未来 TS 编译性能将不再是个问题，如果工具库因性能问题而采用 `SWC` 等工具链打包，可酌情考虑改回 `tsc`。

## Node.js 后端项目规范

### 通用规范（后端）

1. 安全：统一采用 `helmet`、CORS 策略、参数化查询与输入校验；鉴权与授权必须覆盖敏感接口；会话管理与限流（防暴力破解）必备。
2. 日志：按等级输出（error/warn/info/debug），可选集成 `winston` 或使用框架内置 Logger，关键路径与安全事件需留痕；建议接入集中化日志（如 ELK/Cloud）。
3. 配置：环境变量集中管理（如 `@nestjs/config`、`@fastify/env`、`dotenv`），区分环境并提供校验。
4. 测试：单元测试（Jest/tap）、集成测试（使用测试数据库）、E2E（Playwright/Cypress 或 supertest）；推荐 AAA 模式。覆盖率基线与细节统一见“测试规范”。
5. 性能：开启压缩、缓存（Redis/内存）、数据库索引与连接池，监控关键指标。

### NestJS 项目规范

1. 必须使用 TypeScript，采用严格的类型检查配置，包括 `exactOptionalPropertyTypes`、`noUncheckedIndexedAccess` 等现代化选项。
2. 以 `前端便利性` 为导向设计接口，减少前端调用次数，提升用户体验。接口应尽可能返回丰富且关联的数据。
3. 尽量使用 `@nestjs/common` 中的 `HttpException` 抛出异常。
4. 增加新的路由的时候，应该配置好 `Swagger`，比如：

   ```typescript
   import {
     ApiOperation,
     ApiQuery
   } from "@nestjs/swagger";
   import {
     ClassSerializerInterceptor,
     Get,
     Query,
     UseGuards,
     UseInterceptors
   } from "@nestjs/common";

   import { CheckAdminGuard } from "./guards/check-admin.guard";

   @ApiOperation({ summary: "获取单一用户信息" })
   @ApiQuery({ name: "id", description: "用户ID" })
   @Get("findOne")
   @UseGuards(CheckAdminGuard)
   @UseInterceptors(ClassSerializerInterceptor)
   findOne(@Query() query: { id: string }) {
     return this.userService.findOne(query.id);
   }
   ```

   **DTO 中也要设置好 @ApiProperty**。

5. 后端应该对前端传来的数据进行第二次的校验，校验不通过的时候应当抛出异常。
6. `findAll` 接口不得做分页，如果需要做一个分页查询的接口，请定义名为 `findList` 的接口。
7. 文件下载接口应该做鉴权和流式传输功能，并且要分片下载。如果项目采用了云服务商的对象存储，为了提升用户体验，可以采用获取临时密钥的方式，让用户直接访问云服务商的对象存储。
8. 使用 `class-validator` 和 `class-transformer` 进行数据验证和转换。
9. 使用依赖注入（DI）管理服务和模块间的依赖关系。
10. 合理使用中间件、拦截器、守卫和过滤器。
11. 数据库操作使用 TypeORM 或 Prisma，避免直接写 SQL。
12. 环境变量使用 `@nestjs/config` 管理。
13. 日志/安全/测试请遵循“通用规范（后端）”。
14. 适配器优先使用 `Fastify` 而不是 `Express`。

### Fastify 项目规范

1. 必须使用 TypeScript，配置应包含严格的类型检查和现代化的编译选项。
2. 使用 Fastify 的插件系统组织代码。
3. 路由定义使用 TypeScript 接口确保类型安全：

   ```typescript
   interface UserQuery {
     id: string;
   }

   interface UserReply {
     id: string;
     name: string;
   }

   fastify.get<{ Querystring: UserQuery; Reply: UserReply }>(
     "/user",
     async (request, reply) => {
       // 实现逻辑
     }
   );
   ```

4. 使用 `fastify-plugin` 封装插件。
5. 错误处理使用 Fastify 的错误处理机制；日志、安全、跨域、配置与测试请遵循“通用规范（后端）”。
6. 数据验证使用 JSON Schema（框架内置支持）。

### Express 项目规范

1. 推荐使用 TypeScript。
2. 使用 Express Router 组织路由。
3. 中间件应该是纯函数，避免副作用。
4. 错误处理中间件应该放在所有路由之后。
5. 安全/日志/配置/测试实践请遵循“通用规范（后端）”。
6. 数据验证建议使用 `joi` 或 `express-validator`（Express 常用方案）。

## 测试规范

### 单元测试

1. 测试文件命名为 `*.spec.ts` 或 `*.test.ts`。
2. 测试描述使用英文，清晰表达测试意图。
3. 使用 AAA 模式：Arrange（准备）、Act（执行）、Assert（断言）。
4. 每个测试应该独立，不依赖其他测试的结果。
5. 使用 `describe` 分组相关测试。
6. Mock 外部依赖，专注测试当前单元。
7. 测试覆盖率应该达到 80% 以上。

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
