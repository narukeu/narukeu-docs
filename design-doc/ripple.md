# 基础设施-业务功能设计文档

> [!TIP]
> 由于后端主要使用 `PostgreSQL` 作为数据库，字段类型均以 `PostgreSQL` 为准。
>
> 如无特别说明，本设计文档仅补充 Ripple 特有的约定和差异；通用部分（接口规范、审计字段、错误码、分页与查询模式等）均以 [《后端项目开发规范（通用）》](/articles/backend-rules) 为准，此处不再展开。

> [!NOTE]
> 本文中如未特别说明：
>
> - **数据表结构**中的字段名统一采用 `snake_case`（对应 PostgreSQL 列名）；
> - **接口入参 / 出参（包括“筛选字段”）**统一指 JSON 字段名，采用小驼峰（`camelCase`）命名，例如：数据库字段 `nick_name` 对应 JSON 字段 `nickName`，`created_time` 对应 `createdTime`。
>   在描述查询条件、筛选字段等场景时，除非明确说明“数据库字段”，一律以 JSON 字段名为准。
> - **项目统一使用** `Request` 和 `Response` 来分别表示接口入参和出参的数据传输对象（DTO）和视图对象（VO）。

## 0. 总体

名为 `Ripple` 的后端基础设施，单体架构，单租户，软件包名为 `github.com/okutils/ripple`。

设计思路参考了 `ruoyi` 开源项目，同时结合项目需求进行调整。

### 0.1 后端技术栈

- Go 1.25+
- Gin 框架：`github.com/gin-gonic/gin`
- GORM ORM：`gorm.io/gorm`
- Flyway
- PostgreSQL：`gorm.io/driver/postgres`
- JWT：`github.com/golang-jwt/jwt`
- Zap：`go.uber.org/zap`
- Redis：`github.com/redis/go-redis`
- Viper：`github.com/spf13/viper`
- Casbin：`github.com/casbin/casbin/v2`
- Swaggo：`github.com/swaggo/swag`
- UUID：`github.com/google/uuid`
- Lo：`github.com/samber/lo`，Go 的实用工具库。
- Gorilla WebSocket：`github.com/gorilla/websocket`

### 0.2 项目结构

在[《Go 语言项目开发、风格和命名规范》](/articles/go-conventions)上进行细化：

- `cmd/`
  - `main.go`：项目入口文件。
- `internal/`
  - `common/`：不需要导出的公共模块。
    - `models/`：公共模型，如 `BaseModel`。
    - `middleware/`：中间件定义
    - `request/`：数据传输对象定义
    - `response/`：视图对象定义，不要将所有 Response 都混在一个文件里，要拆分
  - `config/`：配置管理模块
  - `database/`：数据库连接和初始化模块
    - `migrations/`：数据库迁移脚本
  - `app/`
    - `core/`：核心模块，每一个模块是独立的功能单元，包含控制器、服务等等。
      - `system/`：系统模块
        - `user`：以 User 模块为例
        - `handler/`：用户控制器
        - `service/`：用户服务
        - `model/`：用户数据模型
        - `request/`
          - `create_user_request.go`
        - `response`
          - `user_response.go`
      - `user/`：用户模块
      - `auth/`：认证模块
    - 其他业务模块
  - `routes/`：路由定义，在此处注册各模块路由。
  - `utils/`：工具函数模块

### 0.3 公共字段

若非特别说明，所有数据表都应包含一组标准公共字段（主键、审计时间、操作人、状态、备注、系统保留标记等），以记录元数据。配置表、关联表等特殊表除外。字段名称、类型与约束统一遵循《后端项目开发规范（通用）》中的“公共字段规范”章节，这里只在存在差异时单独说明。

主键 UUID 在应用层，使用 `github.com/google/uuid` 生成 UUIDv7。

### 0.4 长连接

用户在登录之后，自动连接到后端 WebSocket 服务。WebSocket 服务也应当使用 JWT 进行鉴权。
用户在什么场合向服务端发送消息、服务端向用户发送什么消息，在具体业务模块中会讲述。

- 鉴权与握手：优先在握手阶段通过 `Sec-WebSocket-Protocol: bearer, <JWT>` 传递 Token（或受控 Cookie）。不建议将 Token 放在 Query 参数。鉴权失败使用关闭码 4401/4403 并返回错误消息后关闭。
- 多实例：如采用多副本部署，与在线会话/推送相关的事件通过 Redis Pub/Sub 或 Stream 广播到各实例进行路由。

#### 0.4.1 发送和接收消息格式

##### 0.4.1.1 接收格式

```jsonc
{
  "requestId": "",
  "action": "", // 动作名称，具体会在业务功能模块中定义。
  "businessCode": 0, // 业务状态码：0 表示成功，非 0 表示具体错误类型。
  "isSuccess": true, // 操作是否成功，错误时为 false。
  "message": "操作成功！", // 结果消息，错误时返回错误信息。
  "data": {}, // 返回的数据，错误时为 null。
  "timestamp": "2025-11-05T07:44:01.608Z", // ISO 8601 格式的时间戳。
  "errors": null // 可选，详细错误信息列表，用于复杂业务错误场景。
}
```

##### 0.4.1.2 发送格式

```jsonc
{
  "requestId": "",
  "action": "", // 动作名称，具体会在业务功能模块中定义。
  "payload": {} // 发送的数据负载。
}
```

#### 0.4.2 心跳和重连

- 客户端每隔 30 秒发送一次心跳消息，格式同发送格式，`action` 字段为 `heartbeat`，`payload` 为空对象 `{}`。
- 有三次重试机会，采取指数退避策略，初始间隔 1 秒，每次失败后间隔翻倍。
- Token 过期策略：到期断开，前端获取新 Token 后重连（简化方案）。

### 0.5 字典引用字段统一约定

为与“字典值既可为数字也可为字符串”的规则保持一致，统一约定如下：

- 所有引用字典值的业务字段一律使用 `VARCHAR(32)` 存储，对应字典表中的 `value`；若 `value` 为数字，则以字符串形式存储。
- 接口入参与出参均使用字符串表达字典值；需要数值语义的场景由服务端在业务层进行解析/转换。
- 示例字段：公共字段 `status`、菜单 `type`、公告 `importance` 等。
- 该约定可避免跨表强类型耦合，便于后续对字典取值形态（数值/字符串）的演进。

### 0.6 其他

- 每一个结构体都应该有一个构造函数（约定名称为 `NewXxx`，`Xxx` 为结构体名称。），用于初始化。

## 1. 用户模块

### 1.1 用户管理

#### 1.1.1 用户表设计

