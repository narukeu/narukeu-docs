---
title: Go 语言项目开发、风格和命名规范
---

## 1. 编码基础规范

### 1.1. 代码格式化

- **缩进**：官方推荐使用 **Tab** 进行缩进，不使用空格。
- **最大行宽**：**80 个字符** 。
- **换行符**：统一使用 **LF (`\n`)** 。Git 仓库也应配置为在提交时强制使用 LF。
- **一致性**：一致的代码更易于维护、理解，需要更少的认知开销。在代码库中保持一致的风格。
- **使用原始字符串字面量避免转义**：使用反引号创建原始字符串，避免手动转义。

### 1.2. 质量工具

使用 `golangci-lint` 作为代码质量检查工具，并配置好 `goimports` 进行自动导入排序和格式化。

### 1.3. 注释规范

- **核心原则**：注释重在解释“**为什么**”（Why），而非“**做了什么**”（What）。代码应尽量自解释其功能，注释补充设计意图、背景与原因。非必要不写注释。
- **Godoc 风格**：所有导出的成员（包、函数、类型等）都必须有清晰的 Godoc 注释。注释应以被注释的成员名称开头。

```go
// Package path implements utility routines for manipulating slash-separated paths.
package path

// Open opens the named file for reading.
func Open(name string) (*File, error) {
    // ...
}
```

- **避免裸参数**：函数调用中的裸参数会损害可读性。为含义不明显的参数添加 C 风格注释（如 `/* isLocal */`）。

## 2. 项目与包组织

- `go.mod` 中的依赖应该显著区分直接依赖和间接依赖。

### 2.1. 项目结构

> [!IMPORTANT]
>
> Go 不推荐使用 `/src` 目录来存放源代码。

根据 Go 语言社区的最佳实践，推荐以下项目目录结构，结合实际项目需求进行调整：

#### 核心 Go 目录

- `/cmd`: 存放项目的主应用入口。每个子目录对应一个可执行文件，目录名即为可执行文件名。
- `/internal`: 存放项目内部私有代码。此目录下的包无法被外部项目导入。这是放置业务逻辑和不希望外部使用的共享库的最佳位置。
- `/pkg`: 存放可以被外部应用安全导入的公共库代码。放置在此处的代码应具备良好的通用性和稳定性，并有明确的 API 承诺。

#### 应用配置与脚本

- `/api`: 存放 API 定义文件，如 OpenAPI/Swagger specs、gRPC 的 `.proto` 文件、JSON schema 文件等。
- `/configs`: 存放配置文件模板或默认配置。
- `/scripts`: 存放用于构建、安装、分析等操作的辅助脚本，保持根目录 Makefile 的简洁。

#### 部署与运维

- `/build`: 存放打包和持续集成（CI）相关的文件。例如，`build/package` 存放容器（Docker）、操作系统包（deb, rpm）的配置；`build/ci` 存放 CI 配置文件。
- `/deployments`: 存放 IaaS、PaaS、k8s 等部署配置和模板（如 `docker-compose.yml`, Helm charts, Terraform 文件）。
- `/init`: 存放系统初始化脚本（如 `systemd`）。

#### 其他目录

- `/docs`: 存放设计文档、用户手册等（Godoc 之外的文档）。
- `/examples`: 存放应用或公共库的使用示例。
- `/test`: 存放额外的外部测试应用和测试数据。
- `/tools`: 存放本项目的支持工具，这些工具可以导入 `/pkg` 和 `/internal` 中的代码。
- `/web`: 存放 Web 应用相关资源，如静态文件、服务端模板和 SPA。

### 2.2. 包与声明组织

- **分组相似声明**：使用分组语法将相似的声明（import、const、var、type）组合在一起。但只分组相关的声明，不要将无关的声明分组。
- **导入分组顺序**：应该有两个导入组：标准库和其他所有包。这是 `goimports` 默认应用的分组。
- **函数分组和顺序**：
  - 函数应按大致的调用顺序排序。
  - 文件中的函数应按接收者分组。
  - 导出的函数应首先出现在文件中。
  - `newXYZ()`/`NewXYZ()` 可以在类型定义之后、其余方法之前出现。
  - 纯工具函数应出现在文件末尾。

