# Node.js 项目开发规范

本规范所指的 "Node.js 项目"，指基于 `Vue`、`React`、`SolidJS`、微信小程序的 Web 前端项目，基于 `NestJS`、`Fastify`、`Express` 的 Web 后端项目，以及其他使用了 `Node.js` 并且支持 `ESLint`、`Prettier` 进行格式化的项目。

## 总体要求

1. 使用 `pnpm` 进行包管理。
2. 目前所有项目均已经安装了 ESLint 和 Prettier，因此编辑器也要进行如此配置。
3. 代码缩进为 `2` 个空格。
4. 每行字符为 `80`，多出来的要进行适当的换行处理。
5. 语句末尾要加分号。
6. 引号使用双引号。
7. 编写清晰、有效的注释，解释代码目的、逻辑或重要实现细节。
8. 尽量使用 `const` 或 `let` 声明变量，避免使用 `var`。优先使用 `const`，符合 ESLint `prefer-const` 规则。
9. 变量、类型、组件、方法不得用汉语拼音特别是拼音缩写。
10. 换行符为 `LF`，Git 也要如此设置。
11. 谨慎使用 `any` 类型，必须使用时应添加注释说明原因。这符合 ESLint `@typescript-eslint/no-explicit-any` 和 `@typescript-eslint/no-unsafe-assignment` 规则。
12. ESLint 配置文件必须为 flatConfig 格式，必须添加 `prettier`、`import-x` 和 `tsdoc` 插件。推荐使用下面的基本配置示例（需要配合现代化的TypeScript配置使用）：

```typescript
import js from "@eslint/js";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import * as importX from "eslint-plugin-import-x";

import prettierRecommend from "eslint-plugin-prettier/recommended";
import tsdoc from "eslint-plugin-tsdoc";
import globals from "globals";
import tseslint from "typescript-eslint";

import type { Linter } from "eslint";

export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  // tseslint.configs.recommendedTypeChecked,
  prettierRecommend,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      ecmaVersion: 2022, // 与 tsconfig target: "ES2022" 保持一致
      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        projectService: true
      }
    },
    plugins: {
      tsdoc,
      "@typescript-eslint": tseslint.plugin,
      "import-x": importX
    },
    rules: {
      "tsdoc/syntax": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "import-x/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "unknown",
            "parent",
            "sibling",
            "index",
            "object",
            "type"
          ],
          alphabetize: {
            order: "asc",
            caseInsensitive: false
          }
        }
      ]
    },
    settings: {
      "import/resolver-next": [
        createTypeScriptImportResolver({
          // bun: true,
          alwaysTryTypes: true,
          extensions: [
            ".js",
            ".cjs",
            ".mjs",
            ".jsx",
            ".ts",
            ".cjs",
            ".cts",
            ".mts",
            ".tsx",
            ".json"
          ]
        })
      ]
    }
  }
) as Linter.Config;
```

13. 原则上不得使用已经停止维护或长期没有更新的库（如果一个活跃开发的第三方库依赖某个已经停止维护的库，则视情况而定）。
14. 原则上应使用 `es-toolkit` `radash` 等工具库代替 `lodash` 作为 `JS` 工具库。但如果开发的项目需要运行在旧的操作系统或旧的 `Node.js` 环境中，则不适用此规定。
15. 语法规范为 `ES2022+`，采用现代化的TypeScript配置，包括严格类型检查、ES模块优先、现代构建工具兼容等设计原则。但如果开发的项目需要运行在旧的操作系统或旧的 `Node.js` 环境中，则不适用此规定。

一个基本的 Prettier 配置如下：

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": true,
  "tabWidth": 2,
  "singleQuote": false,
  "printWidth": 80,
  "trailingComma": "none"
}
```

16. 不得使用 `@ts-ignore`，必须要使用时（比如说测试用例代码里面要测试错误情况）应该添加说明。
17. 明确以使用箭头函数为优先，除非确实有使用 `function` 关键字定义函数的必要。

## TypeScript 配置规范

### 现代化配置原则

本规范推荐采用严格且现代化的 TypeScript 配置，以确保代码质量、类型安全和构建工具兼容性。以下是核心设计原则：

#### 1. 现代化目标和模块系统

- **编译目标**：使用 `"target": "ES2022"`，支持 top-level await、class fields 等现代特性
- **模块系统**：采用 `"module": "ESNext"` 配合 `"moduleResolution": "bundler"`，专为现代构建工具优化
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

**配置说明**：

- `exactOptionalPropertyTypes`: 精确区分 `undefined` 和未定义属性，提供更严格的类型检查
- `noUncheckedIndexedAccess`: 为索引签名访问添加 `undefined` 检查，防止运行时错误
- `useUnknownInCatchVariables`: catch 块使用 `unknown` 类型，遵循现代错误处理最佳实践
- `noImplicitOverride`: 要求显式使用 `override` 关键字，避免意外覆盖

#### 3. 模块互操作和兼容性

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

**配置说明**：

- `isolatedModules`: 确保每个文件可独立编译，提高构建工具兼容性
- `verbatimModuleSyntax`: 确保 import/export 语法的严格性，避免模块系统混淆
- `esModuleInterop`: 改善 ES 模块和 CommonJS 模块间的互操作性

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

**配置说明**：

- `noErrorTruncation`: 显示完整的类型错误信息，便于调试和问题定位
- `resolvePackageJsonExports/Imports`: 支持现代包管理器和构建工具的标准

#### 5. 构建优化配置

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "importHelpers": true,
    "removeComments": true,
    "downlevelIteration": true
  }
}
```