| 字段名     | 类型         | 描述     | 备注                                                                | 索引 | 可选 | 是否唯一 | 默认值 |
| ---------- | ------------ | -------- | ------------------------------------------------------------------- | ---- | ---- | -------- | ------ |
| name       | VARCHAR(64)  | 用户名   | 应当是英文字母                                                      | 是   |      | 是       |        |
| nick_name  | VARCHAR(128) | 昵称     | 若不填，前端则显示 `name`                                           |      | 是   | 否       |        |
| real_name  | VARCHAR(128) | 真实姓名 |                                                                     |      | 是   | 否       |        |
| email      | VARCHAR(256) | 邮箱地址 | 建议大小写不敏感唯一                                                | 是   | 是   | 是       |        |
| phone      | VARCHAR(64)  | 手机号码 | 必须是字符串（建议使用 E.164 规范）                                 | 是   | 是   | 是       |        |
| password   | VARCHAR(256) | 密码     | 必须加盐（argon2id），存储哈希                                      |      |      | 否       |        |
| avatar_url | TEXT         | 头像地址 | 可以是 URL，也可以是在对象存储中的标识符，越长越好，所以类型 `TEXT` |      | 是   | 否       |        |

> [!NOTE]
>
> - 唯一性与软删除：`name`、`email`、`phone` 的唯一性仅对未删除记录生效（`deleted_time IS NULL` 的部分唯一索引）。`name`/`email` 建议使用不区分大小写唯一（如对 `LOWER(name)`、`LOWER(email)` 建唯一索引）。
> - 安全：密码必须使用 `argon2id`（存储为标准编码串 `$argon2id$...`），建议参数：内存 64–128MB、迭代 1–3、并行度 1–4。初始化/重置密码后建议强制用户首次登录修改（见业务规则）。

##### 1.1.1.1 Request 字段

Request 和 Response 作为 JSON 的时候，字段名均采用驼峰命名法（`camelCase`），以下不再赘述。

- 实现表中所有字段
- 在修改表单时，Request 还需要 `oldPassword` 字段，用于验证旧密码；仅当修改密码时为必填。
- 接受 `roleIds` 数组字段，用于指定用户所属角色。
- 密码最低 12 位，前后端均需校验。

> [!NOTE]
> 后台管理员为他人重置密码不要求 `oldPassword`，但需要具备相应权限点；建议提供独立的重置密码表单/Request。

##### 1.1.1.2 Response 字段

- 实现 Request 中所有字段，**但不包含密码字段**。

#### 1.1.2 用户状态

和公共字段中的 `status` 字段一致。

#### 1.1.3 关联

1. 和角色关联，多对多关系，通过关联表实现。
2. 和部门关联，多对多关系，一个用户可以属于多个部门，一个部门也可以有多个用户，通过关联表实现。

#### 1.1.4 接口

接口集合与行为遵循《后端项目开发规范（通用）》中定义的“标准 CRUD 接口”和“当前用户相关接口”约定（`findAll` 接口为可选，此处不强制要求实现）：

- 基础接口：`findOne`、`findList`、`create`、`createMany`、`update`、`delete`、`deleteMany`、`remove`、`removeMany`、`restore`、`restoreMany`、`count`、`findOnlyDeleted`
- 当前用户接口：`findMy`（查询自己的资料）、`updateMy`（修改自己的资料）。

入参结构、分页规则、错误处理与返回格式不在本节重复，统一参考通用规范。

#### 1.1.5 初始化数据

| 用户 ID  | 用户名  | 密码                 | 角色                         | 系统保留用户 |
| -------- | ------- | -------------------- | ---------------------------- | ------------ |
| 随机生成 | `root`  | 部署时生成随机强密码 | `超级管理员`,`管理员`,`用户` | 是           |
| 随机生成 | `guest` | 部署时生成随机强密码 | `游客`                       | 是           |

> [!NOTE]
>
> - 初始化密码不在文档中以明文展示；部署阶段生成一次性强密码并要求首次登录修改。
> - `guest` 保留用户禁止手动登录（见登录规则）。

#### 1.1.6 业务规则

##### 1.1.6.1 创建/修改逻辑

###### 1.1.6.1.1 后台管理面板的用户管理表单

- 创建/修改时，用户可以选择和修改所属角色，前端角色字段为多选框。
- 用户在创建时必须设置符合密码策略的密码（长度、复杂度等统一遵循通用规范和本节“密码规则”约定）。
- 管理员修改他人资料时允许不修改密码；如需重置密码，不要求旧密码，但必须具备相应权限点并记录审计日志（审计字段与日志规范参考通用规范）。

###### 1.1.6.1.2 用户修改自己资料（updateMy）

- 字段和后台用户管理表单相同，但不允许修改自己的角色。
- 用户在修改资料时，非敏感字段（如昵称、头像、邮箱、手机号等）的修改不需要旧密码。
- 用户如选择修改密码，则必须提供 `oldPassword` 进行验证，否则报错；密码强度校验与登录模块的密码规则保持一致。

##### 1.1.6.2 权限规则

- 普通用户只能查询和修改自己的资料，不能查询其他用户的信息，因此，用户管理的 `findOne` 等管理接口默认不向普通用户授予 CRUD 权限，权限由菜单/角色配置决定。
- 管理员用户和超级管理员用户可以查询和修改所有用户的信息，仍通过菜单里的权限赋予实现，具体权限点命名与菜单 `permission_code` 规则保持一致。
- 上述权限不要通过业务代码硬编码，统一交由 RBAC + 菜单权限体系（见“鉴权”章节）控制。

##### 1.1.6.3 删除逻辑

- 删除用户前应检查是否有重要的关联数据，若有则阻止删除操作并返回错误信息。
- 其他检查：
  - 若该用户为某部门 `leader_id`，需先转移负责人或置空后再删除。
  - 与角色、部门的关联应在事务中安全解关联。
  - 系统保留用户（如 `root`、`guest`）不可删除。

##### 1.1.6.4 查询逻辑

用户列表的查询模式遵循通用规范的“列表筛选与分页”规则，Ripple 仅补充本模块特有的筛选字段：

- 支持模糊查询：`name`、`nickName`、`realName`、`email`、`phone`；
- 精确查询：`status`、`isSystemReserved`；
- 多选条件：`roleIds`（至少包含其中任一角色）、`deptIds`（属于其中任一部门）；
- 时间范围：`createdTime`（开始-结束）。

组合规则与通用规范一致：除 `role_ids` 与 `dept_ids` 在各自集合内使用 OR 逻辑外，不同字段间采用 AND 组合。

### 1.2 角色

#### 1.2.1 角色表设计

| 字段名 | 类型        | 描述     | 备注 | 索引 | 可选 | 是否唯一 | 默认值 |
| ------ | ----------- | -------- | ---- | ---- | ---- | -------- | ------ |
| name   | VARCHAR(64) | 角色名   |      |      |      | 是       |        |
| code   | VARCHAR(64) | 角色编码 |      |      |      | 是       |        |

