# Xanze

Xanze 是 AI 原生企业业务建模、运行与分析平台。OA、CRM、ERP、HRM 等属于后续基于
统一业务语义、关系、流程、Agent 和权限能力构建的解决方案，而不是相互独立的系统内核。

本仓库当前处于“阶段 1：企业基础底座”的最终验收期，只包含真实身份数据、认证授权、
管理员基础管理和员工门户。产品、架构和进度分别见：

- [产品规格](docs/PRODUCT_SPEC.md)
- [架构说明](docs/ARCHITECTURE.md)
- [架构决策](docs/DECISIONS.md)
- [开发进度](PROGRESS.md)

## 从空环境启动

前置条件：

- Docker Desktop 或兼容的 Docker Engine，支持 `docker compose`
- 为 Docker 分配至少 8 GB 内存、2 个 CPU 核心
- 首次启动可以拉取约数 GB 的镜像和依赖

真实启动命令：

```bash
cp .env.example .env
docker compose up --build
```

OceanBase 首次初始化通常是最慢的一步。终端中所有服务健康后，打开：

- Web 登录页：<http://localhost:13080>
- Web 健康检查：<http://localhost:13080/health>
- Core 健康检查：<http://localhost:13080/health/core>
- Core OpenAPI：<http://localhost:13080/swagger-ui.html>
- Agent 健康检查：<http://localhost:13080/health/agent>

开发 Seed 账号来自 `.env`，示例值为：

| 身份 | 用户名变量 | 密码变量 | 默认去向 |
| --- | --- | --- | --- |
| 管理员 | `XANZE_DEV_ADMIN_USERNAME` | `XANZE_DEV_ADMIN_PASSWORD` | `/admin/users` |
| 普通员工 | `XANZE_DEV_EMPLOYEE_USERNAME` | `XANZE_DEV_EMPLOYEE_PASSWORD` | `/portal` |

`.env.example` 中的密码只用于本地开发。部署到其他环境前必须更换 JWT 密钥和所有密码，并关闭 `XANZE_DEV_SEED_ENABLED`。

## 阶段 1 用户旅程

1. 管理员登录后，在“用户管理”创建普通员工，并选择真实角色与部门。
2. 管理员可查看和创建角色、部门；所有列表与写入都经过 Core API 和 OceanBase。
3. 普通员工登录后进入员工门户，看到自己的账号、角色与部门。
4. 普通员工在浏览器中直接请求 `/api/admin/users` 时，Spring Security 返回结构统一的 `403`。
5. 执行 `docker compose restart core` 后，新员工及其权限仍存在。

登录使用 `HttpOnly`、`SameSite=Strict` 的 JWT Cookie；前端拿不到 Token。Core 对 `/api/admin/**` 执行 `ROLE_ADMIN` 服务端校验，前端路由限制只负责用户体验，不作为安全边界。

## 一键验收

```bash
bash scripts/acceptance/phase-01.sh
```

脚本会：

- 从镜像构建并启动全部服务；
- 验证 OceanBase、Redis、Core、Agent、Web 和 OpenAPI 健康；
- 运行 Java 权限越权测试与 Python 健康测试；
- 通过管理员 API 创建真实员工；
- 依次重启 OceanBase 与 Core，验证用户、角色和部门持久化；
- 运行 Playwright 管理员/员工登录测试，并再次验证员工访问管理 API 得到 `403`。

任一步失败都会因 `set -Eeuo pipefail` 返回非零状态码。验收成功后服务保持运行，便于手工检查。

## 数据持久化与重置

OceanBase 使用官方 CE 镜像的 `slim` 单节点模式，派生镜像仅负责把快速启动数据目录接入命名卷，并将开发资源设为 4 GB 内存、4 个逻辑 CPU。OceanBase 的真实存储目录和 Redis AOF 均使用 Docker 命名卷；普通停止或容器重建不会删除数据：

```bash
docker compose down
docker compose up --build
```

仅当明确需要清空开发数据时执行：

```bash
docker compose down --volumes
```

该命令会永久删除本项目 Compose 创建的 OceanBase 与 Redis 卷。

## 目录结构

```text
xanze/
├── apps/web/                     React 19 + TypeScript + Vite
├── services/core/                Java 21 + Spring Boot + MyBatis Plus
├── services/agent/               Python 3.13 + FastAPI
├── packages/design-tokens/       前端共享设计变量
├── infra/nginx/                  同源 API 反向代理与 SPA 配置
├── infra/oceanbase/init/         OceanBase 首次建库
├── scripts/acceptance/           阶段 1 自动验收
├── docs/PRODUCT_SPEC.md          完整产品需求基线
├── docs/ARCHITECTURE.md          当前与目标架构
├── docs/DECISIONS.md             已确认的跨阶段决策
├── docs/prompts/                 分阶段执行提示词
├── PROGRESS.md                   真实开发和验收状态
├── docker-compose.yml
├── .env.example
├── Makefile
└── THIRD_PARTY_NOTICES.md
```

数据库表结构由 `services/core/src/main/resources/db/migration` 下的 Flyway 迁移统一管理。开发 Seed 由 Core 启动器幂等执行，不依赖前端 Mock。

## 本地开发与单项检查

前端：

```bash
pnpm install
pnpm --filter @xanze/web build
pnpm --filter @xanze/web dev
```

Core（需要 Java 21 和 Maven）：

```bash
cd services/core
mvn test
```

Agent 测试推荐使用与正式服务相同的 Python 3.13 容器：

```bash
docker compose --profile test run --rm agent-test
```

也可以使用 Makefile：

```bash
make up
make test
make acceptance
```

## 统一错误格式

Core 与 Agent 错误均携带响应头 `X-Request-ID`，JSON 字段采用 `snake_case`：

```json
{
  "request_id": "c936eabc-2950-4a48-a37b-999fa830664d",
  "code": "FORBIDDEN",
  "message": "无权访问该资源",
  "timestamp": "2026-07-30T03:00:00Z"
}
```

调用方可传入合法的 `X-Request-ID`；未提供时服务会生成 UUID。

## 阶段边界

当前明确没有实现低代码表单、工作流、Agent 调用、OA、CRM、ERP 或 HRM，也没有创建对应的空菜单和占位页面。下一阶段尚未开始。

已经确认但尚未实现的下一步是“阶段 2：AI 语义关系构建器”，执行提示词见
[PHASE_02_SEMANTIC_RELATION_BUILDER.md](docs/prompts/PHASE_02_SEMANTIC_RELATION_BUILDER.md)。

AI 语义关系构建器与 AI 只读看板生成器是两个独立功能：阶段 2 负责发现并写入
Xanze 关系元数据；后续阶段的看板生成器只读数据并生成 DashboardSpec，不写关系或源数据。
