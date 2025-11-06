# NestJS 开发规范

本规范专注于 NestJS 框架在工程中的落地实践，旨在补充框架相关的具体约定与示例。

## 1. 概述

### 技术栈

NestJS + TypeScript + PostgreSQL

### ORM 的选择

暂不制定，因为目前没有过于优势的 ORM 方案。TypeORM 是社区比较多的选择，但其之前维护状态不佳，虽然 2024 年底被社区接手后有所改善，但仍需谨慎评估。Prisma 也是一个不错的选择，但其具体如何还有待观察。

## 2. 开发环境与工具

### 2.1 Node.js 版本

- 运行时采用 Node.js 24.x；允许使用 Node 24 的原生能力与语法特性。

### 2.2 常用脚本（示例）

- `pnpm start:dev`：本地开发（热重载）
- `pnpm build`：构建产物
- `pnpm lint:fix`：修复 Lint 问题
- `pnpm format`：代码格式化

## 3. NestJS 编码与框架实践

### 3.1 依赖注入（DI）

- 推荐显式注入以确保运行时元数据完整：优先使用 `@Inject()` 显式标注依赖。
- 避免“参数属性 + 装饰器”的组合限制，先定义类属性，再在构造函数中赋值。

示例：

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

在 TypeScript 5 严格的模块/值导入策略（如 `verbatimModuleSyntax`）下，此模式可避免类型导入被“擦除”导致的运行时元数据缺失。

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

### 5.4 事务与软删除

- 多写操作封装在事务中；事务中避免耗时外部调用。
- 使用 `softDelete/restore` 实现逻辑删除与恢复。

## 6. API 设计在 NestJS 的落地

- 控制器与服务方法命名必须与《后端项目开发规范（通用）》一致（如 `findOne`、`findList`、`findAll`、`create`、`update`、`remove`/`restore` 等）。
- HTTP 仅使用 GET/POST；复杂查询（如 `findList`/`findAll`/树查询）使用 POST 携带 JSON Body。
- 查询模式 `mode`（`default`/`withDeleted`/`onlyDeleted`）与权限点绑定的策略，遵循通用规范；在网关/守卫中完成追加校验。
- 文件下载接口需做鉴权，支持流式与断点续传（Range 请求）。

## 7. 参考

- NestJS 官方文档：https://docs.nestjs.com
- TypeORM 官方文档：https://typeorm.io/
- PostgreSQL 文档：https://www.postgresql.org/docs/
- Node.js 24.x 文档：https://nodejs.org/docs/latest-v24.x/api/