##### 1.2.1.1 Request 字段

- 实现表中所有字段
- 接受 `userIds` 数组字段，用于指定角色所属用户。
- 接受 `menuIds` 数组字段，用于指定角色拥有的菜单权限。

##### 1.2.1.2 Response 字段

- 实现 Request 中所有字段。

#### 1.2.2 关联

1. 和用户关联，多对多关系，通过关联表实现。
2. 和菜单关联，多对多关系，通过关联表实现，实现角色权限控制。

#### 1.2.3 接口

角色模块沿用通用规范的标准接口集合：`findOne`、`findList`、`create`、`createMany`、`update`、`delete`、`deleteMany`、`remove`、`removeMany`、`restore`、`restoreMany`、`count`、`findOnlyDeleted`，参数与返回体结构不再赘述。

#### 1.2.4 初始化数据

| 角色 ID  | 角色名     | 角色编码  | 是否系统保留角色 |
| -------- | ---------- | --------- | ---------------- |
| 随机生成 | 超级管理员 | `root`    | 是               |
| 随机生成 | 管理员     | `admin`   | 是               |
| 随机生成 | 用户       | `user`    | 是               |
| 随机生成 | 游客       | `visitor` | 是               |

#### 1.2.5 业务规则

- 一个用户可以有多个角色，管理员用户必须同时具有 `admin` 和 `user` 角色，超级管理员用户必须同时具有 `root`、`admin` 和 `user` 角色。
- 系统保留角色（`root`、`admin`、`user`、`visitor`）不可被删除，无论是逻辑删除还是物理删除；其 `code` 不可修改。
- 非游客用户不可被赋予游客角色。

##### 1.2.5.1 查询逻辑

角色列表查询参数及分页行为遵循通用规范，仅补充本模块特有筛选字段与含义：

- 模糊查询：`name`、`code`；
- 精确查询：`status`、`is_system_reserved`；
- 多选：`user_ids`（至少关联其中任一用户的角色）、`menu_ids`（至少包含其中任一菜单权限的角色）；
- 时间范围：`created_time`（开始-结束）。

字段之间默认 AND 组合，`user_ids` 与 `menu_ids` 的多选条件在各自集合内采用 OR 逻辑，与其他模块保持一致。

## 2. 系统模块

### 2.1 菜单管理

若非特别说明，这里指的是 PC 管理端菜单。
日后可能会扩展移动端、或者是其他环境的菜单，届时可另行设计数据表。

#### 2.1.1 菜单表设计

- 树表实现，使用闭包表。

| 字段名          | 类型         | 描述         | 备注               | 索引 | 可选 | 是否唯一 | 默认值  |
| --------------- | ------------ | ------------ | ------------------ | ---- | ---- | -------- | ------- |
| name            | VARCHAR(128) | 菜单名称     |                    |      |      | 否       |         |
| code            | VARCHAR(64)  | 菜单编码     |                    | 是   |      | 是       |         |
| route           | VARCHAR(256) | 菜单路径     | 前端路由           |      | 是   | 否       |         |
| icon            | VARCHAR(256) | 菜单图标     |                    |      | 是   | 否       |         |
| sort            | INTEGER      | 排序         |                    | 是   |      | 否       | `0`     |
| parent_id       | UUID         | 父级菜单     |                    | 是   | 是   | 否       | `NULL`  |
| permission_code | VARCHAR(128) | 权限编码     | 唯一               | 是   | 是   | 是       |         |
| type            | VARCHAR(32)  | 菜单类型     | 取自字典 MENU_TYPE |      |      | 否       |         |
| is_refresh      | BOOLEAN      | 是否需要刷新 |                    |      | 是   | 否       | `false` |
| is_href         | BOOLEAN      | 是否为外链   | 是的话新窗口打开   |      | 是   | 否       | `false` |

- `type` 字段用于区分菜单类型，例如目录、菜单项、按钮等，它的值详见字典初始化数据。

##### 2.1.1.1 Request 字段

- 实现表中所有字段
- 接受 `roleIds` 数组字段，用于指定菜单所属角色。
- 前端需要提交 `parentId` 字段，以构建树形结构。

##### 2.1.1.2 Response 字段

- 实现 Request 中所有字段，另外查询的时候要有 `children`。

#### 2.1.2 关联

1. 和角色关联，多对多关系，通过关联表实现，实现角色权限控制。

#### 2.1.3 接口

菜单模块在标准 CRUD 接口基础上，增加树查询能力：

- 基础接口：`findOne`、`findList`、`create`、`createMany`、`update`、`delete`、`deleteMany`、`remove`、`removeMany`、`restore`、`restoreMany`、`count`、`findOnlyDeleted`；
- 树接口：`findTree`、`findTreeAll`，其入参与树形返回结构遵循通用规范中的树接口约定。

##### 2.1.3.1 创建/修改逻辑

- 菜单的 `type` 字段用于区分菜单类型，例如目录、菜单项、按钮（又作接口）等。
- 创建/修改菜单时，前端应根据 `type` 字段动态调整表单项。例如，若 `type` 为目录，则不显示 `route` 字段。
- 菜单的 `permission_code` 字段必须唯一，不允许重复。
- 创建/修改菜单时，若指定了 `parent_id`，则必须验证该父级菜单是否存在，且不能是当前菜单本身或其子菜单，以防止循环引用。
- 菜单的排序字段 `sort` 应允许用户自定义，以控制菜单在前端的显示顺序。默认值为 `0`，数值越小，排序越靠前。
- 用户在创建/修改菜单时，可以选择该菜单所属的角色，实现权限控制。
- 闭包表维护：节点移动（变更 `parent_id`）需在事务中同步更新闭包关系（保留自反关系 `depth=0`）。

##### 2.1.3.2 查询逻辑

菜单列表与树查询遵循通用规范的筛选与分页模式，Ripple 增补以下特定字段与树行为说明：

- 筛选字段：
  - 模糊查询：`name`、`code`、`permission_code`；
  - 精确查询：`type`、`status`。

- 树查询：在应用筛选条件后以树结构返回。当 `parent_id` 作为查询参数时，返回以该菜单为根节点的完整子树；树接口通常不分页，如需分页仅对根层节点分页，子孙节点全量展开（与部门、字典模块的树接口保持一致）。

#### 2.1.4 初始化数据

这里的菜单数据在文档中不包含按钮级别，但在实际项目中应当包含按钮级别的权限点。