## 3. 命名规范

变量、常量、函数推荐使用描述性强的长名称。

- **变量与函数**：使用小驼峰命名法 (camelCase)，如 `buildProject`, `configPath`。推荐使用描述性强的长名称。
- **常量**：因为你不知道未来这个常量是否允许在外部使用，所以一律使用 `CamelCase` 命名法。
- **包名**：使用简短、小写的单词，不使用大写或下划线。包名应是单数形式（如 `net/url` 而非 `net/urls`），避免使用 "common", "util", "shared", "lib" 等无信息量的名称。
- 在 import 包的时候，如果要设置别名，且别名需要用到多个单词时，使用小驼峰命名法 (camelCase)，如 `jsonUtil`, `httpClient`。
- **结构体与接口**：使用大驼峰命名法 (PascalCase)，如 `UserProfile`, `DataFetcher`。
- **接口**：
  - 单方法接口应以方法名加 `-er` 后缀命名（如 `Reader`, `Writer`, `Formatter`）。
  - 优先传递接口值而非接口指针。接口本身就包含了类型信息和数据指针。
- **布尔值**：使用 `is`, `has`, `can`, `should`, `will` 等作为前缀，并表达正向含义，如 `isLoading`, `hasError`。
- **未使用的参数**：对于未使用的函数参数或解构变量，**必须**使用下划线 `_` 作为前缀。不要命名为单个下划线 `_`，因为代码块里可能会有多个未使用的变量。
- **缩写**：名称中的缩写词应保持大小写一致。如果缩写词是名称的开头且未导出，则为全小写（如 `apiClient`, `xmlHTTPRequest`）；如果导出，则为全大写（如 `APIClient`, `XMLHTTPRequest`, `ServeHTTP`）。
- **函数类型的定义**：当函数签名中包含函数类型时（无论是作为参数还是返回值），都应使用 `type` 显式定义该函数类型，而不是在签名中内联。这有助于提高代码的可读性和复用性。
- **函数**中的参数名应具有描述性，避免使用单字母变量名（如 `i`、`v`）。
- **测试**：
  - 测试文件命名应以 `_test.go` 结尾。
  - 测试函数命名应以 `Test` 开头，后跟被测试函数的名称（如 `TestCalculateSum`）。
  - 基准测试函数命名应以 `Benchmark` 开头，后跟被测试函数的名称（如 `BenchmarkCalculateSum`）。
  - 测试可以包含下划线来分组相关的测试用例（如 `TestMyFunction_WhatIsBeingTested`）。
- **未导出的全局变量**：使用 `_` 作为前缀（如 `_defaultPort`）。例外：未导出的错误值可以使用 `err` 前缀而不带下划线。
- **避免使用内置名称**：不要使用 Go 的预声明标识符作为变量名（如 `error`, `string`, `int` 等）。
- **Printf 风格函数命名**：声明 `Printf` 风格的函数时，确保 `go vet` 可以检测它。如果使用预定义名称不可行，选择的名称应以 `f` 结尾（如 `Wrapf`）。

## 4. 类型与数据结构

### 4.1. 变量声明与初始化

- **变量声明**：
  - 局部变量：如果显式设置值，使用短变量声明（`:=`）。
  - 顶层变量：使用标准 `var` 关键字，除非表达式的类型与期望类型不完全匹配，否则不指定类型。
- **结构体初始化**：几乎总是显式写字段名；零值字段可省略，除非其名称能提供有意义的上下文（如在测试表格中）。
- **零值结构体**：如所有字段为零值，使用 `var u T` 声明，以区分于"带值初始化"的场景。
- **结构体指针**：用 `&T{}` 而非 `new(T)`，与常规字面量风格一致。
- **映射初始化**：
  - 若在初始化时有固定的键值对，使用字面量 `map[T1]T2{k: v}`。
  - 若以编程方式填充，使用 `make(map[T1]T2, hint)`，并尽可能提供容量提示。
  - 空映射使用 `make(map[T1]T2)`，而非 `map[T1]T2{}`，使映射初始化在视觉上与声明有所区别。
