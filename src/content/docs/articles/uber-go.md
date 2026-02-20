---
title: Uber Go 风格指南
---

> [!NOTE]
> 本指南为 [Uber Go Style Guide](https://github.com/uber-go/guide/blob/c6dc05575289b11c49605b9bfc3d479a1989ed31/style.md) 的翻译，由 GPT-5 生成。

- [简介](#introduction)
- [指南](#guidelines)
  - [指向接口的指针](#pointers-to-interfaces)
  - [编译期校验接口实现](#verify-interface-compliance)
  - [接收者与接口](#receivers-and-interfaces)
  - [互斥锁零值可用](#zero-value-mutexes-are-valid)
  - [在边界复制切片和映射](#copy-slices-and-maps-at-boundaries)
  - [用 defer 清理](#defer-to-clean-up)
  - [通道容量为 1 或 0](#channel-size-is-one-or-none)
  - [枚举从 1 开始](#start-enums-at-one)
  - [使用 `"time"` 处理时间](#use-time-to-handle-time)
  - [错误](#errors)
    - [错误类型](#error-types)
    - [错误包装](#error-wrapping)
    - [错误命名](#error-naming)
    - [错误只处理一次](#handle-errors-once)
  - [处理类型断言失败](#handle-type-assertion-failures)
  - [不要 panic](#dont-panic)
  - [使用 go.uber.org/atomic](#use-gouberorgatomic)
  - [避免可变全局变量](#avoid-mutable-globals)
  - [避免在公共结构体中嵌入类型](#avoid-embedding-types-in-public-structs)
  - [避免使用内置标识符](#avoid-using-built-in-names)
  - [避免 `init()`](#avoid-init)
  - [仅在 main 里退出](#exit-in-main)
    - [只退出一次](#exit-once)
  - [被序列化的结构体使用字段标签](#use-field-tags-in-marshaled-structs)
  - [不要“发起即忘”的 goroutine](#dont-fire-and-forget-goroutines)
    - [等待 goroutine 退出](#wait-for-goroutines-to-exit)
    - [`init()` 中不要启 goroutine](#no-goroutines-in-init)
- [性能](#performance)
  - [字符串转换优先用 strconv](#prefer-strconv-over-fmt)
  - [避免重复的 string-to-byte 转换](#avoid-repeated-string-to-byte-conversions)
  - [优先指定容器容量](#prefer-specifying-container-capacity)
- [风格](#style)
  - [避免过长的行](#avoid-overly-long-lines)
  - [保持一致](#be-consistent)
  - [分组相似的声明](#group-similar-declarations)
  - [import 分组顺序](#import-group-ordering)
  - [包名](#package-names)
  - [函数名](#function-names)
  - [import 起别名](#import-aliasing)
  - [函数分组与排序](#function-grouping-and-ordering)
  - [减少嵌套](#reduce-nesting)
  - [不必要的 else](#unnecessary-else)
  - [顶层变量声明](#top-level-variable-declarations)
  - [未导出的全局以 \_ 前缀](#prefix-unexported-globals-with-_)
  - [结构体中的嵌入](#embedding-in-structs)
  - [局部变量声明](#local-variable-declarations)
  - [nil 是有效的切片](#nil-is-a-valid-slice)
  - [缩小变量作用域](#reduce-scope-of-variables)
  - [避免裸参数](#avoid-naked-parameters)
  - [使用原始字符串避免转义](#use-raw-string-literals-to-avoid-escaping)
  - [初始化结构体](#initializing-structs)
    - [使用字段名初始化结构体](#use-field-names-to-initialize-structs)
    - [省略零值字段](#omit-zero-value-fields-in-structs)
    - [零值结构体使用 `var`](#use-var-for-zero-value-structs)
    - [初始化结构体指针](#initializing-struct-references)
  - [初始化 Map](#initializing-maps)
  - [将格式串定义在 Printf 之外](#format-strings-outside-printf)
  - [命名 Printf 风格函数](#naming-printf-style-functions)
- [模式](#patterns)
  - [表驱动测试](#test-tables)
  - [函数式选项](#functional-options)
- [Lint](#linting)

<a id="introduction"></a>

## 简介

“风格”是管理我们代码的约定。术语“风格”有些名不副实，因为这些约定涵盖的不仅仅是源文件格式——gofmt 已经为我们处理了那部分。

本指南的目标是通过详细描述在 Uber 编写 Go 代码的注意事项，来管理复杂性。这些规则的存在是为了在仍然允许工程师高效使用 Go 语言特性的同时，使代码库保持可维护。

本指南最初由 [Prashant Varanasi](https://github.com/prashantv) 和 [Simon Newton](https://github.com/nomis52) 创建，用于帮助同事快速上手 Go。多年来根据社区反馈不断完善。

本文档记录了我们在 Uber 所遵循的 Go 代码惯例。其中很多是 Go 的通用指南，另外一些在外部资源基础上扩展：

1. [Effective Go](https://go.dev/doc/effective_go)
2. [Go 常见错误](https://go.dev/wiki/CommonMistakes)
3. [Go 代码审查意见](https://go.dev/wiki/CodeReviewComments)

我们力求示例代码适配 Go [发布版](https://go.dev/doc/devel/release)的最近两个次要版本。

所有代码在通过 `golint` 与 `go vet` 时应无错误。我们建议在编辑器里：

- 保存时运行 `goimports`
- 运行 `golint` 和 `go vet` 检查错误

编辑器对 Go 工具的支持见：
https://go.dev/wiki/IDEsAndTextEditorPlugins

<a id="guidelines"></a>

## 指南

<a id="pointers-to-interfaces"></a>

### 指向接口的指针

几乎不需要“接口的指针”。应当按值传递接口——其底层数据依然可以是指针。

一个接口底层是两个字段：

1. 指向某些类型特定信息的指针，可视作“类型”。
2. 数据指针。如果存放的是指针，就直接保存；如果是值，就保存该值的指针。

如果你希望接口方法能修改底层数据，必须使用指针（即方法接收者为指针类型）。

<a id="verify-interface-compliance"></a>

### 编译期校验接口实现

在合适的地方于编译期验证接口符合性。包括：

- 作为 API 合约一部分、要求实现特定接口的导出类型
- 作为实现相同接口的一组类型（导出或未导出）
- 以及违反接口会破坏用户的其它情况

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
type Handler struct {
  // ...
}



func (h *Handler) ServeHTTP(
  w http.ResponseWriter,
  r *http.Request,
) {
  ...
}
```

</td><td>

```go
type Handler struct {
  // ...
}

var _ http.Handler = (*Handler)(nil)

func (h *Handler) ServeHTTP(
  w http.ResponseWriter,
  r *http.Request,
) {
  // ...
}
```

</td></tr>
</tbody></table>

语句 `var _ http.Handler = (*Handler)(nil)` 会在 `*Handler` 不再满足 `http.Handler` 接口时编译失败。

赋值右侧应为被断言类型的零值。对于指针类型（如 `*Handler`）、切片和 map 是 `nil`，对于结构体是空结构体。

```go
type LogHandler struct {
  h   http.Handler
  log *zap.Logger
}

var _ http.Handler = LogHandler{}

func (h LogHandler) ServeHTTP(
  w http.ResponseWriter,
  r *http.Request,
) {
  // ...
}
```

<a id="receivers-and-interfaces"></a>

### 接收者与接口

值接收者的方法既可在值上调用，也可在指针上调用。指针接收者的方法只能在指针或[可寻址值](https://go.dev/ref/spec#Method_values)上调用。

例如：

```go
type S struct {
  data string
}

func (s S) Read() string {
  return s.data
}

func (s *S) Write(str string) {
  s.data = str
}

// 无法获取存于 map 中值的指针，因为它们不可寻址。
sVals := map[int]S{1: {"A"}}

// Read 是值接收者，不要求可寻址，故可调用。
sVals[1].Read()

// Write 是指针接收者，对 map 中的值无法取地址，不能调用。
//  sVals[1].Write("test")

sPtrs := map[int]*S{1: {"A"}}

// 若 map 存放指针，两者都可调用，因为指针本身可寻址。
sPtrs[1].Read()
sPtrs[1].Write("test")
```

同样，即便方法是值接收者，接口也可以由指针类型实现。

```go
type F interface {
  f()
}

type S1 struct{}

func (s S1) f() {}

type S2 struct{}

func (s *S2) f() {}

s1Val := S1{}
s1Ptr := &S1{}
s2Val := S2{}
s2Ptr := &S2{}

var i F
i = s1Val
i = s1Ptr
i = s2Ptr

// 下行不编译：s2Val 是值，而 f 没有值接收者。
//   i = s2Val
```

详见 Effective Go 的[指针与值](https://go.dev/doc/effective_go#pointers_vs_values)。

<a id="zero-value-mutexes-are-valid"></a>

### 互斥锁零值可用

`sync.Mutex` 和 `sync.RWMutex` 的零值是有效的，几乎不需要对 mutex 取指针。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
mu := new(sync.Mutex)
mu.Lock()
```

</td><td>

```go
var mu sync.Mutex
mu.Lock()
```

</td></tr>
</tbody></table>

如果结构体通过指针使用，那么其 mutex 字段也应为非指针字段。不要在结构体中嵌入 mutex，即便结构体未导出。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
type SMap struct {
  sync.Mutex

  data map[string]string
}

func NewSMap() *SMap {
  return &SMap{
    data: make(map[string]string),
  }
}

func (m *SMap) Get(k string) string {
  m.Lock()
  defer m.Unlock()

  return m.data[k]
}
```

</td><td>

```go
type SMap struct {
  mu sync.Mutex

  data map[string]string
}

func NewSMap() *SMap {
  return &SMap{
    data: make(map[string]string),
  }
}

func (m *SMap) Get(k string) string {
  m.mu.Lock()
  defer m.mu.Unlock()

  return m.data[k]
}
```

</td></tr>

<tr><td>

`Mutex` 字段及其 `Lock`/`Unlock` 方法会无意间成为 `SMap` 的导出 API。

</td><td>

mutex 及其方法作为实现细节被隐藏，不暴露给 `SMap` 的调用者。

</td></tr>
</tbody></table>

<a id="copy-slices-and-maps-at-boundaries"></a>

### 在边界复制切片和映射

切片与 map 内部持有指向底层数据的指针，在需要复制时要留心。

#### 接收切片与 map

若你保存了传入切片或 map 的引用，调用方可以修改它们。

<table>
<thead><tr><th>反例</th> <th>正例</th></tr></thead>
<tbody>
<tr>
<td>

```go
func (d *Driver) SetTrips(trips []Trip) {
  d.trips = trips
}

trips := ...
d1.SetTrips(trips)

// 你真的打算修改 d1.trips 吗？
trips[0] = ...
```

</td>
<td>

```go
func (d *Driver) SetTrips(trips []Trip) {
  d.trips = make([]Trip, len(trips))
  copy(d.trips, trips)
}

trips := ...
d1.SetTrips(trips)

// 现在可修改 trips[0] 而不影响 d1.trips
trips[0] = ...
```

</td>
</tr>

</tbody>
</table>

#### 返回切片与 map

同样，注意不要通过返回内部切片或 map 暴露内部状态，从而允许外部修改。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
type Stats struct {
  mu sync.Mutex
  counters map[string]int
}

// Snapshot 返回当前统计。
func (s *Stats) Snapshot() map[string]int {
  s.mu.Lock()
  defer s.mu.Unlock()

  return s.counters
}

// snapshot 不再受互斥锁保护，对其访问可能产生数据竞争。
snapshot := stats.Snapshot()
```

</td><td>

```go
type Stats struct {
  mu sync.Mutex
  counters map[string]int
}

func (s *Stats) Snapshot() map[string]int {
  s.mu.Lock()
  defer s.mu.Unlock()

  result := make(map[string]int, len(s.counters))
  for k, v := range s.counters {
    result[k] = v
  }
  return result
}

// Snapshot 现在是副本。
snapshot := stats.Snapshot()
```

</td></tr>
</tbody></table>

<a id="defer-to-clean-up"></a>

### 用 defer 清理

使用 defer 清理资源，例如文件和锁。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
p.Lock()
if p.count < 10 {
  p.Unlock()
  return p.count
}

p.count++
newCount := p.count
p.Unlock()

return newCount

// 多处 return，容易遗漏解锁
```

</td><td>

```go
p.Lock()
defer p.Unlock()

if p.count < 10 {
  return p.count
}

p.count++
return p.count

// 更易读
```

</td></tr>
</tbody></table>

defer 的开销极小，仅当你能证明函数执行时间在纳秒级时才考虑避免。defer 带来的可读性收益远大于微小的成本，尤其在更大函数中，其他计算相较于 `defer` 更显著。

<a id="channel-size-is-one-or-none"></a>

### 通道容量为 1 或 0

通道通常使用容量为 1 或无缓冲（默认 0）。其它容量必须经过严格审视：容量如何确定、在负载下如何防止写端阻塞、填满会如何。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
// “对任何人都够用！”
c := make(chan int, 64)
```

</td><td>

```go
// 容量 1
c := make(chan int, 1) // 或
// 无缓冲通道，容量 0
c := make(chan int)
```

</td></tr>
</tbody></table>

<a id="start-enums-at-one"></a>

### 枚举从 1 开始

在 Go 中，通常用自定义类型搭配 `iota` 的 `const` 组表示枚举。由于变量默认值为 0，通常应从非零开始。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
type Operation int

const (
  Add Operation = iota
  Subtract
  Multiply
)

// Add=0, Subtract=1, Multiply=2
```

</td><td>

```go
type Operation int

const (
  Add Operation = iota + 1
  Subtract
  Multiply
)

// Add=1, Subtract=2, Multiply=3
```

</td></tr>
</tbody></table>

当 0 值是理想的默认行为时例外：

```go
type LogOutput int

const (
  LogToStdout LogOutput = iota
  LogToFile
  LogToRemote
)

// LogToStdout=0, LogToFile=1, LogToRemote=2
```

<!-- TODO: 为枚举添加 String 方法的章节 -->

<a id="use-time-to-handle-time"></a>

### 使用 `"time"` 处理时间

时间很复杂。常见但错误的假设包括：

1. 一天有 24 小时
2. 一小时有 60 分钟
3. 一周有 7 天
4. 一年有 365 天
5. [还有很多](https://infiniteundo.com/post/25326999628/falsehoods-programmers-believe-about-time)

例如假设 1 意味着给某一时刻加 24 小时并不总是落在下一个日历日。

因此处理时间时，总是使用 [`"time"`](https://pkg.go.dev/time) 包，它能更安全、更准确地应对这些错误假设。

#### 使用 `time.Time` 表示时间点

处理时间点时用 [`time.Time`](https://pkg.go.dev/time#Time)，比较、加减时使用其方法。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
func isActive(now, start, stop int) bool {
  return start <= now && now < stop
}
```

</td><td>

```go
func isActive(now, start, stop time.Time) bool {
  return (start.Before(now) || start.Equal(now)) && now.Before(stop)
}
```

</td></tr>
</tbody></table>

#### 使用 `time.Duration` 表示时间段

处理时间段时用 [`time.Duration`](https://pkg.go.dev/time#Duration)。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
func poll(delay int) {
  for {
    // ...
    time.Sleep(time.Duration(delay) * time.Millisecond)
  }
}

poll(10) // 是秒还是毫秒？
```

</td><td>

```go
func poll(delay time.Duration) {
  for {
    // ...
    time.Sleep(delay)
  }
}

poll(10*time.Second)
```

</td></tr>
</tbody></table>

回到“给某一时刻加 24 小时”的例子，选择的方法取决于意图：如果想在下一个日历日的同一时间点，用 [`Time.AddDate`](https://pkg.go.dev/time#Time.AddDate)；若想严格保证前后相差 24 小时的时间点，用 [`Time.Add`](https://pkg.go.dev/time#Time.Add)。

```go
newDay := t.AddDate(0 /* years */, 0 /* months */, 1 /* days */)
maybeNewDay := t.Add(24 * time.Hour)
```

#### 在与外部系统交互时使用 `time.Time` 与 `time.Duration`

尽可能在与外部系统交互时使用 `time.Time` 与 `time.Duration`。例如：

- 命令行参数：[`flag`](https://pkg.go.dev/flag) 通过 [`time.ParseDuration`](https://pkg.go.dev/time#ParseDuration) 支持 `time.Duration`
- JSON：[`encoding/json`](https://pkg.go.dev/encoding/json) 通过 [`UnmarshalJSON`](https://pkg.go.dev/time#Time.UnmarshalJSON) 以 [RFC 3339](https://tools.ietf.org/html/rfc3339) 字符串编码 `time.Time`
- SQL：若驱动支持，[`database/sql`](https://pkg.go.dev/database/sql) 可在 `DATETIME`/`TIMESTAMP` 与 `time.Time` 间互转
- YAML：[`gopkg.in/yaml.v2`](https://pkg.go.dev/gopkg.in/yaml.v2) 将 `time.Time` 作为 [RFC 3339](https://tools.ietf.org/html/rfc3339) 字符串，`time.Duration` 通过 [`time.ParseDuration`](https://pkg.go.dev/time#ParseDuration)

当无法使用 `time.Duration` 时，使用 `int` 或 `float64` 并在字段名中包含单位。

例如，`encoding/json` 不支持 `time.Duration`，则在字段名中包含单位。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
// {"interval": 2}
type Config struct {
  Interval int `json:"interval"`
}
```

</td><td>

```go
// {"intervalMillis": 2000}
type Config struct {
  IntervalMillis int `json:"intervalMillis"`
}
```

</td></tr>
</tbody></table>

当无法使用 `time.Time` 时，除非另有约定，使用 `string` 并按 [RFC 3339](https://tools.ietf.org/html/rfc3339) 格式化。该格式被 [`Time.UnmarshalText`](https://pkg.go.dev/time#Time.UnmarshalText) 默认使用，也可通过 [`time.RFC3339`](https://pkg.go.dev/time#RFC3339) 在 `Time.Format` 与 `time.Parse` 中使用。

尽管通常问题不大，但请注意 `"time"` 包不支持解析包含闰秒的时间戳（[8728](https://github.com/golang/go/issues/8728)），也不在计算中考虑闰秒（[15190](https://github.com/golang/go/issues/15190)）。比较两个时刻的差值不包含其间发生的闰秒。

<a id="errors"></a>

### 错误

<a id="error-types"></a>

#### 错误类型

声明错误有多种方式。选择前请考虑：

- 调用方是否需要匹配错误并据此处理？
  若是，则需要通过声明包级错误变量或自定义类型来支持 [`errors.Is`](https://pkg.go.dev/errors#Is) 或 [`errors.As`](https://pkg.go.dev/errors#As)。
- 错误消息是静态字符串还是需要上下文的动态字符串？
  前者用 [`errors.New`](https://pkg.go.dev/errors#New)，后者用 [`fmt.Errorf`](https://pkg.go.dev/fmt#Errorf) 或自定义错误类型。
- 我们是否在传播下游函数返回的新错误？
  若是，参见[错误包装](#error-wrapping)。

| 需要匹配？ | 错误消息 | 指南                                                       |
| ---------- | -------- | ---------------------------------------------------------- |
| 否         | 静态     | [`errors.New`](https://pkg.go.dev/errors#New)              |
| 否         | 动态     | [`fmt.Errorf`](https://pkg.go.dev/fmt#Errorf)              |
| 是         | 静态     | 包级 `var` + [`errors.New`](https://pkg.go.dev/errors#New) |
| 是         | 动态     | 自定义 `error` 类型                                        |

例如，静态字符串错误使用 [`errors.New`](https://pkg.go.dev/errors#New)。若调用方需要匹配并处理，导出该错误变量以支持 `errors.Is`。

<table>
<thead><tr><th>无需匹配</th><th>需要匹配</th></tr></thead>
<tbody>
<tr><td>

```go
// package foo

func Open() error {
  return errors.New("could not open")
}

// package bar

if err := foo.Open(); err != nil {
  // 无法处理该错误
  panic("unknown error")
}
```

</td><td>

```go
// package foo

var ErrCouldNotOpen = errors.New("could not open")

func Open() error {
  return ErrCouldNotOpen
}

// package bar

if err := foo.Open(); err != nil {
  if errors.Is(err, foo.ErrCouldNotOpen) {
    // 处理该错误
  } else {
    panic("unknown error")
  }
}
```

</td></tr>
</tbody></table>

动态字符串错误：若调用方无需匹配，用 [`fmt.Errorf`](https://pkg.go.dev/fmt#Errorf)；若需要匹配，使用自定义 `error` 类型。

<table>
<thead><tr><th>无需匹配</th><th>需要匹配</th></tr></thead>
<tbody>
<tr><td>

```go
// package foo

func Open(file string) error {
  return fmt.Errorf("file %q not found", file)
}

// package bar

if err := foo.Open("testfile.txt"); err != nil {
  // 无法处理该错误
  panic("unknown error")
}
```

</td><td>

```go
// package foo

type NotFoundError struct {
  File string
}

func (e *NotFoundError) Error() string {
  return fmt.Sprintf("file %q not found", e.File)
}

func Open(file string) error {
  return &NotFoundError{File: file}
}


// package bar

if err := foo.Open("testfile.txt"); err != nil {
  var notFound *NotFoundError
  if errors.As(err, &notFound) {
    // 处理该错误
  } else {
    panic("unknown error")
  }
}
```

</td></tr>
</tbody></table>

注意：导出错误变量或类型会成为包的公共 API 一部分。

<a id="error-wrapping"></a>

#### 错误包装

当调用失败时传播错误主要有三种方式：

- 原样返回底层错误
- 使用带 `%w` 的 `fmt.Errorf` 添加上下文
- 使用带 `%v` 的 `fmt.Errorf` 添加上下文

若没有额外上下文，直接返回原始错误：保持原始错误类型与消息，适用于错误本身已足够定位来源的情况。

否则，应尽可能为错误消息添加上下文。相比模糊的“connection refused”，更希望得到“调用服务 foo：connection refused”。

使用 `fmt.Errorf` 添加上下文，根据是否允许调用方匹配底层原因选择 `%w` 或 `%v`：

- 若调用方应能访问底层错误，用 `%w`。这是多数包装错误的默认选择。但注意调用方可能依赖此行为；对于包装已知 `var` 或类型的情况，将其作为函数契约进行文档化并测试。
- 若需要隐藏底层错误，用 `%v`。调用方无法匹配；未来需要时可改为 `%w`。

添加上下文时保持简洁，避免“failed to ...”之类的赘述，否则随着调用栈向上传播会堆叠重复：

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
s, err := store.New()
if err != nil {
    return fmt.Errorf(
        "failed to create new store: %w", err)
}
```

</td><td>

```go
s, err := store.New()
if err != nil {
    return fmt.Errorf(
        "new store: %w", err)
}
```

</td></tr><tr><td>

```plain
failed to x: failed to y: failed to create new store: the error
```

</td><td>

```plain
x: y: new store: the error
```

</td></tr>
</tbody></table>

但一旦错误发送到其它系统，应明确这是错误消息（如使用 err 标签或日志中以“Failed”前缀）。

另见 [Don't just check errors, handle them gracefully](https://dave.cheney.net/2016/04/27/dont-just-check-errors-handle-them-gracefully)。

<a id="error-naming"></a>

#### 错误命名

包级全局错误值根据导出性使用 `Err` 或 `err` 前缀。该建议优先于[未导出的全局以 \_ 前缀](#prefix-unexported-globals-with-_).

```go
var (
  // 下两者导出，便于包使用者用 errors.Is 匹配
  ErrBrokenLink   = errors.New("link is broken")
  ErrCouldNotOpen = errors.New("could not open")

  // 未导出错误，不作为公共 API；
  // 包内依然可用 errors.Is 匹配
  errNotFound = errors.New("not found")
)
```

自定义错误类型使用 `Error` 作为后缀。

```go
// 同样，导出该错误类型，便于包使用者用 errors.As 匹配。
type NotFoundError struct {
  File string
}

func (e *NotFoundError) Error() string {
  return fmt.Sprintf("file %q not found", e.File)
}

// 未导出错误类型，不作为公共 API；
// 包内仍可用 errors.As。
type resolveError struct {
  Path string
}

func (e *resolveError) Error() string {
  return fmt.Sprintf("resolve %q", e.Path)
}
```

<a id="handle-errors-once"></a>

#### 错误只处理一次

调用方收到被调方返回的错误后，可以根据其认知以不同方式处理，包括但不限于：

- 若被调方契约定义了特定错误，用 `errors.Is` 或 `errors.As` 匹配并分支处理
- 若错误可恢复，记录日志并优雅降级
- 若错误代表领域特定的失败，返回定义良好的错误
- 将错误返回（[包装](#error-wrapping)或原样）

无论采取何种方式，每个错误通常只应被处理一次。不要既记录日志又返回错误，因为上层调用者也可能处理该错误，产生重复噪声。

例如：

<table>
<thead><tr><th>描述</th><th>代码</th></tr></thead>
<tbody>
<tr><td>

<strong>反例</strong>：记录日志并返回

上层很可能会做相同事情，导致日志噪声大，价值低。

</td><td>

```go
u, err := getUser(id)
if err != nil {
  // 反例：见描述
  log.Printf("Could not get user %q: %v", id, err)
  return err
}
```

</td></tr>
<tr><td>

<strong>正例</strong>：包装并返回

上层会处理错误。用 `%w` 确保需要时可用 `errors.Is` 或 `errors.As` 匹配。

</td><td>

```go
u, err := getUser(id)
if err != nil {
  return fmt.Errorf("get user %q: %w", id, err)
}
```

</td></tr>
<tr><td>

<strong>正例</strong>：记录并优雅降级

如果该操作非关键，可恢复以提供“降级但不中断”的体验。

</td><td>

```go
if err := emitMetrics(); err != nil {
  // 写指标失败不应中断应用
  log.Printf("Could not emit metrics: %v", err)
}
```

</td></tr>
<tr><td>

<strong>正例</strong>：匹配特定错误并优雅降级

若被调方契约定义了特定错误且可恢复，则匹配该分支并降级。其它情况包装并返回，由上层处理。

</td><td>

```go
tz, err := getUserTimeZone(id)
if err != nil {
  if errors.Is(err, ErrUserNotFound) {
    // 用户不存在，使用 UTC
    tz = time.UTC
  } else {
    return fmt.Errorf("get user %q: %w", id, err)
  }
}
```

</td></tr>
</tbody></table>

<a id="handle-type-assertion-failures"></a>

### 处理类型断言失败

[type assertion](https://go.dev/ref/spec#Type_assertions) 的单返回值形式在断言失败时会 panic。务必使用 “comma ok” 惯用法。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
t := i.(string)
```

</td><td>

```go
t, ok := i.(string)
if !ok {
  // 优雅处理错误
}
```

</td></tr>
</tbody></table>

<!-- TODO: 某些情况下单赋值形式也可以 -->

<a id="dont-panic"></a>

### 不要 panic

生产环境代码必须避免 panic。panic 是[级联故障](https://en.wikipedia.org/wiki/Cascading_failure)的重要来源。出错时，函数必须返回 error，让调用方决定如何处理。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
func run(args []string) {
  if len(args) == 0 {
    panic("an argument is required")
  }
  // ...
}

func main() {
  run(os.Args[1:])
}
```

</td><td>

```go
func run(args []string) error {
  if len(args) == 0 {
    return errors.New("an argument is required")
  }
  // ...
  return nil
}

func main() {
  if err := run(os.Args[1:]); err != nil {
    fmt.Fprintln(os.Stderr, err)
    os.Exit(1)
  }
}
```

</td></tr>
</tbody></table>

Panic/recover 不是错误处理策略。仅当发生不可恢复的问题（如空指针解引用）时才 panic。例外：程序初始化阶段发生严重问题需要中止程序时可以 panic。

```go
var _statusTemplate = template.Must(template.New("name").Parse("_statusHTML"))
```

即便在测试中，也优先使用 `t.Fatal` 或 `t.FailNow` 而非 panic，以确保用例标记为失败。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
// func TestFoo(t *testing.T)

f, err := os.CreateTemp("", "test")
if err != nil {
  panic("failed to set up test")
}
```

</td><td>

```go
// func TestFoo(t *testing.T)

f, err := os.CreateTemp("", "test")
if err != nil {
  t.Fatal("failed to set up test")
}
```

</td></tr>
</tbody></table>

<a id="use-gouberorgatomic"></a>

### 使用 go.uber.org/atomic

[sync/atomic](https://pkg.go.dev/sync/atomic) 对底层原始类型（`int32`、`int64` 等）操作，容易忘记使用原子方法进行读写。

[go.uber.org/atomic](https://pkg.go.dev/go.uber.org/atomic) 通过隐藏底层类型提供类型安全，并提供便捷的 `atomic.Bool`。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
type foo struct {
  running int32  // 原子
}

func (f* foo) start() {
  if atomic.SwapInt32(&f.running, 1) == 1 {
     // 已在运行…
     return
  }
  // 启动 Foo
}

func (f *foo) isRunning() bool {
  return f.running == 1  // 数据竞争！
}
```

</td><td>

```go
type foo struct {
  running atomic.Bool
}

func (f *foo) start() {
  if f.running.Swap(true) {
     // 已在运行…
     return
  }
  // 启动 Foo
}

func (f *foo) isRunning() bool {
  return f.running.Load()
}
```

</td></tr>
</tbody></table>

<a id="avoid-mutable-globals"></a>

### 避免可变全局变量

避免修改全局变量，使用依赖注入。函数指针和其他值同样适用。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
// sign.go

var _timeNow = time.Now

func sign(msg string) string {
  now := _timeNow()
  return signWithTime(msg, now)
}
```

</td><td>

```go
// sign.go

type signer struct {
  now func() time.Time
}

func newSigner() *signer {
  return &signer{
    now: time.Now,
  }
}

func (s *signer) Sign(msg string) string {
  now := s.now()
  return signWithTime(msg, now)
}
```

</td></tr>
<tr><td>

```go
// sign_test.go

func TestSign(t *testing.T) {
  oldTimeNow := _timeNow
  _timeNow = func() time.Time {
    return someFixedTime
  }
  defer func() { _timeNow = oldTimeNow }()

  assert.Equal(t, want, sign(give))
}
```

</td><td>

```go
// sign_test.go

func TestSigner(t *testing.T) {
  s := newSigner()
  s.now = func() time.Time {
    return someFixedTime
  }

  assert.Equal(t, want, s.Sign(give))
}
```

</td></tr>
</tbody></table>

<a id="avoid-embedding-types-in-public-structs"></a>

### 避免在公共结构体中嵌入类型

嵌入会泄露实现细节、限制类型演进、模糊文档。

假设你有一个共享的 `AbstractList` 实现了多种列表类型，避免在具体列表中嵌入 `AbstractList`。相反，仅为具体列表手写需要委托给抽象列表的方法。

```go
type AbstractList struct {}

// Add 向列表添加实体。
func (l *AbstractList) Add(e Entity) {
  // ...
}

// Remove 从列表移除实体。
func (l *AbstractList) Remove(e Entity) {
  // ...
}
```

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
// ConcreteList 是实体的列表。
type ConcreteList struct {
  *AbstractList
}
```

</td><td>

```go
// ConcreteList 是实体的列表。
type ConcreteList struct {
  list *AbstractList
}

// Add 向列表添加实体。
func (l *ConcreteList) Add(e Entity) {
  l.list.Add(e)
}

// Remove 从列表移除实体。
func (l *ConcreteList) Remove(e Entity) {
  l.list.Remove(e)
}
```

</td></tr>
</tbody></table>

Go 支持[类型嵌入](https://go.dev/doc/effective_go#embedding)，是继承与组合的折衷。外层类型隐式获得被嵌入类型的方法，默认委托给内层实例的同名方法。

结构体也会获得一个与类型同名的字段。因此若被嵌入类型是导出的，该字段也是导出的。为了保持向后兼容，外层类型的未来版本必须保留该嵌入。

嵌入很少是必要的，它只是为了避免编写繁琐的委托方法的方便之举。

即便嵌入兼容的抽象列表“接口”而非结构体，虽然给未来带来更多灵活性，但仍然泄露“具体列表使用了抽象实现”的细节。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
// AbstractList 是多种列表的通用实现。
type AbstractList interface {
  Add(Entity)
  Remove(Entity)
}

// ConcreteList 是实体的列表。
type ConcreteList struct {
  AbstractList
}
```

</td><td>

```go
// ConcreteList 是实体的列表。
type ConcreteList struct {
  list AbstractList
}

// Add 向列表添加实体。
func (l *ConcreteList) Add(e Entity) {
  l.list.Add(e)
}

// Remove 从列表移除实体。
func (l *ConcreteList) Remove(e Entity) {
  l.list.Remove(e)
}
```

</td></tr>
</tbody></table>

无论嵌入结构体还是接口，都会限制类型演进：

- 给嵌入接口新增方法是破坏性变更
- 从嵌入结构体移除方法是破坏性变更
- 移除嵌入类型是破坏性变更
- 替换嵌入类型（即便满足同接口）也是破坏性变更

尽管编写委托方法繁琐，但其代价换来隐藏实现细节、更多变更空间，并消除文档中为发现完整接口而产生的间接性。

<a id="avoid-using-built-in-names"></a>

### 避免使用内置标识符

Go [语言规范](https://go.dev/ref/spec)定义了若干[预声明标识符](https://go.dev/ref/spec#Predeclared_identifiers)，不应作为程序中的名称。

在不同上下文重用这些标识符要么遮蔽原义，要么让代码困惑。最好情况下编译器会报错；最坏情况下引入潜在的、难以 grep 的 bug。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
var error string
// `error` 遮蔽了内置标识符

// 或

func handleErrorMessage(error string) {
    // `error` 遮蔽了内置标识符
}
```

</td><td>

```go
var errorMessage string
// `error` 指向内置标识符

// 或

func handleErrorMessage(msg string) {
    // `error` 指向内置标识符
}
```

</td></tr>
<tr><td>

```go
type Foo struct {
    // 虽然这些字段不算遮蔽，
    // 但 grep `error`/`string` 将变得含混。
    error  error
    string string
}

func (f Foo) Error() error {
    // `error` 与 `f.error` 视觉上相似
    return f.error
}

func (f Foo) String() string {
    // `string` 与 `f.string` 视觉上相似
    return f.string
}
```

</td><td>

```go
type Foo struct {
    // 不再含混
    err error
    str string
}

func (f Foo) Error() error {
    return f.err
}

func (f Foo) String() string {
    return f.str
}
```

</td></tr>
</tbody></table>

注意编译器不会因使用预声明标识符而报错，但 `go vet` 等工具应能指出这些以及其它遮蔽情形。

<a id="avoid-init"></a>

### 避免 `init()`

能不用 `init()` 就不用。必须使用时，应尽量：

1. 完全确定性，不受运行环境或调用方式影响。
2. 避免依赖其它 `init()` 的顺序或副作用。虽然顺序是确定的，但代码会变，`init()` 之间的关系会让代码脆弱且易出错。
3. 避免访问/操纵全局或环境状态，如机器信息、环境变量、工作目录、程序参数等。
4. 避免 I/O，包括文件系统、网络与系统调用。

无法满足以上要求的代码，应作为辅助在 `main()`（或生命周期中其它位置）调用，或直接写在 `main()`。尤其对作为库被使用的包，应保证完全确定性，不做“init 魔法”。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
type Foo struct {
    // ...
}

var _defaultFoo Foo

func init() {
    _defaultFoo = Foo{
        // ...
    }
}
```

</td><td>

```go
var _defaultFoo = Foo{
    // ...
}

// 或，更便于测试：

var _defaultFoo = defaultFoo()

func defaultFoo() Foo {
    return Foo{
        // ...
    }
}
```

</td></tr>
<tr><td>

```go
type Config struct {
    // ...
}

var _config Config

func init() {
    // 反例：依赖当前目录
    cwd, _ := os.Getwd()

    // 反例：I/O
    raw, _ := os.ReadFile(
        path.Join(cwd, "config", "config.yaml"),
    )

    yaml.Unmarshal(raw, &_config)
}
```

</td><td>

```go
type Config struct {
    // ...
}

func loadConfig() Config {
    cwd, err := os.Getwd()
    // 处理 err

    raw, err := os.ReadFile(
        path.Join(cwd, "config", "config.yaml"),
    )
    // 处理 err

    var config Config
    yaml.Unmarshal(raw, &config)

    return config
}
```

</td></tr>
</tbody></table>

考虑到上述，以下情形可能更适合 `init()`：

- 无法用单赋值表达的复杂表达式
- 可插拔钩子，如 `database/sql` 方言、编码类型注册等
- 对 [Google Cloud Functions](https://cloud.google.com/functions/docs/bestpractices/tips#use_global_variables_to_reuse_objects_in_future_invocations) 等的确定性预计算优化

<a id="exit-in-main"></a>

### 仅在 main 里退出

Go 程序通过 [`os.Exit`](https://pkg.go.dev/os#Exit) 或 [`log.Fatal*`](https://pkg.go.dev/log#Fatal) 立刻退出。（不要用 panic 退出，请[不要 panic](#dont-panic)。）

仅在 `main()` 中调用 `os.Exit` 或 `log.Fatal*`。其它函数用返回 error 表达失败。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
func main() {
  body := readFile(path)
  fmt.Println(body)
}

func readFile(path string) string {
  f, err := os.Open(path)
  if err != nil {
    log.Fatal(err)
  }

  b, err := io.ReadAll(f)
  if err != nil {
    log.Fatal(err)
  }

  return string(b)
}
```

</td><td>

```go
func main() {
  body, err := readFile(path)
  if err != nil {
    log.Fatal(err)
  }
  fmt.Println(body)
}

func readFile(path string) (string, error) {
  f, err := os.Open(path)
  if err != nil {
    return "", err
  }

  b, err := io.ReadAll(f)
  if err != nil {
    return "", err
  }

  return string(b), nil
}
```

</td></tr>
</tbody></table>

原因：多处直接退出有问题：

- 控制流不明显：任意函数都可能退出，难以推理。
- 难以测试：退出会直接结束测试，导致该函数难以测试，且可能跳过未运行的测试。
- 跳过清理：退出会跳过用 `defer` 排队的调用，可能跳过重要清理步骤。

<a id="exit-once"></a>

#### 只退出一次

尽可能在 `main()` 中至多调用一次 `os.Exit` 或 `log.Fatal`。若有多处错误需中止程序，将逻辑放在单独函数中并返回 error。

这样可缩短 `main()`，并将关键业务逻辑置于可测试的独立函数中。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
package main

func main() {
  args := os.Args[1:]
  if len(args) != 1 {
    log.Fatal("missing file")
  }
  name := args[0]

  f, err := os.Open(name)
  if err != nil {
    log.Fatal(err)
  }
  defer f.Close()

  // 如果此行后调用 log.Fatal，
  // f.Close 将不会被调用。

  b, err := io.ReadAll(f)
  if err != nil {
    log.Fatal(err)
  }

  // ...
}
```

</td><td>

```go
package main

func main() {
  if err := run(); err != nil {
    log.Fatal(err)
  }
}

func run() error {
  args := os.Args[1:]
  if len(args) != 1 {
    return errors.New("missing file")
  }
  name := args[0]

  f, err := os.Open(name)
  if err != nil {
    return err
  }
  defer f.Close()

  b, err := io.ReadAll(f)
  if err != nil {
    return err
  }

  // ...
}
```

</td></tr>
</tbody></table>

上例使用了 `log.Fatal`，同样适用于 `os.Exit` 或任何会调用 `os.Exit` 的库。

```go
func main() {
  if err := run(); err != nil {
    fmt.Fprintln(os.Stderr, err)
    os.Exit(1)
  }
}
```

你可以根据需要调整 `run()` 的签名。例如若需要用特定退出码退出，`run()` 可以返回退出码而非错误，这样单测也可以直接验证。

```go
func main() {
  os.Exit(run(args))
}

func run() (exitCode int) {
  // ...
}
```

总之，这里的 `run()` 并非规定：名字、签名与设置都灵活。比如可以：

- 接收未解析的命令行参数（如 `run(os.Args[1:])`）
- 在 `main()` 中解析参数并传给 `run`
- 用自定义错误类型承载退出码返回给 `main()`
- 将业务逻辑放在不同层级而非 `package main`

此指南只要求 `main()` 中有且仅有一个位置负责真正推出进程。

<a id="use-field-tags-in-marshaled-structs"></a>

### 被序列化的结构体使用字段标签

凡是被 JSON、YAML 或其它基于标签的格式序列化的结构体字段，都应标注相应标签。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
type Stock struct {
  Price int
  Name  string
}

bytes, err := json.Marshal(Stock{
  Price: 137,
  Name:  "UBER",
})
```

</td><td>

```go
type Stock struct {
  Price int    `json:"price"`
  Name  string `json:"name"`
  // 之后可安全将 Name 重命名为 Symbol。
}

bytes, err := json.Marshal(Stock{
  Price: 137,
  Name:  "UBER",
})
```

</td></tr>
</tbody></table>

原因：序列化结构是一种系统间的契约。对其结构的任何修改——包括字段名——都会破坏契约。通过标签显式制定字段名可防止重构或重命名时意外破坏该契约。

<a id="dont-fire-and-forget-goroutines"></a>

### 不要“发起即忘”的 goroutine

goroutine 轻量但非免费：至少需要栈内存与调度 CPU。通常开销很小，但若大量创建且不控制生命周期，会带来明显性能问题；还可能导致未使用对象无法 GC、资源无法释放等。

因此生产代码中不要泄露 goroutine。使用 [go.uber.org/goleak](https://pkg.go.dev/go.uber.org/goleak) 在可能启动 goroutine 的包中测试泄漏。

一般而言，每个 goroutine：

- 必须有可预期的终止时机；或
- 必须能被发出“停止”信号

并且应有办法阻塞等待它结束。

例如：

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
go func() {
  for {
    flush()
    time.Sleep(delay)
  }
}()
```

</td><td>

```go
var (
  stop = make(chan struct{}) // 告诉 goroutine 停止
  done = make(chan struct{}) // 告诉我们它已退出
)
go func() {
  defer close(done)

  ticker := time.NewTicker(delay)
  defer ticker.Stop()
  for {
    select {
    case <-ticker.C:
      flush()
    case <-stop:
      return
    }
  }
}()

// 其他位置...
close(stop)  // 发停止信号
<-done       // 等待退出
```

</td></tr>
<tr><td>

该 goroutine 无法停止，将运行至程序退出。

</td><td>

该 goroutine 可通过 `close(stop)` 停止，并可用 `<-done` 等待其退出。

</td></tr>
</tbody></table>

<a id="wait-for-goroutines-to-exit"></a>

#### 等待 goroutine 退出

系统启动的 goroutine 必须可等待退出。常见方式：

- 用 `sync.WaitGroup` 等待多个 goroutine。适用于等待多个。

  ```go
  var wg sync.WaitGroup
  for i := 0; i < N; i++ {
  wg.Go(...)
  }

  // To wait for all to finish:
  wg.Wait()
  ```

- 用一个 `chan struct{}`，让 goroutine 结束时关闭。适用于单个 goroutine。

  ```go
  done := make(chan struct{})
  go func() {
    defer close(done)
    // ...
  }()

  // 等待其结束：
  <-done
  ```

<a id="no-goroutines-in-init"></a>

#### `init()` 中不要启 goroutine

`init()` 中不应启动 goroutine。参见[避免 init()](#avoid-init)。

如果包需要后台 goroutine，必须暴露一个负责管理其生命周期的对象。该对象应提供一个方法（如 `Close`、`Stop`、`Shutdown`），用于发出停止信号并等待其退出。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
func init() {
  go doWork()
}

func doWork() {
  for {
    // ...
  }
}
```

</td><td>

```go
type Worker struct{ /* ... */ }

func NewWorker(...) *Worker {
  w := &Worker{
    stop: make(chan struct{}),
    done: make(chan struct{}),
    // ...
  }
  go w.doWork()
}

func (w *Worker) doWork() {
  defer close(w.done)
  for {
    // ...
    case <-w.stop:
      return
  }
}

// Shutdown 通知停止并等待结束。
func (w *Worker) Shutdown() {
  close(w.stop)
  <-w.done
}
```

</td></tr>
<tr><td>

导入包即无条件启动后台 goroutine。用户无法控制也无法停止。

</td><td>

仅在用户请求时才启动 worker，并提供停止方式以释放资源。

若 worker 管理多个 goroutine，应使用 `WaitGroup`。见[等待 goroutine 退出](#wait-for-goroutines-to-exit)。

</td></tr>
</tbody></table>

<a id="performance"></a>

## 性能

性能相关指南仅适用于“热点路径”。

<a id="prefer-strconv-over-fmt"></a>

### 字符串转换优先用 strconv

基础类型与字符串转换，`strconv` 比 `fmt` 更快。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
for i := 0; i < b.N; i++ {
  s := fmt.Sprint(rand.Int())
}
```

</td><td>

```go
for i := 0; i < b.N; i++ {
  s := strconv.Itoa(rand.Int())
}
```

</td></tr>
<tr><td>

```plain
BenchmarkFmtSprint-4    143 ns/op    2 allocs/op
```

</td><td>

```plain
BenchmarkStrconv-4     64.2 ns/op    1 allocs/op
```

</td></tr>
</tbody></table>

<a id="avoid-repeated-string-to-byte-conversions"></a>

### 避免重复的 string-to-byte 转换

不要反复从固定字符串创建字节切片。只转换一次并复用结果。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
for i := 0; i < b.N; i++ {
  w.Write([]byte("Hello world"))
}
```

</td><td>

```go
data := []byte("Hello world")
for i := 0; i < b.N; i++ {
  w.Write(data)
}
```

</td></tr>
<tr><td>

```plain
BenchmarkBad-4    50,000,000    22.2 ns/op
```

</td><td>

```plain
BenchmarkGood-4  500,000,000     3.25 ns/op
```

</td></tr>
</tbody></table>

<a id="prefer-specifying-container-capacity"></a>

### 优先指定容器容量

尽可能为容器指定容量，以便预先分配，减少后续扩容拷贝。

#### Map 容量提示

初始化 map 时尽可能给出容量提示：

```go
make(map[T1]T2, hint)
```

容量提示有助于初始化时更合理地分配桶，减少后续增长的分配次数。注意不同于切片，map 的容量是“提示”，不是严格预分配，达到指定容量前仍可能发生分配。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
m := make(map[string]os.FileInfo)

files, _ := os.ReadDir("./files")
for _, f := range files {
    m[f.Name()] = f
}
```

</td><td>

```go
files, _ := os.ReadDir("./files")

m := make(map[string]os.DirEntry, len(files))
for _, f := range files {
    m[f.Name()] = f
}
```

</td></tr>
<tr><td>

未提供大小提示；赋值时可能更多分配。

</td><td>

提供了大小提示；赋值时可能更少分配。

</td></tr>
</tbody></table>

#### 切片容量

初始化切片（尤其会 append）时尽可能指定容量：

```go
make([]T, length, capacity)
```

与 map 不同，切片容量不是提示：编译器会按指定容量分配，直到长度达到容量前，后续 `append()` 不会再分配。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
for n := 0; n < b.N; n++ {
  data := make([]int, 0)
  for k := 0; k < size; k++{
    data = append(data, k)
  }
}
```

</td><td>

```go
for n := 0; n < b.N; n++ {
  data := make([]int, 0, size)
  for k := 0; k < size; k++{
    data = append(data, k)
  }
}
```

</td></tr>
<tr><td>

```plain
BenchmarkBad-4     100,000,000    2.48s
```

</td><td>

```plain
BenchmarkGood-4    100,000,000    0.21s
```

</td></tr>
</tbody></table>

<a id="style"></a>

## 风格

<a id="avoid-overly-long-lines"></a>

### 避免过长的行

避免需要横向滚动或大幅转头才能阅读的行。

建议软上限为 99 字符。尽量在达到该长度前换行，但这不是硬限制，超过也允许。

<a id="be-consistent"></a>

### 保持一致

本文指南有的可客观评估，有的依赖场景与主观判断。

首先要务是：保持一致。

一致的代码更易维护、易推理、降低心智负担，并在新约定出现或修复一类 bug 时更易迁移更新。

相反，在同一代码库中存在多种或冲突风格会增加维护成本、造成不确定与认知失调，进而降低效率、让评审痛苦并诱发缺陷。

应用本指南时，建议以包（或更大）为单位变更；在子包级别应用会在同一代码中引入多种风格，违背上述原则。

<a id="group-similar-declarations"></a>

### 分组相似的声明

Go 支持对相似声明分组。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
import "a"
import "b"
```

</td><td>

```go
import (
  "a"
  "b"
)
```

</td></tr>
</tbody></table>

这同样适用于常量、变量与类型声明。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go

const a = 1
const b = 2



var a = 1
var b = 2



type Area float64
type Volume float64
```

</td><td>

```go
const (
  a = 1
  b = 2
)

var (
  a = 1
  b = 2
)

type (
  Area   float64
  Volume float64
)
```

</td></tr>
</tbody></table>

仅分组关联声明。不要将不相关声明分组。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
type Operation int

const (
  Add Operation = iota + 1
  Subtract
  Multiply
  EnvVar = "MY_ENV"
)
```

</td><td>

```go
type Operation int

const (
  Add Operation = iota + 1
  Subtract
  Multiply
)

const EnvVar = "MY_ENV"
```

</td></tr>
</tbody></table>

分组不限于文件顶部，也可用于函数内部。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
func f() string {
  red := color.New(0xff0000)
  green := color.New(0x00ff00)
  blue := color.New(0x0000ff)

  // ...
}
```

</td><td>

```go
func f() string {
  var (
    red   = color.New(0xff0000)
    green = color.New(0x00ff00)
    blue  = color.New(0x0000ff)
  )

  // ...
}
```

</td></tr>
</tbody></table>

例外：变量声明，尤其在函数内部，若彼此相邻应分组，即使不相关也应将同时声明的变量分组。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
func (c *client) request() {
  caller := c.name
  format := "json"
  timeout := 5*time.Second
  var err error

  // ...
}
```

</td><td>

```go
func (c *client) request() {
  var (
    caller  = c.name
    format  = "json"
    timeout = 5*time.Second
    err     error
  )

  // ...
}
```

</td></tr>
</tbody></table>

<a id="import-group-ordering"></a>

### import 分组顺序

应有两组：

- 标准库
- 其它

这也是 goimports 的默认分组方式。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
import (
  "fmt"
  "os"
  "go.uber.org/atomic"
  "golang.org/x/sync/errgroup"
)
```

</td><td>

```go
import (
  "fmt"
  "os"

  "go.uber.org/atomic"
  "golang.org/x/sync/errgroup"
)
```

</td></tr>
</tbody></table>

<a id="package-names"></a>

### 包名

命名包时：

- 全小写，无大写或下划线
- 在大多数调用点无需通过别名改名
- 简短精炼，记住包名在每个调用点都会完整出现
- 非复数，如 `net/url` 而不是 `net/urls`
- 避免 “common”、“util”、“shared”、“lib” 这类信息不足的名字

另见 [Package Names](https://go.dev/blog/package-names) 与 [Style guideline for Go packages](https://rakyll.org/style-packages/)。

<a id="function-names"></a>

### 函数名

遵循社区约定使用[大小写混合（MixedCaps）](https://go.dev/doc/effective_go#mixed-caps)。例外：测试函数可用下划线以归类相关用例，如 `TestMyFunction_WhatIsBeingTested`。

<a id="import-aliasing"></a>

### import 起别名

若包名与导入路径最后一个元素不匹配，必须使用别名。

```go
import (
  "net/http"

  client "example.com/client-go"
  trace  "example.com/trace/v2"
)
```

其它场景避免起别名，除非存在直接冲突。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
import (
  "fmt"
  "os"
  runtimetrace "runtime/trace"

  nettrace "golang.net/x/trace"
)
```

</td><td>

```go
import (
  "fmt"
  "os"
  "runtime/trace"

  nettrace "golang.net/x/trace"
)
```

</td></tr>
</tbody></table>

<a id="function-grouping-and-ordering"></a>

### 函数分组与排序

- 函数按大致调用顺序排序
- 文件内函数按接收者分组

因此导出函数应出现在文件前部的 `struct`、`const`、`var` 之后。

`newXYZ()`/`NewXYZ()` 可紧随类型定义，先于接收者上的其余方法。

无接收者的工具函数应置于文件末尾。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
func (s *something) Cost() {
  return calcCost(s.weights)
}

type something struct{ ... }

func calcCost(n []int) int {...}

func (s *something) Stop() {...}

func newSomething() *something {
    return &something{}
}
```

</td><td>

```go
type something struct{ ... }

func newSomething() *something {
    return &something{}
}

func (s *something) Cost() {
  return calcCost(s.weights)
}

func (s *something) Stop() {...}

func calcCost(n []int) int {...}
```

</td></tr>
</tbody></table>

<a id="reduce-nesting"></a>

### 减少嵌套

尽可能通过先处理错误/特殊情况并早返回或继续循环来减少嵌套，尤其避免多层嵌套。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
for _, v := range data {
  if v.F1 == 1 {
    v = process(v)
    if err := v.Call(); err == nil {
      v.Send()
    } else {
      return err
    }
  } else {
    log.Printf("Invalid v: %v", v)
  }
}
```

</td><td>

```go
for _, v := range data {
  if v.F1 != 1 {
    log.Printf("Invalid v: %v", v)
    continue
  }

  v = process(v)
  if err := v.Call(); err != nil {
    return err
  }
  v.Send()
}
```

</td></tr>
</tbody></table>

<a id="unnecessary-else"></a>

### 不必要的 else

若 if 的两条分支都给变量赋值，可化为单个 if。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
var a int
if b {
  a = 100
} else {
  a = 10
}
```

</td><td>

```go
a := 10
if b {
  a = 100
}
```

</td></tr>
</tbody></table>

<a id="top-level-variable-declarations"></a>

### 顶层变量声明

顶层使用标准 `var`，不要显式类型，除非与表达式类型不同。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
var _s string = F()

func F() string { return "A" }
```

</td><td>

```go
var _s = F()
// F 已声明返回 string，无需再次指定类型。

func F() string { return "A" }
```

</td></tr>
</tbody></table>

若表达式类型与所需类型不完全一致则需指定类型：

```go
type myError struct{}

func (myError) Error() string { return "error" }

func F() myError { return myError{} }

var _e error = F()
// F 返回 myError，但我们需要 error。
```

<a id="prefix-unexported-globals-with-_"></a>

### 未导出的全局以 \_ 前缀

未导出的顶层 `var` 与 `const` 使用 `_` 前缀，以便在使用处能看出它们是全局符号。

原因：顶层变量与常量具有包作用域。使用通用名易在不同文件中误用错误值。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
// foo.go

const (
  defaultPort = 8080
  defaultUser = "user"
)

// bar.go

func Bar() {
  defaultPort := 9090
  ...
  fmt.Println("Default port", defaultPort)

  // 若删除 Bar() 的第一行，我们不会看到编译错误。
}
```

</td><td>

```go
// foo.go

const (
  _defaultPort = 8080
  _defaultUser = "user"
)
```

</td></tr>
</tbody></table>

<strong>例外</strong>：未导出的错误值可使用 `err` 前缀而不加下划线。参见[错误命名](#error-naming)。

<a id="embedding-in-structs"></a>

### 结构体中的嵌入

嵌入类型应位于结构体字段列表顶部，并与普通字段留空行分隔。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
type Client struct {
  version int
  http.Client
}
```

</td><td>

```go
type Client struct {
  http.Client

  version int
}
```

</td></tr>
</tbody></table>

嵌入应带来实质好处，如以合理方式增强功能，且不产生任何用户可见的不良影响（另见：[避免在公共结构体中嵌入类型](#avoid-embedding-types-in-public-structs)）。

例外：Mutex 不应被嵌入，即便是未导出的类型。参见：[互斥锁零值可用](#zero-value-mutexes-are-valid)。

嵌入<strong>不应</strong>：

- 纯为美观或图方便
- 让外层类型更难构造或使用
- 影响外层类型零值的可用性
- 作为副作用暴露与外层无关的函数或字段
- 暴露未导出类型
- 改变外层类型的拷贝语义
- 改变外层类型 API 或类型语义
- 嵌入内层类型的非规范形式
- 暴露外层类型的实现细节
- 允许用户观察或控制类型内部
- 以令人意外的方式改变内层函数的通用行为

简单说，谨慎有意识地嵌入。一个试金石是：“这些被嵌入的方法/字段是否都愿意直接加到外层类型？”若答案是“部分”或“否”，不要嵌入，改用字段。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
type A struct {
    // 反例：A.Lock()/A.Unlock() 暴露且无益，
    // 允许用户控制 A 的内部细节。
    sync.Mutex
}
```

</td><td>

```go
type countingWriteCloser struct {
    // 正例：外层提供 Write() 为特定目的，
    // 委托给内层的 Write()。
    io.WriteCloser

    count int
}

func (w *countingWriteCloser) Write(bs []byte) (int, error) {
    w.count += len(bs)
    return w.WriteCloser.Write(bs)
}
```

</td></tr>
<tr><td>

```go
type Book struct {
    // 反例：指针破坏零值可用性
    io.ReadWriter

    // 其它字段
}

// 之后

var b Book
b.Read(...)  // panic: nil 指针
b.String()   // panic: nil 指针
b.Write(...) // panic: nil 指针
```

</td><td>

```go
type Book struct {
    // 正例：零值可用
    bytes.Buffer

    // 其它字段
}

// 之后

var b Book
b.Read(...)  // ok
b.String()   // ok
b.Write(...) // ok
```

</td></tr>
<tr><td>

```go
type Client struct {
    sync.Mutex
    sync.WaitGroup
    bytes.Buffer
    url.URL
}
```

</td><td>

```go
type Client struct {
    mtx sync.Mutex
    wg  sync.WaitGroup
    buf bytes.Buffer
    url url.URL
}
```

</td></tr>
</tbody></table>

<a id="local-variable-declarations"></a>

### 局部变量声明

若明确赋值，使用短变量声明（`:=`）。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
var s = "foo"
```

</td><td>

```go
s := "foo"
```

</td></tr>
</tbody></table>

但在某些情况下，`var` 更清晰，例如[声明空切片](https://go.dev/wiki/CodeReviewComments#declaring-empty-slices)。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
func f(list []int) {
  filtered := []int{}
  for _, v := range list {
    if v > 10 {
      filtered = append(filtered, v)
    }
  }
}
```

</td><td>

```go
func f(list []int) {
  var filtered []int
  for _, v := range list {
    if v > 10 {
      filtered = append(filtered, v)
    }
  }
}
```

</td></tr>
</tbody></table>

<a id="nil-is-a-valid-slice"></a>

### nil 是有效的切片

`nil` 是长度为 0 的有效切片，意味着：

- 不要显式返回长度为 0 的切片。返回 `nil`。

  <table>
  <thead><tr><th>反例</th><th>正例</th></tr></thead>
  <tbody>
  <tr><td>

  ```go
  if x == "" {
    return []int{}
  }
  ```

  </td><td>

  ```go
  if x == "" {
    return nil
  }
  ```

  </td></tr>
  </tbody></table>

- 判断切片是否为空，使用 `len(s) == 0`，不要判断 `nil`。

  <table>
  <thead><tr><th>反例</th><th>正例</th></tr></thead>
  <tbody>
  <tr><td>

  ```go
  func isEmpty(s []string) bool {
    return s == nil
  }
  ```

  </td><td>

  ```go
  func isEmpty(s []string) bool {
    return len(s) == 0
  }
  ```

  </td></tr>
  </tbody></table>

- 零值（用 `var` 声明的切片）无需 `make()` 即可直接使用。

  <table>
  <thead><tr><th>反例</th><th>正例</th></tr></thead>
  <tbody>
  <tr><td>

  ```go
  nums := []int{}
  // 或 nums := make([]int)

  if add1 {
    nums = append(nums, 1)
  }

  if add2 {
    nums = append(nums, 2)
  }
  ```

  </td><td>

  ```go
  var nums []int

  if add1 {
    nums = append(nums, 1)
  }

  if add2 {
    nums = append(nums, 2)
  }
  ```

  </td></tr>
  </tbody></table>

记住：虽然 `nil` 切片有效，但它不同于“已分配、长度为 0 的切片”——一个为 `nil`，一个不是。在某些场景（如序列化）两者可能被区别对待。

<a id="reduce-scope-of-variables"></a>

### 缩小变量作用域

尽可能缩小变量与常量的作用域。若与[减少嵌套](#reduce-nesting)冲突则不要强求。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
err := os.WriteFile(name, data, 0644)
if err != nil {
 return err
}
```

</td><td>

```go
if err := os.WriteFile(name, data, 0644); err != nil {
 return err
}
```

</td></tr>
</tbody></table>

若需要在 if 外使用函数结果，就不要强行缩小作用域。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
if data, err := os.ReadFile(name); err == nil {
  err = cfg.Decode(data)
  if err != nil {
    return err
  }

  fmt.Println(cfg)
  return nil
} else {
  return err
}
```

</td><td>

```go
data, err := os.ReadFile(name)
if err != nil {
   return err
}

if err := cfg.Decode(data); err != nil {
  return err
}

fmt.Println(cfg)
return nil
```

</td></tr>
</tbody></table>

常量不需要是全局的，除非它们在多个函数/文件中使用，或属于包的外部契约。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
const (
  _defaultPort = 8080
  _defaultUser = "user"
)

func Bar() {
  fmt.Println("Default port", _defaultPort)
}
```

</td><td>

```go
func Bar() {
  const (
    defaultPort = 8080
    defaultUser = "user"
  )
  fmt.Println("Default port", defaultPort)
}
```

</td></tr>
</tbody></table>

<a id="avoid-naked-parameters"></a>

### 避免裸参数

调用中“裸露”的参数会损害可读性。当含义不明显时，用 C 风格注释（`/* ... */`）标注参数名。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
// func printInfo(name string, isLocal, done bool)

printInfo("foo", true, true)
```

</td><td>

```go
// func printInfo(name string, isLocal, done bool)

printInfo("foo", true /* isLocal */, true /* done */)
```

</td></tr>
</tbody></table>

更好的做法是用自定义类型替代裸 `bool`，使之更可读、更类型安全，并为未来提供多于两种状态的可能。

```go
type Region int

const (
  UnknownRegion Region = iota
  Local
)

type Status int

const (
  StatusReady Status = iota + 1
  StatusDone
  // 未来也许会有 StatusInProgress
)

func printInfo(name string, region Region, status Status)
```

<a id="use-raw-string-literals-to-avoid-escaping"></a>

### 使用原始字符串避免转义

Go 支持[原始字符串字面量](https://go.dev/ref/spec#raw_string_lit)，可跨多行且包含引号。用它们避免手工转义，提升可读性。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
wantError := "unknown name:\"test\""
```

</td><td>

```go
wantError := `unknown error:"test"`
```

</td></tr>
</tbody></table>

<a id="initializing-structs"></a>

### 初始化结构体

<a id="use-field-names-to-initialize-structs"></a>

#### 使用字段名初始化结构体

几乎总是应指定字段名初始化结构体。`go vet` 现在也强制检查。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
k := User{"John", "Doe", true}
```

</td><td>

```go
k := User{
    FirstName: "John",
    LastName:  "Doe",
    Admin:     true,
}
```

</td></tr>
</tbody></table>

例外：在测试表中，当字段不超过 3 个时可省略字段名。

```go
tests := []struct{
  op   Operation
  want string
}{
  {Add, "add"},
  {Subtract, "subtract"},
}
```

<a id="omit-zero-value-fields-in-structs"></a>

#### 省略零值字段

使用字段名初始化时，除非提供有意义的上下文，否则省略零值字段，让 Go 自动赋零值。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
user := User{
  FirstName:  "John",
  LastName:   "Doe",
  MiddleName: "",
  Admin:      false,
}
```

</td><td>

```go
user := User{
  FirstName: "John",
  LastName:  "Doe",
}
```

</td></tr>
</tbody></table>

这能减少噪声，仅保留有意义值。

当字段名能提供上下文时，即便为零值也应保留，如[表驱动测试](#test-tables)里的 case：

```go
tests := []struct{
  give string
  want int
}{
  {give: "0", want: 0},
  // ...
}
```

<a id="use-var-for-zero-value-structs"></a>

#### 零值结构体使用 `var`

当声明时省略结构体全部字段，用 `var` 形式：

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
user := User{}
```

</td><td>

```go
var user User
```

</td></tr>
</tbody></table>

这能区分“零值结构体”与“包含非零字段的结构体”，类似于我们[声明空切片](https://go.dev/wiki/CodeReviewComments#declaring-empty-slices)的偏好，也与[Map 初始化](#initializing-maps)的区分一致。

<a id="initializing-struct-references"></a>

#### 初始化结构体指针

初始化结构体指针时使用 `&T{}` 而不是 `new(T)`，以与结构体初始化风格一致。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
sval := T{Name: "foo"}

// 不一致
sptr := new(T)
sptr.Name = "bar"
```

</td><td>

```go
sval := T{Name: "foo"}

sptr := &T{Name: "bar"}
```

</td></tr>
</tbody></table>

<a id="initializing-maps"></a>

### 初始化 Map

对空 map 及程序化填充的 map，优先使用 `make(..)`。这在视觉上将“声明”与“初始化”区分开，并便于之后添加容量提示。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
var (
  // m1 可读写；m2 写时会 panic
  m1 = map[T1]T2{}
  m2 map[T1]T2
)
```

</td><td>

```go
var (
  // m1 可读写；m2 写时会 panic
  m1 = make(map[T1]T2)
  m2 map[T1]T2
)
```

</td></tr>
<tr><td>

声明与初始化在视觉上相似。

</td><td>

声明与初始化在视觉上区分明显。

</td></tr>
</tbody></table>

尽可能在 `make()` 时提供容量提示。见[Map 容量提示](#specifying-map-capacity-hints)。

若 map 持有固定元素列表，用字面量初始化更好。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
m := make(map[T1]T2, 3)
m[k1] = v1
m[k2] = v2
m[k3] = v3
```

</td><td>

```go
m := map[T1]T2{
  k1: v1,
  k2: v2,
  k3: v3,
}
```

</td></tr>
</tbody></table>

经验法则：初始化时加固定元素用字面量，否则用 `make`（若可用则指定容量）。

<a id="format-strings-outside-printf"></a>

### 将格式串定义在 Printf 之外

若在字符串字面量之外声明 `Printf` 风格的格式串，请将其设为 `const` 值，以帮助 `go vet` 静态分析。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
msg := "unexpected values %v, %v\n"
fmt.Printf(msg, 1, 2)
```

</td><td>

```go
const msg = "unexpected values %v, %v\n"
fmt.Printf(msg, 1, 2)
```

</td></tr>
</tbody></table>

<a id="naming-printf-style-functions"></a>

### 命名 Printf 风格函数

声明 `Printf` 风格函数时，确保 `go vet` 能检测并检查格式串。

尽量使用预定义的 `Printf` 家族函数名，`go vet` 默认检查。参见 [Printf family](https://pkg.go.dev/cmd/vet#hdr-Printf_family)。

若不能使用预定义名，请以 f 结尾：如 `Wrapf`，不是 `Wrap`。可用 `-printfuncs` 指定自定义检查的函数名，但它们必须以 f 结尾。

```shell
go vet -printfuncs=wrapf,statusf
```

另见 [go vet: Printf family check](https://kuzminva.wordpress.com/2017/11/07/go-vet-printf-family-check/)。

<a id="patterns"></a>

## 模式

<a id="test-tables"></a>

### 表驱动测试

对重复核心逻辑的测试，使用带[子测试](https://go.dev/blog/subtests)的表驱动测试能减少重复、提升可读性。

当被测系统需要在“多种条件”下测试，且输入/输出的某些部分变化时，应用表驱动测试更佳。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
// func TestSplitHostPort(t *testing.T)

host, port, err := net.SplitHostPort("192.0.2.0:8000")
require.NoError(t, err)
assert.Equal(t, "192.0.2.0", host)
assert.Equal(t, "8000", port)

host, port, err = net.SplitHostPort("192.0.2.0:http")
require.NoError(t, err)
assert.Equal(t, "192.0.2.0", host)
assert.Equal(t, "http", port)

host, port, err = net.SplitHostPort(":8000")
require.NoError(t, err)
assert.Equal(t, "", host)
assert.Equal(t, "8000", port)

host, port, err = net.SplitHostPort("1:8")
require.NoError(t, err)
assert.Equal(t, "1", host)
assert.Equal(t, "8", port)
```

</td><td>

```go
// func TestSplitHostPort(t *testing.T)

tests := []struct{
  give     string
  wantHost string
  wantPort string
}{
  {
    give:     "192.0.2.0:8000",
    wantHost: "192.0.2.0",
    wantPort: "8000",
  },
  {
    give:     "192.0.2.0:http",
    wantHost: "192.0.2.0",
    wantPort: "http",
  },
  {
    give:     ":8000",
    wantHost: "",
    wantPort: "8000",
  },
  {
    give:     "1:8",
    wantHost: "1",
    wantPort: "8",
  },
}

for _, tt := range tests {
  t.Run(tt.give, func(t *testing.T) {
    host, port, err := net.SplitHostPort(tt.give)
    require.NoError(t, err)
    assert.Equal(t, tt.wantHost, host)
    assert.Equal(t, tt.wantPort, port)
  })
}
```

</td></tr>
</tbody></table>

表驱动测试更易添加上下文、减少重复逻辑，也便于加新用例。

我们约定测试切片命名为 `tests`，每个用例为 `tt`。此外，鼓励用 `give`/`want` 前缀显式输入/输出。

```go
tests := []struct{
  give     string
  wantHost string
  wantPort string
}{
  // ...
}

for _, tt := range tests {
  // ...
}
```

#### 避免在表测试中引入不必要的复杂性

若子测试包含条件断言或其它分支逻辑，表测试会难读难维护。在子测试体（即 `for` 循环内）需要复杂/条件逻辑时，避免表测试。

大型复杂的表测试会让读者难以调试失败。此类测试应拆为多个测试表或多个独立的 `Test...` 函数。

一些目标：

- 聚焦尽可能窄的行为单元
- 最小化“测试深度”，避免条件断言
- 确保所有表字段在所有用例中均被使用
- 确保所有测试逻辑在所有用例中运行

此处“测试深度”可理解为“单测中彼此依赖的断言层级（类似圈复杂度）”。更“浅”的测试意味着断言间关系更少且默认非条件化。

具体而言，若使用多条分支路径（如 `shouldError`、`expectCall` 等），或大量 `if` 来设置 mock 预期（如 `shouldCallFoo`），或在表中放函数（如 `setupMocks func(*FooMock)`），则表测试会变得混乱。

但当仅基于输入变化而行为变化时，将相似用例放在同一表中有助于对比，而不是拆成多个难以比较的测试。

若测试体简短直观，允许用单个分支（成功/失败）并用 `shouldErr` 指定错误预期。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
func TestComplicatedTable(t *testing.T) {
  tests := []struct {
    give          string
    want          string
    wantErr       error
    shouldCallX   bool
    shouldCallY   bool
    giveXResponse string
    giveXErr      error
    giveYResponse string
    giveYErr      error
  }{
    // ...
  }

  for _, tt := range tests {
    t.Run(tt.give, func(t *testing.T) {
      // setup mocks
      ctrl := gomock.NewController(t)
      xMock := xmock.NewMockX(ctrl)
      if tt.shouldCallX {
        xMock.EXPECT().Call().Return(
          tt.giveXResponse, tt.giveXErr,
        )
      }
      yMock := ymock.NewMockY(ctrl)
      if tt.shouldCallY {
        yMock.EXPECT().Call().Return(
          tt.giveYResponse, tt.giveYErr,
        )
      }

      got, err := DoComplexThing(tt.give, xMock, yMock)

      // verify results
      if tt.wantErr != nil {
        require.EqualError(t, err, tt.wantErr)
        return
      }
      require.NoError(t, err)
      assert.Equal(t, want, got)
    })
  }
}
```

</td><td>

```go
func TestShouldCallX(t *testing.T) {
  // setup mocks
  ctrl := gomock.NewController(t)
  xMock := xmock.NewMockX(ctrl)
  xMock.EXPECT().Call().Return("XResponse", nil)

  yMock := ymock.NewMockY(ctrl)

  got, err := DoComplexThing("inputX", xMock, yMock)

  require.NoError(t, err)
  assert.Equal(t, "want", got)
}

func TestShouldCallYAndFail(t *testing.T) {
  // setup mocks
  ctrl := gomock.NewController(t)
  xMock := xmock.NewMockX(ctrl)

  yMock := ymock.NewMockY(ctrl)
  yMock.EXPECT().Call().Return("YResponse", nil)

  _, err := DoComplexThing("inputY", xMock, yMock)
  assert.EqualError(t, err, "Y failed")
}
```

</td></tr>
</tbody></table>

这种复杂性让测试更难改、难理解、难证明正确性。

虽无绝对标准，但在表测试与独立测试间抉择时，应始终优先考虑可读性与可维护性。

#### 并行测试

并行测试（或在循环体内启动 goroutine/捕获引用等）必须注意在循环体作用域中重绑定循环变量，以确保期望值。

```go
tests := []struct{
  give string
  // ...
}{
  // ...
}

for _, tt := range tests {
  tt := tt // for t.Parallel
  t.Run(tt.give, func(t *testing.T) {
    t.Parallel()
    // ...
  })
}
```

如上，因为使用了 `t.Parallel()`，我们必须在循环内声明一个作用域内的 `tt` 变量。否则测试运行时大多/全部会收到意外的 `tt` 值，或值在运行中发生变化。

<!-- TODO: 解释如何使用 _test 包 -->

<a id="functional-options"></a>

### 函数式选项

函数式选项模式通过一个不透明的 `Option` 类型记录内部 `options` 结构上的信息。构造函数等公共 API 接收可变参数选项，并根据汇总后的信息行动。

对于构造函数及其它可能扩展的公共 API 的“可选参数”，尤其当已有三个或更多参数时，使用此模式。

<table>
<thead><tr><th>反例</th><th>正例</th></tr></thead>
<tbody>
<tr><td>

```go
// package db

func Open(
  addr string,
  cache bool,
  logger *zap.Logger,
) (*Connection, error) {
  // ...
}
```

</td><td>

```go
// package db

type Option interface {
  // ...
}

func WithCache(c bool) Option {
  // ...
}

func WithLogger(log *zap.Logger) Option {
  // ...
}

// Open 创建连接。
func Open(
  addr string,
  opts ...Option,
) (*Connection, error) {
  // ...
}
```

</td></tr>
<tr><td>

必须总是提供 cache 与 logger，即使想用默认值：

```go
db.Open(addr, db.DefaultCache, zap.NewNop())
db.Open(addr, db.DefaultCache, log)
db.Open(addr, false /* cache */, zap.NewNop())
db.Open(addr, false /* cache */, log)
```

</td><td>

仅在需要时提供选项：

```go
db.Open(addr)
db.Open(addr, db.WithLogger(log))
db.Open(addr, db.WithCache(false))
db.Open(
  addr,
  db.WithCache(false),
  db.WithLogger(log),
)
```

</td></tr>
</tbody></table>

推荐实现方式：定义带未导出 `apply(*options)` 方法的 `Option` 接口，并在未导出 `options` 结构上记录选项。

```go
type options struct {
  cache  bool
  logger *zap.Logger
}

type Option interface {
  apply(*options)
}

type cacheOption bool

func (c cacheOption) apply(opts *options) {
  opts.cache = bool(c)
}

func WithCache(c bool) Option {
  return cacheOption(c)
}

type loggerOption struct {
  Log *zap.Logger
}

func (l loggerOption) apply(opts *options) {
  opts.logger = l.Log
}

func WithLogger(log *zap.Logger) Option {
  return loggerOption{Log: log}
}

// Open 创建连接。
func Open(
  addr string,
  opts ...Option,
) (*Connection, error) {
  options := options{
    cache:  defaultCache,
    logger: zap.NewNop(),
  }

  for _, o := range opts {
    o.apply(&options)
  }

  // ...
}
```

还有用闭包实现该模式的方法，但上述模式为作者提供更大灵活性，对用户也更易调试测试。尤其可以在测试与 mock 中比较选项（闭包无法比较）；并可实现其它接口（如 `fmt.Stringer`）便于输出可读字符串。

另见：

- [Self-referential functions and the design of options](https://commandcenter.blogspot.com/2014/01/self-referential-functions-and-design.html)
- [Functional options for friendly APIs](https://dave.cheney.net/2014/10/17/functional-options-for-friendly-apis)

<!-- TODO: 用参数结构 vs 函数式选项，何时使用 -->

<a id="linting"></a>

## Lint

比任何“官方” linter 更重要的是：在整个代码库中一致地进行 lint。

建议至少使用以下 linter，它们能捕获最常见的问题、建立高标准的代码质量，同时不过分武断：

- [errcheck](https://github.com/kisielk/errcheck) 确保错误被处理
- [goimports](https://pkg.go.dev/golang.org/x/tools/cmd/goimports) 格式化代码并管理 import
- [golint](https://github.com/golang/lint) 指出常见风格问题
- [govet](https://pkg.go.dev/cmd/vet) 分析常见错误
- [staticcheck](https://staticcheck.dev) 进行多种静态分析

### Lint 运行器

推荐使用 [golangci-lint](https://github.com/golangci/golangci-lint) 作为 Go 代码的 linter 运行器，主要因为它在大代码库中的性能，以及可同时配置/使用多种权威 linter。本仓库有一个示例 [.golangci.yml](https://github.com/uber-go/guide/blob/master/.golangci.yml) 配置文件，包含推荐的 linter 与设置。

golangci-lint 有[众多可用 linter](https://golangci-lint.run/usage/linters/)。上述为基础集，鼓励团队按需添加其它适合项目的 linter。