| 菜单 ID  | 菜单名称 | 菜单编码                | 菜单路径                 | 权限                    | 图标 | 排序  | 父级菜单 | 初始化赋予的角色  |
| -------- | -------- | ----------------------- | ------------------------ | ----------------------- | ---- | ----- | -------- | ----------------- |
| 随机生成 | 仪表盘   | dashboard               | /dashboard               | dashboard               |      | 0     |          | root, admin, user |
| 随机生成 | 用户管理 | dashboard_user          | /dashboard/user          | dashboard:user          |      | 10000 | 仪表盘   | root, admin       |
| 随机生成 | 用户列表 | dashboard_user_manage   | /dashboard/user/manage   | dashboard:user:manage   |      | 10100 | 用户管理 | root, admin       |
| 随机生成 | 角色列表 | dashboard_user_role     | /dashboard/role/manage   | dashboard:user:role     |      | 10200 | 用户管理 | root, admin       |
| 随机生成 | 系统管理 | dashboard_system        | /dashboard/system        | dashboard:system        |      | 20000 | 仪表盘   | root, admin       |
| 随机生成 | 菜单管理 | dashboard_system_menu   | /dashboard/system/menu   | dashboard:system:menu   |      | 20100 | 系统管理 | root, admin       |
| 随机生成 | 部门管理 | dashboard_system_dept   | /dashboard/system/dept   | dashboard:system:dept   |      | 20200 | 系统管理 | root, admin       |
| 随机生成 | 公告管理 | dashboard_system_notice | /dashboard/system/notice | dashboard:system:notice |      | 20300 | 系统管理 | root, admin       |
| 随机生成 | 在线用户 | dashboard_system_online | /dashboard/system/online | dashboard:system:online |      | 20400 | 系统管理 | root, admin       |

#### 2.1.5 业务逻辑

- 当一个目录下面没有内容，或者只有按钮类型的菜单时，该目录在前端不显示。
- 由于权限控制是基于菜单实现的，因此每一个权限点都必须对应一个菜单项，即使是按钮类型的权限点，也必须在菜单表中有对应的记录。
- 权限赋予不得硬编码在代码中，必须通过系统菜单和角色来实现。

### 2.2 在线用户

在线用户功能用于展示当前通过登录并持有有效会话的用户列表，便于管理员实时查看系统使用情况并对存在风险的会话进行强制下线操作。

#### 2.2.1 数据存储设计

- 在线用户状态统一存储在 `Redis` 中。
- 每次用户登录成功后，生成一个会话编号 `sessionId`（使用 `UUIDv7`），并将会话信息写入 `Redis`：
  - 单个会话信息采用 Hash 或 JSON 字符串形式存储，Key 建议为：`ripple:auth:online:session:<sessionId>`。
  - 用于快速按用户维度聚合的索引 Key：`ripple:auth:online:user:<userId>`，Value 为该用户当前有效会话 `sessionId` 集合（Set）。
- 会话 Key 的 TTL 建议设置为“访问令牌有效期 + 30 秒缓冲”；调用刷新令牌接口时不自动刷新该 TTL（会话生命周期与初次登录的访问令牌周期绑定）。
- 当访问令牌过期或用户主动退出登录时，自动从 `Redis` 中清理对应会话数据。

单个在线会话记录建议包含如下字段（值以字符串形式存储）：

| 字段名    | 描述             | 备注                                 |
| --------- | ---------------- | ------------------------------------ |
| sessionId | 会话编号         | `UUIDv7`，由系统在登录成功后生成     |
| userId    | 用户 ID          | 对应用户表主键                       |
| userName  | 登录名           | 对应用户表中的 `name` 字段           |
| ip        | 登录 IP 地址     | 从请求中解析得到                     |
| userAgent | User-Agent 信息  | 从请求头中读取，必要时可裁剪长度     |
| loginTime | 登录时间         | ISO 8601 文本，例如 `2025-11-13T...` |
| jwtId     | 访问令牌唯一标识 | 可选，用于与 JWT 的 `jti` 建立关联   |

说明：

- 若同一用户在多个终端或浏览器中登录，则会产生多条在线会话记录，每条记录拥有独立的 `sessionId`。
- 后续如需扩展，可在会话记录中增加地理位置、登录渠道等字段，但本期仅实现上述必要字段。

#### 2.2.2 接口

在线用户管理作为系统模块下的一个子功能，推荐提供以下接口（具体入参与出参格式详见《后端项目开发规范（通用）》）：

- `findList` - 分页/条件查询在线用户列表。
- `count` - 查询当前在线会话总数。
- `kickOut` - 根据会话编号强制下线指定会话。

接口均属于系统管理后台接口，仅对具有对应菜单权限的管理员/超级管理员开放，普通用户不得访问。

##### 2.2.2.1 查询字段与返回结构

查询接口（`findList`）支持以下筛选字段（均为 JSON 字段，采用 `camelCase`）：

- `userName`：支持模糊查询，用于按登录名搜索在线用户。
- `ip`：支持精确查询或前缀匹配，用于按 IP 过滤会话。
- `userAgent`：支持模糊查询，用于按 UA 关键字过滤（例如移动端、浏览器类型等）。
- `loginTime`：范围查询（开始-结束），用于筛选某个时间段内登录的会话。

组合规则：不同字段之间默认采用 AND 组合。

在线用户列表 Response 建议包含以下字段：

- `sessionId`
- `userId`
- `userName`
- `ip`
- `userAgent`
- `loginTime`

##### 2.2.2.2 踢下线（kickOut）

踢下线接口用于强制某个在线会话立即失效：

- 入参至少包含：`sessionId`。
- 业务流程：
  - 根据 `sessionId` 从 `Redis` 查询会话记录；如不存在则视为成功。
  - 删除会话 Key：`ripple:auth:online:session:<sessionId>`。
  - 从 `ripple:auth:online:user:<userId>` Set 中移除对应 `sessionId`，如该用户不再有其他会话，则可选择性删除该用户 Key。
  - 若在线会话与 JWT 的 `jti` 关联，则同时将该 `jti` 写入黑名单或标记为失效，确保剩余有效期内无法继续使用旧 Token 访问接口。
  - 如当前会话已建立 WebSocket 连接，应通过服务端通知该连接强制断开。

权限控制：

- 只有具有系统管理相关菜单权限（如 `dashboard:system:online` 或其下按钮权限）的管理员和超级管理员可以调用 `kickOut` 接口。
- 普通用户不可踢其他用户下线；如未来允许“自踢”（退出其他设备登录），应通过单独的用户模块接口实现。

### 2.3 字典

#### 2.3.1 字典表设计

- 树表实现，使用邻接表模型。

| 字段名    | 类型         | 描述     | 备注                       | 索引 | 可选 | 是否唯一 | 默认值 |
| --------- | ------------ | -------- | -------------------------- | ---- | ---- | -------- | ------ |
| name      | VARCHAR(128) | 字典名称 |                            |      |      | 否       |        |
| code      | VARCHAR(64)  | 字典编码 | 顶级类目使用（value 为空） | 是   |      | 是       |        |
| value     | VARCHAR(32)  | 字典值   |                            | 是   | 是   | 否       |        |
| parent_id | UUID         | 父级字典 |                            | 是   | 是   | 否       | `NULL` |