- **切片初始化**：
  - 空切片使用 `var s []T` 声明，其零值为 `nil`，可以直接使用。
  - 检查切片是否为空时，使用 `len(s) == 0`，而不是 `s == nil`。
  - 使用 `make` 初始化时尽可能提供容量提示：`make([]T, 0, size)`。

### 4.2. 结构体设计

- **嵌入规范**：
  - **优先使用组合而非嵌入**：特别是在公共结构体中，应避免嵌入类型。嵌入会暴露内部实现细节（如嵌入类型的方法），这会限制未来的演进并可能导致 API 混乱。推荐使用组合（将类型作为普通字段），并根据需要手动实现代理方法。
  - 仅在确有语义增益时嵌入（如 `io.Reader`）；避免把内部实现、锁或不该暴露的方法泄漏到外部 API。
  - 嵌入的类型应放在结构体字段列表的顶部，并用空行与常规字段分隔。
  - 互斥锁（Mutex）不应被嵌入，即使在非导出类型中也是如此。将其作为非指针字段。
- **使用字段标签进行序列化**：任何序列化为 JSON、YAML 等格式的结构体字段都应使用相应的标签注释（如 `json:"field_name"`）。
- **接口合规性验证**：在编译时验证类型是否实现了接口：`var _ http.Handler = (*Handler)(nil)`。
- **一文件一结构**：一个文件一般只定义一个结构体，除非它们高度相关，比如，结构体嵌套。

### 4.3. 数据处理

- **在边界处复制切片和映射**：切片和映射是引用类型，它们包含指向底层数据的指针。为防止外部调用者意外修改内部状态，在函数接收或返回切片/映射时，应进行防御性复制。

  ```go
  // 接收时复制
  func (u *User) SetTags(tags []string) {
      u.tags = make([]string, len(tags))
      copy(u.tags, tags)
  }

  // 返回时复制
  func (u *User) Tags() []string {
      tagsCopy := make([]string, len(u.tags))
      copy(tagsCopy, u.tags)
      return tagsCopy
  }
  ```

- **枚举**：Go 里不存在原生的枚举类型，这里统一定义一个可以导出的函数，用于将枚举值转换为字符串表示，枚举值可以是字符串，也可以是数字。就算枚举值是数字，也要显式定义枚举值，不要用 `iota` 自动生成。规范参照下列示例：

```go
type Type int

const (
    Unknown    Type = -1
    Directory  Type = 0
    Item       Type = 1
    Link       Type = 2
    Permission Type = 3
)

func (value Type) String() string {
    switch value {
    case Directory:
        return "Directory"
    case Item:
        return "Item"
    case Link:
        return "Link"
    case Permission:
        return "Permission"
    default:
        return "Unknown"
    }
}

func Parse(key string) Type {
    switch key {
    case "Directory":
        return Directory
    case "Item":
        return Item
    case "Link":
        return Link
    case "Permission":
        return Permission
    default:
        return -1
    }
}
```

- **时间处理**：
  - 处理"时刻"用 `time.Time`。
  - 处理"时长"用 `time.Duration`。
  - 与外部系统交互时尽可能使用 `time.Time` 和 `time.Duration`。
  - 当无法使用 `time.Duration` 时，使用 `int` 或 `float64` 并在字段名中包含单位（如 `IntervalMillis`）。
- **格式字符串**：在 `Printf` 风格函数之外声明格式字符串时，使用 `const`。
- **优先使用 strconv 而非 fmt**：在转换原语与字符串之间时，`strconv` 比 `fmt` 更快。
- **避免重复的字符串到字节转换**：不要重复从固定字符串创建字节切片，而是执行一次转换并捕获结果。
- 在处理对精度要求比较高的数字的时候，可以先从字符串类型的变量存储它，然后用高精度的数学库（如 `math/big`）进行计算，避免使用浮点数。

### 4.4 其他

- **泛型**：Go 在 1.18 版本引入了对泛型的支持，目前所有项目均在 1.18 及以上版本运行。推荐在适当的场景下使用泛型以提高代码复用性和类型安全性，但避免过度复杂化。泛型函数和类型应保持简洁明了，避免引入不必要的复杂度。

