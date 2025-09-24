# 代码命名与风格规范

本规范旨在统一项目在各类 JavaScript/TypeScript 项目中的代码命名与编码风格，确保代码的一致性、可读性和可维护性。

## 1. 代码格式化与质量工具

> [!IMPORTANT]
>
> 自 2025/09/24 之后，所有的新建项目使用 `BiomeJS` 作为唯一的代码格式化和质量检查工具，除非特殊需要，新的项目不再使用 `Eslint + Prettier` 作为代码格式化和质量检查工具。
> 现有的使用了 `Eslint + Prettier` 项目暂时不迁移。

- **统一工具**：所有项目必须使用 `BiomeJS` 作为代码格式化、风格检查（Lint）和导入排序的唯一工具。
- **统一配置**：所有规则均由仓库根目录下的 `biome.jsonc` 文件集中管理，确保开发、CI/CD 等所有环节的行为一致。

### 配置样例

- [BiomeJS 配置样例](/codes/biomejs-config)

- [Eslint 配置样例（旧）](/codes/eslint-flat-config)

## 2. 格式规则

以下格式规则无论使用 `BiomeJS` 还是 `Eslint + Prettier`，均保持一致。

- **缩进**：使用 **2 个空格**进行缩进。
- **最大行宽**：**80 个字符** 。
- **分号**：所有语句末尾**必须**添加分号。
- **引号**：统一使用**双引号** 。此规则同样适用于 JSX 属性。
- **结尾逗号**：在多行数组、对象等结构的最后一个元素后，**必须**添加逗号。
- **箭头函数参数**：箭头函数的参数**始终**使用括号包裹，即使只有一个参数。
- **花括号空格**：在对象字面量的花括号内侧保留一个空格（如 `{ name: "value" }`）。这是 Biome 的默认行为。
- **JSX 尖括号换行**：多行 JSX 元素的闭合尖括号 `>` 不与最后一个属性在同一行。这是 Biome 的默认行为。
- **换行符**：统一使用 **LF (`\n`)** 。Git 仓库也应配置为在提交时强制使用 LF。

## 3. 语法与写法偏好

- **变量声明**：
  - 优先使用 `const`。对于需要重新赋值的变量，才使用 `let`。
  - 若非真的要采用 ES6 以下的语法且不能使用 `Babel` 这类转译工具转换语法，否则严禁使用 `var`。
- **循环方式**：推荐使用 `for...of` 循环来遍历可迭代对象，而不是传统的 `for (let i = 0; ...)` 循环。
- **`any` 的使用**：谨慎使用 `any` 类型。必须使用时，应添加注释说明原因。
- **`@ts-ignore` 的使用**：严禁使用 `@ts-ignore`。在测试等极少数确有必要的场景下，必须在其后紧跟一行注释，解释忽略该错误的具体原因及潜在影响。

## 4. 导入与导出风格

### 导入顺序与分组

导入顺序和分组依次为：“内建模块 / 第三方库 / 工作区路径别名 / 本地父级目录 / 本地同级目录 / 类型导入 / 样式与副作用导入”。

### 导出风格：

- **默认导出 (`export default`)**：用于表达一个文件的核心、单一功能或实体。
- **具名导出 (`export`)**：用于从一个模块中提供多个独立的工具、函数或常量。

## 5. 代码命名规范

好的命名有时比注释更有价值，而且更利于 LLM 理解代码意图。

命名是代码可读性的基石。所有命名均不得使用汉语拼音，尤其是拼音缩写。

- **变量与函数**：使用小驼峰命名法 (camelCase)，如 `buildProject`, `configPath`。推荐使用描述性强的长名称。
- **常量**：使用大写蛇形命名法 (UPPER_SNAKE_CASE)，如 `DEFAULT_PORT`, `MAX_THREADS`。
- **类 (Class)**：使用大驼峰命名法 (PascalCase)，如 `Compiler`, `DevServer`。基类建议包含 `Base` 或 `Abstract` 后缀。
- **私有成员**：使用 TypeScript 的 `private` 关键字或 ECMAScript 的 `#` 私有字段表示，不再使用下划线前缀。
- **布尔值**：使用 `is`, `has`, `can`, `should`, `will` 等作为前缀，并表达正向含义，如 `isLoading`, `hasError`。
- **异步函数**：建议以 `Async` 作为后缀，或使用明确的动词前缀，如 `fetchDataAsync`。
- **事件与回调**：事件处理函数使用 `handle` 或 `on` 前缀；回调函数使用描述性动词命名。
- **未使用的参数**：对于未使用的函数参数或解构变量，**必须**使用下划线 `_` 作为前缀，以消除 Linter 警告。此规则由 `"correctness/noUnusedVariables": "warn"` 强制检查。
- **缩写**：类名中的缩写词应全部大写 (`APIClient`)；变量名中的缩写词遵循 camelCase (`apiClient`)。
- **文件与目录**：
  - 目录和通用文件：统一使用小写连字符命名法 (kebab-case)。
  - 后端特定文件 (NestJS)：遵循框架的点分式规范 (`user.service.ts`)。
  - 测试文件：命名为 `*.spec.ts` 或 `*.test.ts`。
- **React 组件与 Hooks**：组件名用 PascalCase；自定义 Hook 必须以 `use` 开头。
- **类型守卫函数**：统一使用 `isXxx` 格式命名。

## 6. TypeScript 类型命名规范

- **接口 (Interface) 与类型别名 (Type)**：使用 PascalCase，如 `UserConfig`, `BuildMode`。
- **枚举 (Enum)**：
  - 枚举名使用 PascalCase (`UserStatus`)。
  - 枚举成员使用 UPPER_SNAKE_CASE (`ACTIVE`)。
  - 优先使用 `const enum` 以优化产物体积，但需确保构建链支持且符合 `isolatedModules` 的使用要求。
- **泛型 (Generics)**：简单泛型使用 `T`, `U`, `K`；复杂泛型使用有意义的 PascalCase 名称 (`TResultData`)。
- **命名空间 (Namespace)**：禁止在新代码中使用，统一使用 ES 模块。

## 7. CSS 样式规范

- **CSS 预处理器**：在不使用 Tailwind CSS 的项目中，可选用 `less` 或 `scss`。若使用 Tailwind CSS (v4+)，则其应作为唯一的 CSS 构建工具。因为 Tailwind v4 明确和预处理器不兼容。
- **CSS 命名**：遵循 BEM 规范。
- **样式隔离**：React/SolidJS 项目推荐使用 CSS Modules；Vue 项目推荐使用 `<style scoped>`。

## 8. 注释规范

- **核心原则**：注释重在解释“**为什么**”（Why），而非“**做了什么**”（What）。代码应尽量自解释其功能，注释补充设计意图、背景与原因。
- **TSDoc 风格**：在 TypeScript 项目中，公开的 API 应使用 TSDoc 风格的块注释 (`/** ... */`)，并使用 `@param`, `@returns` 等标准标签。