- 为了保证字典值的通用性，因此允许数字，也允许字符串（统一以 `VARCHAR(32)` 字符串存储）。
- 约束约定：
  - 顶级类目：`parent_id IS NULL AND value IS NULL`，`code` 唯一。
  - 条目：`parent_id IS NOT NULL AND value IS NOT NULL`，同一父级下 `(parent_id, value)` 唯一。
  - 唯一性仅对未删除记录生效（部分唯一索引）。

##### 2.3.1.1 Request 字段

- 实现表中所有字段；提交数据时使用 `parentId` 指定父子关系，不包含 `children`。

##### 2.3.1.2 Response 字段

- 实现 Request 中所有字段；树查询时包含 `children`。

#### 2.3.2 接口

字典模块接口与菜单、部门模块类似，沿用通用规范中的标准列表/树/统计接口：`findOne`、`findList`、`findTree`、`findTreeAll`、`create`、`createMany`、`update`、`delete`、`deleteMany`、`remove`、`removeMany`、`restore`、`restoreMany`、`count`，此处不展开入参/出参细节。

#### 2.3.3 初始化数据

均为系统保留数据。

| 字典 ID  | 字典名称     | 字典编码                   | 字典值 | 父级              | 备注                                                   |
| -------- | ------------ | -------------------------- | ------ | ----------------- | ------------------------------------------------------ |
| 随机生成 | 性别         | GENDER                     |        |                   | 取自国家标准代码                                       |
| 随机生成 | 未知性别     | GENDER_UNKNOWN             | 0      | GENDER            |                                                        |
| 随机生成 | 男           | GENDER_MALE                | 1      | GENDER            |                                                        |
| 随机生成 | 女           | GENDER_FEMALE              | 2      | GENDER            |                                                        |
| 随机生成 | 未说明的性别 | GENDER_NONE                | 9      | GENDER            |                                                        |
| 随机生成 | 菜单类型     | MENU_TYPE                  |        |                   | 菜单类型（目录/菜单项/按钮）                           |
| 随机生成 | 目录         | MENU_TYPE_DIR              | 0      | MENU_TYPE         |                                                        |
| 随机生成 | 菜单项       | MENU_TYPE_MENU             | 1      | MENU_TYPE         |                                                        |
| 随机生成 | 按钮         | MENU_TYPE_BUTTON           | 2      | MENU_TYPE         |                                                        |
| 随机生成 | 状态         | STATUS                     |        |                   | 通用状态（无效/有效）                                  |
| 随机生成 | 无效         | STATUS_DISABLED            | 0      | STATUS            |                                                        |
| 随机生成 | 有效         | STATUS_ENABLED             | 1      | STATUS            |                                                        |
| 随机生成 | 重要程度     | NOTICE_IMPORTANCE          |        |                   | 公告重要程度（非常重要/比较重要/中等/不太重要/不重要） |
| 随机生成 | 非常重要     | NOTICE_IMPORTANCE_CRITICAL | 0      | NOTICE_IMPORTANCE |                                                        |
| 随机生成 | 比较重要     | NOTICE_IMPORTANCE_HIGH     | 1      | NOTICE_IMPORTANCE |                                                        |
| 随机生成 | 中等         | NOTICE_IMPORTANCE_MEDIUM   | 2      | NOTICE_IMPORTANCE |                                                        |
| 随机生成 | 不太重要     | NOTICE_IMPORTANCE_LOW      | 3      | NOTICE_IMPORTANCE |                                                        |
| 随机生成 | 不重要       | NOTICE_IMPORTANCE_NONE     | 4      | NOTICE_IMPORTANCE |                                                        |
| 随机生成 | 公告状态     | NOTICE_STATUS              |        |                   | 公告业务发布状态（草稿/待审核/已发布）                 |
| 随机生成 | 草稿         | NOTICE_STATUS_DRAFT        | 0      | NOTICE_STATUS     |                                                        |
| 随机生成 | 待审核       | NOTICE_STATUS_PENDING      | 1      | NOTICE_STATUS     |                                                        |
| 随机生成 | 已发布       | NOTICE_STATUS_PUBLISHED    | 2      | NOTICE_STATUS     |                                                        |

#### 2.3.4 业务逻辑

##### 2.3.4.1 查询逻辑

字典查询遵循通用列表/树接口的筛选与分页规范，仅保留核心筛选字段：

- `name`：支持模糊查询；
- `code`：支持模糊查询；
- `value`：支持模糊查询。

### 2.4 部门管理

#### 2.4.1 部门表设计

- 树表实现，使用闭包表（Closure Table）模型。

| 字段名        | 类型         | 描述         | 备注           | 索引 | 可选 | 是否唯一 | 默认值 |
| ------------- | ------------ | ------------ | -------------- | ---- | ---- | -------- | ------ |
| name          | VARCHAR(128) | 部门名称     |                |      |      | 否       |        |
| code          | VARCHAR(64)  | 部门编码     | 唯一           |      |      | 是       |        |
| parent_id     | UUID         | 上级部门     |                | 是   | 是   | 否       | `NULL` |
| leader_id     | UUID         | 负责人       | 从用户表中选择 | 是   | 是   | 否       | `NULL` |
| contact_phone | VARCHAR(64)  | 部门联系电话 | 必须为字符串   |      | 是   | 否       |        |
| email         | VARCHAR(256) | 部门邮箱     |                |      | 是   | 否       |        |

##### 2.4.1.1 Request 字段

- 实现表中所有字段
- 前端需要提交 `parentId` 字段，以构建树形结构。
- 负责人使用 `leaderId` 字段，取值来自用户表。

##### 2.4.1.2 Response 字段

- 实现 Request 中所有字段，另外查询的时候要有 `children`。

#### 2.4.2 关联

- 从 **leader_id** 上和用户进行多对一关联，即一个用户可以负责多个部门，但一个部门只能有一个负责人。

#### 2.4.3 接口

部门模块接口沿用标准树表模块规范：`findOne`、`findList`、`findTree`、`findTreeAll`、`create`、`createMany`、`update`、`delete`、`deleteMany`、`remove`、`removeMany`、`restore`、`restoreMany`、`count`，树结构入参/返回规则参考通用规范，这里只在“查询逻辑”中强调 Ripple 特有行为。

##### 2.4.3.1 创建/修改逻辑

