# 自用前端命名规范

## TypeScript 类型命名

- Interface: 使用 I 前缀（如 `IConfig`, `ILoader`, `IDevServerConfig`）。
  - **如果接口为公共或基础接口，建议在名称中包含 `Base` 或 `Public` 字样**（如 `IBaseOptions`, `IPublicFormDataType`），以便一目了然地识别其用途和继承关系。
- Type: 使用 T 前缀（如 `TBuildMode`, `TAssetInfo`, `TLoaderResult`）。
- Enum：使用 E 前缀（如 `EBuildStatus`, `ELoaderType`, `EHMREvent`）。
- Enum 成员：使用 UPPER_SNAKE_CASE（如 `SUCCESS`, `FAILURE`, `PENDING`）。
- Generic 泛型：使用单个大写字母，从 T 开始（如 `T`, `U`, `K`, `V`），如需表达更复杂含义可用 PascalCase 组合词（如 `TResultData`、`TOptions`），集合类泛型可用复数（如 `TItems`）。
- Interface 主要用于结构描述（如对象的属性、方法等），Type 适合联合类型、交叉类型、条件类型等更复杂场景。接口支持声明合并，类型别名不支持。
- 命名空间与模块（namespace/module）：使用 PascalCase（如 `Utils`, `ConfigParser`）。

### 为什么要在类型前面加前缀？

**尽管**这种做法并不被广泛推荐，**但在很多情况下**，为了明确区分业务相关的组件、变量和服务与 TypeScript 类型，采用前缀可以提供清晰的标识。例如，在先前的一些项目中，尤其是基于 Node.js 后端以及使用 React 的前端项目，许多实体均采用了大驼峰命名法。为了进一步增强代码的可读性和维护性，通过为 TypeScript 类型和接口添加 `T` 和 `I` 前缀，能够有效避免混淆，确保开发过程中对不同类型元素的识别**更加直观准确**。

## 代码命名规范

- 常量: 使用 UPPER_SNAKE_CASE（如 `DEFAULT_PORT`, `MAX_THREADS`, `BUILD_TIMEOUT`），全局常量建议加模块前缀（如 `BUILD_DEFAULT_PORT`）。
- 私有方法: 使用 `_` 前缀（如 `_processModule`, `_handleError`, `_validateConfig`）。
- 类名: 使用 PascalCase（如 `Compiler`, `DevServer`, `AssetLoader`）。
  - **如果类为基础类或公共基类，建议名称中包含 `Base` 或 `Abstract` 字样**（如 `BaseController`, `AbstractService`），便于识别继承体系。
- 函数/变量: 使用 camelCase（如 `buildProject`, `configPath`, `moduleInfo`）。
  - **不限制名称长度，推荐根据实际用途使用有意义且描述性强的长名称**，如 `getUserProfileByIdAsync`、`defaultUserAvatarUrl`，好的名字比注释更直观。
- 未使用的参数: 使用 `_` 前缀，防止产生歧义（如 `array.map((_item, index) => index * 2)`）。当只用第二或后续参数时，前面未用参数也应加 `_` 前缀。
- 文件名: 使用 kebab-case（如 `build-config.ts`, `dev-server.ts`, `asset-loader.ts`），避免与保留字、已有 npm 包重名。
- 目录名: 使用 kebab-case（如 `build-tools/`, `config-parser/`, `utils/`），避免单字符目录名。
- 测试文件命名：
  - 单元测试文件建议以 `.spec.ts` 结尾（如 `math-utils.spec.ts`），用于测试单个函数、类、模块的行为。
  - 集成测试或端到端测试文件建议以 `.test.ts` 结尾（如 `api-integration.test.ts`），用于测试多个模块协作或完整业务流程。
- 缩写统一大写（如 `APIClient`, `HTMLParser`），避免 `ApiClient`、`HtmlParser` 等写法，且避免无意义缩写。
- 异步函数建议以 Async 结尾或用动词前缀（如 `fetchDataAsync`, `getUserInfo`）。
- React 组件名用 PascalCase，hooks 用 use 前缀（如 `useUserInfo`）。
- 类型守卫函数统一用 isXxx 命名（如 `isString`）。

## 布尔值命名规范

- 使用 `is`, `has`, `can`, `should`, `will` 等前缀（如 `isLoading`, `hasError`, `canBuild`, `shouldOptimize`），避免 `isNotX`、`flagX` 等反模式，布尔变量应表达正向含义。

## 事件和回调命名

- 事件处理函数: 使用 `handle` 或 `on` 前缀（如 `handleClick`, `onFileChange`），事件名用 PascalCase（如 `onUserLogin`）。
- 回调函数: 使用描述性动词（如 `onComplete`, `onError`, `beforeBuild`），回调参数用 `event` 结尾（如 `onChangeEvent`）。

## 模块导出命名

- 默认导出: 使用文件主要功能的名称
- 命名导出: 使用具体的功能名称
- 重新导出: 保持原有命名或使用 `as` 重命名以避免冲突。

## 其他

- 变量声明一行一个（如 `let a = 1; let b = 2;`），避免 `let a = 1, b = 2;`。
- 优先使用箭头函数，必要时再用 `function`。
- 花括号、缩进等风格细节可参考微软官方规范（如 4 空格缩进，else 单独一行）。
- 测试描述（describe/it）用英文，表达行为和预期结果。
- 类型断言建议谨慎使用，优先类型收窄。
- 代码注释建议用 TSDoc 风格，除非这个模块不用 TS 而用 JS。
