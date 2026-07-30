# Xanze 开发进度

更新日期：2026-07-30

## 当前结论

项目处于“阶段 1：企业基础底座”的最终验收期。阶段 2 产品和架构范围已经确认，
但尚未开始实现。未通过阶段 1 完整验收并创建基线提交之前，不进入阶段 2。

## 已有实现

### Core

- Spring Boot 应用和统一错误响应；
- JWT HttpOnly Cookie 登录；
- 用户、角色、部门及服务端管理员权限；
- OceanBase 数据持久化和 Flyway V1；
- Redis、健康检查和 OpenAPI；
- 开发环境幂等 Seed。

### Web

- React 管理端和员工门户；
- 登录及认证守卫；
- 用户、角色、部门真实管理页面；
- 同源 Nginx 入口。

### Agent

- FastAPI 服务骨架；
- request ID 和统一错误格式；
- 健康检查；
- 尚未实现关系发现、模型调用或业务工具。

### 工程化

- Docker Compose 包含 OceanBase、Redis、Core、Agent 和 Web；
- Java、Python、Web 及 Playwright 测试入口；
- `scripts/acceptance/phase-01.sh` 阶段验收脚本；
- README 和第三方声明。

## 阶段 1 验收状态

2026-07-30 检查时，阶段 1 验收脚本正在真实执行，OceanBase、Redis、Core、Agent 和 Web
容器均已进入 healthy 状态。最终结果、测试证据和提交 SHA 仍需以脚本结束输出为准。

阶段 1 完成条件：

- `scripts/acceptance/phase-01.sh` 返回 0；
- 管理员和员工真实登录通过；
- 后端越权访问返回 403；
- 创建的员工在数据库和 Core 重启后仍存在；
- Java、Agent 和 Playwright 测试通过；
- 所有有效文件加入 Git；
- 创建阶段 1 基线提交并记录 SHA。

## 已确认的产品方向

Xanze 是 AI 原生企业业务建模、运行与分析平台，不是带聊天框的 OA。

两个容易混淆但必须分开的能力：

1. AI 语义关系构建器：发现列、记录和单元格关系，确认后写入 Xanze 关系模型；
2. AI 只读看板生成器：只读取数据和已确认语义，生成指标和 DashboardSpec，不写关系或源数据。

## 下一阶段

阶段 2 只实现 AI 语义关系构建器：

- CSV/XLSX 不可变只读快照；
- DataProfile；
- 确定性关系发现；
- RelationProposal 及证据；
- 接受、修改和拒绝；
- SemanticRelation 和 RecordRelation；
- 关系图、版本、发布和审计；
- 可选真实模型语义解释；
- 自动化验收。

阶段 2 明确不实现：

- AI 看板；
- 动态表单；
- ValueBinding 写业务字段；
- 工作流；
- OA、CRM、ERP、HRM；
- 外部数据库连接器；
- 多 Agent 画布。

第二阶段执行提示词见：

`docs/prompts/PHASE_02_SEMANTIC_RELATION_BUILDER.md`

## 已知事项

- 当前仓库只有初始提交，大量阶段 1 文件仍未进入 Git 历史；
- Agent 当前只有基础服务能力；
- 阶段 1 完整验收结果需要在运行结束后回填；
- 产品规格原始长提示词已归档到 `docs/archive/INITIAL_MASTER_PROMPT.md`。