- 部门的 `code` 字段必须唯一，不允许重复。
- 创建/修改部门时，若指定了 `parent_id`，则必须验证该父级部门是否存在，且不能是当前部门本身或其子部门（通过 `dept_closure` 检查）以防止循环引用。
- 负责人 `leader_id` 可选；如提供则必须为系统中已存在且有效的用户。
- 允许不指定负责人。
- 当变更 `parent_id`（移动节点）时，必须在事务中维护 `dept_closure`：删除旧祖先关系并按新父级重建；保留所有节点的自反闭包关系。

#### 2.4.4 初始化数据

| 部门 ID  | 部门名称 | 部门编码   | 父级部门 | 是否系统保留 |
| -------- | -------- | ---------- | -------- | ------------ |
| 随机生成 | 公司总部 | `ORG_ROOT` |          | 是           |

#### 2.4.5 业务逻辑

- 当某个部门没有子部门且没有下属业务需要展示时，前端可根据实际需要隐藏展示。
- 删除部门前应检查是否存在子部门（`dept_closure` 中存在 `ancestor_id = deptId AND depth > 0` 即表示存在后代），若有则阻止删除操作并返回错误信息。
- 权限赋予不得硬编码在代码中，与部门相关的访问控制应结合角色与菜单进行设计，不直接绑定在部门上。

##### 2.4.5.1 查询逻辑

部门查询与树接口在筛选、分页上的通用行为与菜单/字典模块保持一致，仅强调部门特有字段及闭包表语义：

- 筛选字段：
  - 模糊查询：`name`、`code`；
  - 精确查询：`parent_id`（只看某父级下的直接子部门）、`leader_id`、`status`；
  - 时间范围：`created_time`（开始-结束）。

- 树查询说明（闭包表）：
  - 列表接口中，`parent_id` 作为过滤条件时，仅返回该父级的直接子部门；
  - `findTree` 在提供 `rootId`（或通过路由参数指定根节点）时，基于 `dept_closure` 返回以该节点为根的完整子树，`findTreeAll` 返回整棵树/森林；
  - 祖先链（用于面包屑）可通过 `descendant_id = :deptId` 且按 `depth` 升序获取。

### 2.5 公告管理

#### 2.5.1 公告表设计

- 普通表实现。

| 字段名         | 类型         | 描述     | 备注                            | 索引 | 可选 | 是否唯一 | 默认值  |
| -------------- | ------------ | -------- | ------------------------------- | ---- | ---- | -------- | ------- |
| title          | VARCHAR(256) | 公告标题 |                                 |      |      | 否       |         |
| description    | VARCHAR(512) | 公告描述 | 简短描述，用于列表展示          |      | 是   | 否       |         |
| content        | TEXT         | 公告内容 | 存储 Markdown 原文              |      |      | 否       |         |
| importance     | VARCHAR(32)  | 重要程度 | 取自字典 NOTICE_IMPORTANCE      |      |      | 否       | `2`     |
| publish_status | VARCHAR(32)  | 发布状态 | 取自字典 NOTICE_STATUS          | 是   |      | 否       | `0`     |
| publish_time   | timestamptz  | 发布时间 | UTC                             |      | 是   | 否       | `NULL`  |
| expire_time    | timestamptz  | 过期时间 | 到期不再推送/展示（不删除数据） |      | 是   | 否       | `NULL`  |
| pinned         | BOOLEAN      | 是否置顶 |                                 |      | 是   | 否       | `false` |

##### 2.5.1.1 Request 字段

- 实现表中所有字段
- 接受 `deptIds` 数组字段，用于指定公告范围（以部门为单位）。

##### 2.5.1.2 Response 字段

- 实现 Request 中所有字段。

#### 2.5.2 关联

1. 和部门关联，多对多关系，一个公告可面向多个部门，一个部门可接收多个公告，通过关联表实现。
2. 与用户的阅读状态通过关联表记录：`notice_reads(user_id, notice_id, read_time)`（用于未读/已读统计与补偿）。

#### 2.5.3 接口

- `findOne`
- `findList`
- `create`
- `createMany`
- `update`
- `delete`
- `deleteMany`
- `remove`
- `removeMany`
- `restore`
- `restoreMany`
- `count`
- `findOnlyDeleted`
- `push` - 公告推送（基于 WebSocket）

#### 2.5.4 初始化数据

- 无。

#### 2.5.5 业务逻辑

- 公告内容以 Markdown 形式输入与存储，前端展示一个 Markdown 编辑器用于录入与预览。
- 公告范围以部门为单位，后端依据 `deptIds` 解析受众用户集合；权限控制通过菜单与角色赋予实现，不得在代码中硬编码。
- 公告的业务发布状态与通用启用状态分离：
  - `status` 字段为通用启用状态，引用 `STATUS` 字典；
  - `publish_status` 字段为业务发布状态，引用 `NOTICE_STATUS` 字典，其中：`0` 表示草稿，`1` 表示待审核，`2` 表示已发布。
- 仅当公告 `status` 为有效且 `publish_status` 为“已发布”时对普通用户可见；未登录用户不可见公告数据。
- 删除公告前无需进行额外的业务约束检查；如实际业务需要可在实现阶段补充限制。

##### 2.5.5.1 推送逻辑（WebSocket）

- 公告推送通过长连接进行，`action` 代码固定为 `notice`。
- 推送时机：
  - 管理端在编辑页主动触发 `push` 接口进行即时推送；
  - 或在创建/更新公告后由管理员手动推送。
- 推送目标：当前在线且属于目标部门集合（`deptIds`）内的用户会收到消息；离线用户可在下次登录后通过列表接口查询公告。
- 推送只包含近 50 条未读信息，如果用户需要更多公告，应通过列表接口查询。
- 服务端推送消息示例：

```jsonc
{
  "requestId": "",
  "action": "notice",
  "businessCode": 0,
  "isSuccess": true,
  "message": "有新的公告",
  "data": {
    "noticeId": "",
    "title": "系统维护通知",
    "desc": "简短描述",
    "importance": "2",
    "deptIds": ["uuid-1", "uuid-2"],
    "createdTime": "2025-11-13T09:00:00.000Z"
  },
  "timestamp": "2025-11-13T09:00:00.000Z",
  "errors": null
}
```

- 为了减轻 WS 服务器压力，公告推送不包含公告内容，用户需要查看公告详情时，应通过 RESTful API 获取完整内容。

##### 2.5.5.2 查询逻辑

公告列表的查询行为遵循通用规范，Ripple 仅补充与公告业务强相关的筛选字段：

- 模糊查询：`title`；
- 精确查询：`importance`、`status`、`publishStatus`；
- 多选：`deptIds`（目标范围至少包含其中任一部门的公告）；
- 时间范围：`createdTime`（开始-结束）。

组合规则与其他模块保持一致：除 `dept_ids` 在集合内采用 OR 逻辑外，不同字段之间默认采用 AND 组合。

## 3. 登录鉴权

### 3.1 登录和注册

#### 3.1.1 Request 和 Response