#### 6. Monorepo 项目配置（按需启用）

对于 Monorepo 项目，以下配置需要根据项目结构决定是否启用：

```json
{
  "compilerOptions": {
    "composite": true
  }
}
```

**使用场景**：

- **启用情况**：多包项目，需要跨包类型检查和增量编译时启用
- **不启用情况**：单体项目或不需要项目引用功能的简单项目
- **根目录配置**：Monorepo 根目录应使用项目引用而非直接编译：

```json
{
  "files": [],
  "references": [{ "path": "./packages/core" }, { "path": "./packages/utils" }]
}
```

### 推荐配置模板

#### 单体项目 tsconfig.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable", "ES2022.Intl"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "moduleDetection": "auto",

    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",

    "resolveJsonModule": true,
    "resolvePackageJsonExports": true,
    "resolvePackageJsonImports": true,
    "skipLibCheck": true,
    "noErrorTruncation": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Monorepo 基础配置 (shared/tsconfig.base.json)

在 Monorepo 项目中，上述配置应作为基础配置，并添加 `"composite": true`。各子包通过 `extends` 继承基础配置。

## TypeScript 类型命名

### 基础类型命名

- Interface: 使用 PascalCase（如 `UserConfig`, `ApiResponse`, `DatabaseConnection`）
  - **如果接口为公共或基础接口，建议在名称中包含 `Base` 或 `Public` 字样**（如 `BaseOptions`, `PublicFormDataType`）
- Type: 使用 PascalCase（如 `BuildMode`, `AssetInfo`, `LoaderResult`）
- Enum：使用 PascalCase（如 `UserStatus`, `ApiEndpoint`, `ErrorCode`）
- Enum 成员：使用 UPPER_SNAKE_CASE（如 `ACTIVE`, `INACTIVE`, `PENDING`）

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

- 命名空间：使用 PascalCase（如 `Utils`, `ConfigParser`, `ApiClient`）
- 模块声明：使用 PascalCase（如 `declare module 'CustomModule'`）

### 类型组合原则

- Interface 主要用于对象结构描述，支持声明合并和继承
- Type 适合联合类型、交叉类型、条件类型等复杂场景
- 优先使用 Interface 定义对象结构，Type 定义计算类型
- 索引签名应明确包含 undefined 类型（配合 `noUncheckedIndexedAccess`）

## 代码命名规范

- 常量: 使用 UPPER_SNAKE_CASE（如 `DEFAULT_PORT`, `MAX_THREADS`, `BUILD_TIMEOUT`），全局常量建议加模块前缀（如 `BUILD_DEFAULT_PORT`）。
- 私有方法: 使用 `_` 前缀（如 `_processModule`, `_handleError`, `_validateConfig`）。
- 类名: 使用 PascalCase（如 `Compiler`, `DevServer`, `AssetLoader`）。
  - **如果类为基础类或公共基类，建议名称中包含 `Base` 或 `Abstract` 字样**（如 `BaseController`, `AbstractService`），便于识别继承体系。
- 函数/变量: 使用 camelCase（如 `buildProject`, `configPath`, `moduleInfo`）。
  - **不限制名称长度，推荐根据实际用途使用有意义且描述性强的长名称**，如 `getUserProfileByIdAsync`、`defaultUserAvatarUrl`，好的名字比注释更直观。
