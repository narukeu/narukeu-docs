---
title: NestJS 开发规范
---

本规范专注于 NestJS 框架在工程中的落地实践，旨在补充框架相关的具体约定与示例。

## 1. 概述

### 技术栈

NestJS + TypeScript + PostgreSQL

### ORM 的选择

暂不制定，因为目前没有过于优势的 ORM 方案。TypeORM 是社区比较多的选择，但其之前维护状态不佳，虽然 2024 年底被社区接手后有所改善，但仍需谨慎评估。Prisma 也是一个不错的选择，但其具体如何还有待观察。

## 2. 开发环境与工具

### 2.1 Node.js 版本

Node.js 版本要求遵循 [《Node.js 项目开发规范》](/articles/frontend-dev-conventions) 中的统一约定（最低 Node.js 22.x）。

### 2.2 常用脚本（示例）

- `pnpm start:dev`：本地开发（热重载）
- `pnpm build`：构建产物
- `pnpm lint:fix`：修复 Lint 问题
- `pnpm format`：代码格式化

## 3. NestJS 编码与框架实践

### 3.1 依赖注入（DI）

**为什么采用显式声明属性的 DI 风格？**

本规范推荐的 DI 风格（先声明属性，再在构造函数中通过 `@Inject()` 注入并赋值）与 NestJS 官方文档常见的"参数属性（Parameter Properties）"写法（`constructor(private readonly appService: AppService) {}`）不同。这是为了**兼容 TypeScript 的 `verbatimModuleSyntax: true` 编译选项**。

当启用 `verbatimModuleSyntax` 时，TypeScript 会严格按照代码书写保留 import/export 语句，仅用作类型的导入可能被擦除。在某些场景下，使用参数属性 + 装饰器的组合可能导致运行时元数据缺失，从而引发 DI 失败。通过显式声明属性并在构造函数中使用 `@Inject()` 装饰器，可以确保依赖信息在运行时完整保留。

**推荐的 DI 风格示例：**

```ts
import { Controller, Get, Inject } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  private readonly appService: AppService;

  constructor(@Inject(AppService) appService: AppService) {
    this.appService = appService;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

这种写法在 `verbatimModuleSyntax: true` 下能够可靠工作，同时也保持了代码的清晰性。

### 3.2 Swagger 注解（DTO）

- DTO 字段需通过 `@ApiProperty({ required: boolean })` 显式声明必填性；类型层面保持一致（可选使用 `?:` 或联合类型）。
- 除非必要，不填写冗余描述信息，保持注解简洁。

示例：

```ts
export class CreateSomethingDto {
  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ required: false })
  remark?: string;
}
```

### 3.3 中间件、守卫、拦截器与过滤器

- 合理拆分职责并复用：认证、鉴权、审计、日志、异常处理等横切关注点通过守卫/拦截器/过滤器实现。
- 统一异常处理：使用全局异常过滤器承接数据库/业务异常，返回与《后端项目开发规范（通用）》一致的响应结构。

## 4. 项目结构

- `src/common`：公共模块（全局 DTO/实体/工具/过滤器等）
- `src/core`：核心能力模块（如 system/user/dict/media 等）
- `src/modules`：业务域模块（按业务拆分）
- `src/constants`：项目级常量
- `src/types`：全局类型

### 4.1 目录的索引文件（index.ts）

- 每个目录提供 `index.ts` 聚合导出其“公共 API”（Module/Service/Controller/DTO/Entity/VO）。
- 不导出模块内部实现细节。

## 5. 数据访问与 TypeORM 集成（选型为 TypeORM 时）

### 5.1 与 NestJS 集成

- 在 `Service` 中通过 `@InjectRepository(Entity)` 注入 `Repository`；在模块中使用 `TypeOrmModule.forFeature([Entity])` 注册实体。

### 5.2 实体（Entity）

- 表名在 `@Entity('table_name')` 中显式指定（snake_case）。
- 字段类型与约束遵循《后端项目开发规范（通用）》的数据库规则（如 UTC `timestamptz`、`decimal`、`text` 等）。

### 5.3 关系与查询

- 显式定义关系与级联；避免滥用 `eager`，按需通过 `relations`/QueryBuilder 加载。
- 简单查询用 `Repository`，复杂查询用 `QueryBuilder`，统一参数化，避免 `SELECT *` 与 N+1。
- 分页统一走应用层分页 VO，或结合 ORM 的分页能力实现。
- 外键策略：遵循《后端项目开发规范（通用）》——数据库层不创建物理外键约束，使用应用层/服务层保证数据一致性。建模关系仅用于 ORM 层的对象导航与查询辅助；禁止开启自动同步生成外键（禁用 `synchronize: true` 或相关自动迁移中生成 FK 的配置），迁移脚本需由人工/审核流程维护（如 Flyway/手写 SQL）。

### 5.4 事务与软删除

- 多写操作封装在事务中；事务中避免耗时外部调用。
- 使用 `softDelete/restore` 实现逻辑删除与恢复。

## 6. API 设计在 NestJS 的落地

NestJS 项目的 API 设计完全遵循 [《后端项目开发规范（通用）》](/articles/backend-rules)，包括但不限于：

- 接口命名（`findOne`、`findList`、`findAll`、`create`、`update`、`remove`/`restore` 等）
- HTTP 方法使用（仅 GET/POST）
- 查询模式 `mode`（`default`/`withDeleted`/`onlyDeleted`）与权限点绑定策略
- 文件下载接口的鉴权、流式传输与断点续传支持

**NestJS 落地示例：**

```ts
import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { FindListDto } from "./dto/find-list.dto";
import { CreateUserDto } from "./dto/create-user.dto";

@ApiTags("用户管理")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("findList")
  @ApiOperation({ summary: "查询用户列表（支持查询模式）" })
  findList(@Body() dto: FindListDto) {
    return this.userService.findList(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "根据 ID 查询单个用户" })
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "创建用户" })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
```

在 NestJS 中，通过守卫（Guard）或拦截器（Interceptor）实现查询模式 `mode` 的权限校验与追加逻辑。

## 7. 参考

- NestJS 官方文档：https://docs.nestjs.com
- TypeORM 官方文档：https://typeorm.io/
- PostgreSQL 文档：https://www.postgresql.org/docs/
- Node.js 24.x 文档：https://nodejs.org/docs/latest-v24.x/api/