##### 3.1.1.1 LoginRequest

```jsonc
{
  "name": "", // 用户名
  "password": "", // 密码
  "captchaId": "", // 验证码 ID
  "captcha": "", // 验证码内容
  "loginType": 0 // 登录类型
}
```

##### 3.1.1.2 LoginResponse

```jsonc
{
  "userId": "",
  "userName": "",
  "permissionCodes": ["string"], // 用户权限编码列表（菜单按钮 permission_code）
  "systemRoles": ["root", "admin", "user"], // 用户角色编码列表
  "systemMenus": [], // 用户菜单树（仅包含当前用户有权限访问的菜单），结构参考菜单管理模块
  "accessToken": "", // JWT 访问令牌
  "refreshToken": "", // 刷新令牌
  "expiresIn": 0, // 访问令牌剩余有效期（秒）
  "refreshExpiresIn": 0 // 刷新令牌剩余有效期（秒）
}
```

##### 3.1.1.3 RegisterRequest

```jsonc
{
  "name": "", // 用户名（英文字母，唯一）
  "nickName": "", // 昵称
  "email": "", // 邮箱，注册时可选
  "phone": "", // 手机号，注册时可选（字符串）
  "password": "", // 密码，最少 12 位
  "captchaId": "", // 验证码 ID
  "captcha": "", // 验证码内容
  "loginType": 1 // 固定为 1，表示注册场景
}
```

##### 3.1.1.4 RefreshTokenRequest

```jsonc
{
  "refreshToken": "" // 刷新令牌
}
```

##### 3.1.1.5 RefreshTokenResponse

```jsonc
{
  "newAccessToken": "", // 新的 JWT 访问令牌
  "newRefreshToken": "", // 新的刷新令牌
  "expiresIn": 0, // 新访问令牌剩余有效期（秒）
  "refreshExpiresIn": 0 // 新刷新令牌剩余有效期（秒）
}
```

##### 3.1.1.6 CaptchaResponse

```jsonc
{
  "captchaId": "", // 验证码 ID（UUIDv7）
  "imageBase64": "", // 验证码图片 Base64 编码（data URL 或纯 Base64，根据前端需要约定）
  "expiresIn": 120 // 验证码有效期（秒）
}
```

#### 3.1.2 接口

| 接口名称 | 方法 | 路径           | 描述                                                |
| -------- | ---- | -------------- | --------------------------------------------------- |
| 登录     | POST | /auth/login    | 用户登录，成功后返回 JWT 及用户权限、菜单等信息     |
| 注册     | POST | /auth/register | 用户注册，仅创建普通用户                            |
| 刷新令牌 | POST | /auth/refresh  | 刷新访问令牌，使用 refreshToken 获取新的访问/刷新对 |
| 验证码   | GET  | /auth/captcha  | 获取登录/注册验证码                                 |
| 退出登录 | POST | /auth/logout   | 用户主动退出登录，主动失效当前会话                  |

> [!NOTE]
> 实际对外路由应结合模块前缀与版本号，例如 `/api/v1/auth/login`。内部实现中应按照《后端项目开发规范（通用）》在模块内定义路由前缀常量。

#### 3.1.3 业务规则

##### 3.1.3.1 登录规则

- `guest` 保留用户禁止手动登录，前后端均需校验：
  - 当 `name` 为 `guest` 时，无论密码是否正确，都直接返回业务错误。
- 登录接口必须校验验证码，验证码错误时直接返回业务错误，**不进入密码校验逻辑**，避免暴力攻击。
- 登录失败次数记录在 `Redis` 中，Key 规范：
  - `ripple:auth:login:fail:<userName>`
  - 每次登录失败时，失败次数加 1，并设置合理的过期时间（例如 30 分钟，具体在实现阶段确认）。
  - 当失败次数 ≥ 10 次时，锁定该用户名 15 分钟，在锁定期间：
    - 无论密码是否正确，均返回统一的“用户名或密码错误”提示。
    - 可以通过在 `Redis` 设置单独锁定 Key（如 `ripple:auth:login:lock:<userName>`）来实现。
  - 登录成功后，清除该用户的失败记录与锁定记录（如有）。
- 登录失败统一提示“用户名或密码错误”，不区分“用户不存在、密码错误、被锁定”，避免泄露用户存在性与安全状态。
- 账户状态校验：
  - 若用户 `status` 为无效（字典 `STATUS_DISABLED` 对应值），禁止登录，返回业务错误。
  - 系统保留用户 `is_system_reserved = true` 允许登录，但后续权限由角色/菜单控制。
- 设备/会话策略（基础版）：
  - 默认允许同一用户多终端多会话共存。
  - 每次登录成功后，都会生成新的 `sessionId` 并记录到在线用户模块所描述的 Redis 结构中。
  - 如未来需要“单设备登录”或“同一终端互斥登录”，可在登录逻辑中增加会话清理策略。
- 安全存储：
  - 密码使用 `argon2id` 加盐哈希存储（标准编码串），签名时避免泄露参数。
  - 登录成功后记录 `last_login_time` 和 `last_login_ip`（用于审计/风控）。

##### 3.1.3.2 注册规则

- 注册接口为开放接口，允许未登录用户（`guest`）访问，但应受到验证码与频率限制保护。
- 禁止通过注册接口创建 `root` 与 `guest` 用户：
  - 若注册请求中的 `name` 为 `root` 或 `guest`，直接返回业务错误。
- 注册成功后：
  - 新用户默认分配普通用户角色 `user`，不授予 `admin` 或 `root` 角色。
  - 不自动登录，注册成功后仍需显式登录，登录逻辑统一。
- 用户名必须唯一，且仅允许英文字母（或字母数字），具体规则在实现时通过后端校验+数据库唯一索引双重保障；`LOWER(name)`。
- 密码规则：
  - 长度至少 12 位；必须在前后端同时校验。
- 邮箱和手机号：
  - 可选字段，但如填写则须唯一（通过部分唯一索引保障）。
  - 格式在前端和后端均需校验，后端校验失败视为参数错误。

##### 3.1.3.3 刷新令牌规则

- 刷新令牌接口 `/auth/refresh` 仅验证 `refreshToken` 的有效性，不依赖当前访问令牌是否过期。
- `guest` 用户不需要 Token，因此禁止访问 `/auth/refresh` 接口：
  - 如请求中解析出的用户为 `guest`，直接返回业务错误。
- 刷新成功后行为：
  - 返回新的访问令牌 `newAccessToken` 与新的刷新令牌 `newRefreshToken`。
  - **旧的刷新令牌立即失效**，必须加入黑名单或存储状态为“已使用”，防止重放攻击（黑名单 Key TTL 设置为该 Token 剩余有效期）。