- 未使用的参数和变量: 使用 `_` 前缀，防止产生歧义和 ESLint 警告（如 `array.map((_item, index) => index * 2)`）。当只用第二或后续参数时，前面未用参数也应加 `_` 前缀。这符合 ESLint `@typescript-eslint/no-unused-vars` 规则的 `argsIgnorePattern` 和 `varsIgnorePattern` 配置。
- 文件名: 使用 kebab-case（如 `build-config.ts`, `dev-server.ts`, `asset-loader.ts`），避免与保留字、已有 npm 包重名。
- 目录名: 使用 kebab-case（如 `build-tools/`, `config-parser/`, `utils/`），避免单字符目录名。
- 测试文件命名：
  - 单元测试文件建议以 `.spec.ts` 结尾（如 `math-utils.spec.ts`），用于测试单个函数、类、模块的行为。
  - 集成测试或端到端测试文件建议以 `.test.ts` 结尾（如 `api-integration.test.ts`），用于测试多个模块协作或完整业务流程。
- 缩写统一大写（如 `APIClient`, `HTMLParser`），避免 `ApiClient`、`HtmlParser` 等写法，且避免无意义缩写。
- 异步函数建议以 Async 结尾或用动词前缀（如 `fetchDataAsync`, `getUserInfo`）。
- React 组件名用 PascalCase，hooks 用 use 前缀（如 `useUserInfo`）。
- 类型守卫函数统一用 isXxx 命名（如 `isString`）。
- 变量声明一行一个（如 `const a = 1; const b = 2;`），避免 `let a = 1, b = 2;`。
- 花括号、缩进等风格细节可参考微软官方规范。

## 布尔值命名规范

- 使用 `is`, `has`, `can`, `should`, `will` 等前缀（如 `isLoading`, `hasError`, `canBuild`, `shouldOptimize`），避免 `isNotX`、`flagX` 等反模式，布尔变量应表达正向含义。
- 控制对话框、抽屉、下拉框等组件显示状态的变量名也要遵循上面的规范。

## 事件和回调命名

- 事件处理函数: 使用 `handle` 或 `on` 前缀（如 `handleClick`, `onFileChange`），事件名用 PascalCase（如 `onUserLogin`）。
- 回调函数: 使用描述性动词（如 `onComplete`, `onError`, `beforeBuild`），回调参数用 `event` 结尾（如 `onChangeEvent`）。

## 模块导出命名

- 默认导出: 使用文件主要功能的名称
- 命名导出: 使用具体的功能名称
- 重新导出: 保持原有命名或使用 `as` 重命名以避免冲突
- 模块导入应按照以下顺序进行分组（遵循 ESLint `import-x/order` 规则）：
  1. Node.js 内置模块 (`builtin`)
  2. 外部库 (`external`)
  3. 内部模块 (`internal`)
  4. 未知模块 (`unknown`)
  5. 父级目录模块 (`parent`)
  6. 同级目录模块 (`sibling`)
  7. 索引文件 (`index`)
  8. 对象导入 (`object`)
  9. 类型导入 (`type`)
- 每个分组内按字母顺序排列，区分大小写

## 注释规范

- 测试描述（describe/it）用英文，表达行为和预期结果。
- 类型断言建议谨慎使用，优先类型收窄。
- 代码注释建议用 TSDoc 风格，除非这个模块不用 TS 而用 JS。TSDoc 注释应符合 `tsdoc/syntax` 规则，包括：
  - 使用 `/**` 开始多行注释
  - 使用标准的 TSDoc 标签如 `@param`、`@returns`、`@example` 等
  - 避免无效的标签组合和语法错误
  - 示例：
    ````typescript
    /**
     * 计算两个数的和
     * @param a - 第一个数
     * @param b - 第二个数
     * @returns 两个数的和
     * @example
     * ```typescript
     * const result = add(1, 2); // 返回 3
     * ```
     */
    function add(a: number, b: number): number {
      return a + b;
    }
    ````

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

6. 对于采用 Vite、Webpack、Next.js 构建的项目，必须设置路径前缀 `@`，并确保与推荐的TypeScript配置兼容：
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
9. 【适用于微信小程序，以及采用了文件系统路由的项目】关于页面的命名，如果 y 包含两个以上单词时，应当使用短横线 `-` 连接，比如：`user-list`。不要使用小驼峰命名。
10. 主表页面的列配置（columns）应当放在单独的 JS/TS 文件中，因为有些地方可能需要复用这些列配置。
11. 路由中组件应该使用懒加载导入。
12. 业务模块的编辑表单组件应与主表组件分开存放，不得放在同一文件中。

## CSS 规范

1. 如果一个项目中没有使用 Tailwind CSS，那么应当使用 `less` 或者 `scss` 作为 CSS 预处理器。
2. CSS 命名基于 BEM 规范。
3. 为了进行样式隔离，组件中要导入的样式必须使用 CSS Module 进行导入。