## 5. 控制流

### 5.1. 错误处理

- 遵循 Go 语言的错误处理惯例，使用多返回值中的 `error` 类型来传递错误信息。
- **检查错误**：**始终**检查错误，不要使用 `_` 忽略。
- **条件语句**：
  - 禁止使用 `else` 语句。优先使用卫语句（Guard Clauses）或提前返回（Early Return）来处理分支逻辑，以降低代码的嵌套深度。
  - 尽可能保持代码扁平化，避免深层嵌套的 `if`、循环或回调。
- **错误包装 (Wrapping)**：当向调用栈上层传递错误时，应添加上下文信息。优先使用 `fmt.Errorf` 和 `%w` 动词来包装错误，以便上层代码可以使用 `errors.Is` 和 `errors.As` 来检查底层错误。添加上下文时应保持简洁，避免使用“failed to”等冗余词语。
- **错误只处理一次**：不要在记录错误日志后又将其返回。上层调用者负责决定如何处理错误（记录、降级或返回）。
- 在业务逻辑中不要使用 `panic`。`panic` 应该只用于表示程序发生了不可恢复的内部错误（如启动时依赖项检查失败）。对于可预见的错误，应返回 `error`。
- **错误命名**：
  - 导出的错误变量应以 `Err` 开头，如 `var ErrNotFound = errors.New("not found")`。
  - 导出的自定义错误类型应以 `Error` 结尾，如 `type NotFoundError struct{...}`。
- **类型断言**：始终使用 "comma ok" 的形式进行类型断言，以安全地处理失败情况。

### 5.2. 程序生命周期

- **尽可能避免 init**：`init` 函数应是确定性的，不应依赖外部状态（如环境变量、文件系统），也不应产生副作用（如 I/O 操作）。适合使用 `init` 的场景包括：无法表示为单个赋值的复杂表达式、可插入的钩子（如 `database/sql` 方言）。
- **在 main 函数中退出**：
  - 只在 `main` 函数中使用 `os.Exit` 或 `log.Fatal`。其他函数应通过返回 `error` 来传递失败信号。
  - 如果可能，在 `main()` 中最多调用一次 `os.Exit` 或 `log.Fatal`。
  - 在测试中，使用 `t.Fatal` 或 `t.FailNow` 而非 panic。
- **defer 用于清理**：使用 `defer` 来确保资源（如文件句柄、锁）被释放，即使在函数有多个返回路径时也能保证执行。`defer` 的开销极小，只有在函数执行时间在纳秒级别时才应避免使用。

## 6. 并发

- **不要启动无法控制的 Goroutine**：每个 Goroutine 都必须有明确的退出时机，或者能通过 `context` 或 `channel` 等方式被外部信号关闭。
- **等待 Goroutine 退出**：
  - 多个 Goroutine：使用 `sync.WaitGroup`。
  - 单个 Goroutine：使用 `chan struct{}`，在完成时关闭。
- **Channel 大小**：Channel 的大小应为 0（无缓冲）或 1。任何其他大小都必须经过严格审查，考虑如何确定大小、什么阻止通道在负载下填满并阻塞写入者，以及发生这种情况时会发生什么。
- **不要在 `init` 函数中启动 Goroutine**：如果一个包需要后台 Goroutine，应提供一个显式的启动/关闭方法（如 `Close`, `Stop`, `Shutdown`）。
- **零值互斥锁是有效的**：`sync.Mutex` 和 `sync.RWMutex` 的零值是有效的，几乎不需要使用指针。
- **使用 `go.uber.org/atomic`**：对于原子操作，使用 `go.uber.org/atomic` 包提供类型安全的操作。
- **上下文 (Context)**：对于处理请求、需要超时控制或可取消的函数，应将其第一个参数设置为 `context.Context`。

## 7. 其他重要实践

- **避免可变全局变量**：最小化可变全局状态，优先使用依赖注入。

## 8. 详见

- [Uber Go Style Guide](https://github.com/uber-go/guide/blob/master/style.md)
- [Go 语言官方代码规范](https://golang.org/doc/effective_go.html)