- 刷新令牌应包含独立的唯一标识（`jti`），方便在 Redis 中进行黑名单/状态管理：
  - 推荐 Key 结构：`ripple:auth:refresh:blacklist:<jti>` 或 `ripple:auth:refresh:used:<jti>`。
- 刷新令牌的有效期应明显长于访问令牌，具体数值在实现阶段由配置决定：
  - 例如：访问令牌 15 分钟，刷新令牌 7 天。
- 刷新失败统一返回明确的业务错误描述，不应暴露具体内部状态（如“黑名单命中”等实现细节）。

##### 3.1.3.4 验证码规则

- 验证码接口 `/auth/captcha` 接受 `loginType` 参数，允许的值为 `0`、`1`：
  - `0`：登录
  - `1`：注册
- 验证码生成规则：
  - 生成 `captchaId`（UUIDv7）与对应的验证码内容（例如 4~6 位数字或字母）。
  - 将验证码内容存入 Redis，Key 示例：
    - `ripple:auth:captcha:login:<captchaId>`（对于 `loginType=0`）
    - `ripple:auth:captcha:register:<captchaId>`（对于 `loginType=1`）
  - 设置有限的有效期（例如 120 秒），过期后不可使用。
- 前后端交互：
  - 前端调用 `/auth/captcha`，获得 `captchaId` + `imageBase64`；
  - 登录/注册 Request 中同时提交 `captchaId` 和 `captcha`。
- 校验行为：
  - 验证码使用一次后立即失效，无论校验成功与否。
  - 验证码错误时，不返回“验证码错误”的明确提示，可采用泛化提示（由实现阶段决定）。
- 防刷策略：
  - 验证码请求频率应受限（例如同一 IP / 同一客户端在短时间内的请求数），以防止验证码接口被滥用。

##### 3.1.3.5 退出登录规则

- 退出登录接口 `/auth/logout` 需要在鉴权后调用，仅对已登录用户有效。
- 退出登录行为：
  - 清理当前会话相关的在线用户记录：
    - 删除 `ripple:auth:online:session:<sessionId>`。
    - 从 `ripple:auth:online:user:<userId>` 中移除 `sessionId`，必要时删除空的集合。
  - 将当前访问令牌的 `jti` 加入访问令牌黑名单，确保在剩余有效期内不能再被使用。
  - 如当前会话存在 WebSocket 连接，应通知对应连接断开（可作为实现阶段的优化）。
- 不要求在退出时强制失效所有会话，仅当前会话即可；如需“退出所有设备”，可在用户模块提供额外接口，并复用在线用户模块的踢下线能力。

### 3.2 鉴权

#### 3.2.1 业务规则

- 未登录用户默认视为 `guest` 用户：
  - 在中间件层，如未携带有效 Token，应注入一个虚拟的 `guest` 身份（仅具备 `visitor` 角色的权限），不会在数据库中创建真实用户记录，可采用空或特殊 ID 作为 `userId`；
  - 登录、注册、获取验证码等接口显式允许 `guest` 访问。
- 采用基于角色的访问控制（RBAC）模型：
  - 每个用户可以拥有多个角色（如 `root`、`admin`、`user`、`visitor`）。
  - 每个角色与菜单项（包括按钮级别）建立多对多关联。
  - 每个菜单项（尤其是按钮）对应具体的权限点，其数据库字段为 `permission_code`，例如：
    - `dashboard:system:menu:create`
    - `dashboard:user:manage:delete`
- API 权限模型：
  - 每个受保护的 API 方法必须映射到唯一的权限点（权限编码），权限点名称推荐与方法语义一致或与菜单的 `permission_code` 保持一致。
  - 查询类接口权限：
    - 查看已删除数据的能力被视为一项特殊权限，但通过独立接口实现（不再通过 `mode` 参数切换）。
    - 若模块提供 `findWithDeleted` / `findWithDeletedAll` / `findOnlyDeleted` / `findOnlyDeletedAll` 等接口，应在 Casbin 策略中为每个接口配置独立权限点，命名规则与菜单 `permission_code` 保持一致。
    - `findAll` 以及 `findWithDeletedAll` / `findOnlyDeletedAll` 等“不分页全量”接口，由于可能返回大量数据，必须绑定单独权限点，防止被滥用。
  - 软删除相关权限：
    - `remove`/`removeMany` 与 `restore`/`restoreMany` 对应独立权限点，不能与 `delete`/`deleteMany` 混用。
- 鉴权实现方式：
  - 基于 `Casbin` 进行策略管理：
    - 将“角色-资源-操作”映射为 `Casbin` 策略规则；
    - 将用户当前拥有角色列表映射为主体，在中间件中完成“是否允许访问当前路由”的判定。
  - 与菜单联动：
    - 按钮级别的菜单项应持有权限编码（`permission_code`），后端根据菜单配置生成或维护 `Casbin` 策略；避免在代码中硬编码权限点。
- Token 设计：
  - 使用 `JWT` 作为访问令牌与刷新令牌的基础格式，包含但不限于以下 Claim：
    - `userId`：用户 ID；
    - `userName`：用户名；
    - `roles`：角色编码数组；
    - `jti`：Token 唯一标识；
    - `sessionId`：会话编号（可选，便于与在线用户记录关联）；
    - `exp`：过期时间（UTC 时间戳）；
    - `kid`：密钥标识（便于轮换）；
  - 访问令牌与刷新令牌需使用不同的 Claim/受众以便区分两类 Token。
  - 所有时间 Claim 必须使用 UTC 时间，与数据库 `timestamptz` 字段保持一致。
- 安全相关补充：
  - 所有密码字段在任何日志、响应、错误信息中均不得以明文或可逆形式出现。
  - 认证/鉴权失败时，统一返回规范化的业务错误码（`2xxx` 段），具体分配在实现阶段细化。
  - 所有与登录、注册、Token 刷新等敏感接口，都应结合 IP/设备信息与速率限制策略，防止暴力破解与滥用。
  - Casbin 模型独立放置。

#### 3.2.2 中间件与请求上下文

为简化各模块的权限检查与审计，鉴权中间件应在成功解析并验证 Token 后，将以下信息注入请求上下文（例如 Gin 的 `Context`）：

- `requestId`：来自请求头 `X-Request-ID`，若不存在则由网关或服务端生成。
- `userId`：当前用户的 ID；未登录时为 `guest` 用户的虚拟 ID（可为空或特殊值）。
- `userName`：当前用户名。
- `roles`：当前用户角色编码数组。
- `permissionCodes`：当前会话内可用权限编码集合（可选，视性能策略决定是否预先加载）。
- `sessionId`：当前会话编号，用于在线用户、WebSocket、审计日志关联。

各业务模块在需要进行细粒度判断时（例如“是否允许操作自己的资源”）可通过上下文获取当前用户 ID 与角色信息，避免重复解析 Token。