## Vue 项目规范

1. 基于 Vue 3 的项目必须使用 TypeScript。
2. 在 Vue 组件中，必须采用组合式 API（Composition API）进行逻辑组织。
3. 组件的样式应该存放在 `index.{css,less,scss}` 中，组件的样式应该与组件名保持一致。
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
6. 主表的按钮配置应以 计算属性 形式实现。
7. Vue 3 项目的状态管理库使用 `pinia`，持久化使用 `pinia-plugin-persistedstate`。
8. 当导入的组件比较复杂或者打包时出现了 JS 体积较大的情况，应当使用 `defineAsyncComponent`，这样可以优化性能以及减少单个 JS 体积。
9. 集成 `vite-plugin-vue-devtools`。
10. 编辑表单组件（EditForm.vue）应当异步加载：`const EditForm = defineAsyncComponent(() => import("./components/EditForm.vue"));`。
11. 表选择组件（SelectTable）也应当异步加载。
12. 使用 `withDefaults(defineProps<IComponentProps>(), {})` 去定义组件的 props：

```typescript
// 按照 import-x/order 规则排序导入
import { withDefaults, defineProps } from "vue";

export interface IDialogProps {
  overLayZIndex?: number;
  zIndex?: number;
  title?: string;
  visible?: boolean;
  theme?: "blue";
  confirmBtn?: string | boolean;
  cancelBtn?: string | boolean;
  size?: "normal" | "large";
  width?: string | number;
}

const props = withDefaults(defineProps<IDialogProps>(), {
  overLayZIndex: 2499,
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
17. 避免在模板中进行复杂计算，将逻辑提取到计算属性或方法中。

## React 项目规范

1. 基于 React 16+ 的项目必须使用 TypeScript。
2. 基于 React 16+ 的项目应当使用函数式组件，简化组件生命周期管理。
3. 对于非 SSR 的项目，状态管理库使用 `zustand` 或 `redux`。
4. 在定义组件时，应严格声明 `prop` 的类型并据此使用。建议将接收 props 的参数统一命名为 `props`。对于函数式组件，应利用 `React.FC` 来指定组件的返回类型，确保类型安全及代码的一致性。

   ```tsx
   import type { FC, ReactNode } from "react";

   interface IAuthCardProps {
     title: string;
     content: ReactNode;
     footer: ReactNode;
   }

   const AuthCard: FC<IAuthCardProps> = (props) => {
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
13. 对于表单处理，推荐使用 `react-hook-form` 或 `formik`。
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
10. 样式使用 CSS Modules 或 styled-components。
11. 使用 `createResource` 处理异步数据获取。
12. 合理使用 `batch` 批量更新状态。
13. 使用 `onMount` 和 `onCleanup` 处理组件生命周期。

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

## Node.js 后端项目规范

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
13. 日志使用内置的 Logger 或集成 winston。
14. 单元测试和集成测试使用 Jest。
15. 使用 `helmet` 增强安全性。
16. 适配器优先使用 `Fastify` 而不是 `Express`

### Fastify 项目规范

1. 必须使用 TypeScript，配置应包含严格的类型检查和现代化的编译选项。
2. 使用 Fastify 的插件系统组织代码。
3. 路由定义使用 TypeScript 接口确保类型安全：

   ```typescript
   interface IUserQuery {
     id: string;
   }

   interface IUserReply {
     id: string;
     name: string;
   }

   fastify.get<{ Querystring: IUserQuery; Reply: IUserReply }>(
     "/user",
     async (request, reply) => {
       // 实现逻辑
     }
   );
   ```

4. 使用 `@fastify/env` 管理环境变量。
5. 使用 `@fastify/cors` 处理跨域请求。
6. 使用 `fastify-plugin` 封装插件。
7. 错误处理使用 Fastify 的错误处理机制。
8. 数据验证使用 JSON Schema。
9. 日志使用 Fastify 内置的日志系统。
10. 测试使用 `tap` 或 `jest`。

### Express 项目规范

1. 推荐使用 TypeScript。
2. 使用 Express Router 组织路由。
3. 中间件应该是纯函数，避免副作用。
4. 错误处理中间件应该放在所有路由之后。
5. 使用 `helmet` 增强安全性。
6. 使用 `cors` 处理跨域请求。
7. 环境变量使用 `dotenv` 管理。
8. 数据验证使用 `joi` 或 `express-validator`。
9. 日志使用 `winston` 或 `morgan`。
10. 测试使用 `jest` 和 `supertest`。

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
5. 使用 Service Worker 实现离线缓存。
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
