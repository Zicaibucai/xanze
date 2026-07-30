# Xanze 阶段 2 执行提示词：AI 语义关系构建器

把本文件正文交给负责开发 Xanze 的 AI。一次只执行本阶段，不要附加其他产品需求。

---

你现在继续开发：

`/Users/apple/Documents/中建实习/第三周/xanze`

本轮唯一目标是交付一个可以真实运行和验收的“AI 语义关系构建器”纵向闭环。

## 一、开始闸门

开始编码前必须：

1. 阅读：
   - `README.md`
   - `PROGRESS.md`
   - `docs/PRODUCT_SPEC.md`
   - `docs/ARCHITECTURE.md`
   - `docs/DECISIONS.md`
   - `THIRD_PARTY_NOTICES.md`
2. 检查 Git 状态，保留现有有效修改，不覆盖用户文件。
3. 等待正在运行的阶段 1 验收结束。
4. 执行 `bash scripts/acceptance/phase-01.sh`，确认返回 0。
5. 确认阶段 1 所有有效文件已加入 Git，并存在清晰的阶段 1 基线提交。

如果阶段 1 失败，只修复阶段 1 并停止。本轮不得带病开发阶段 2。

## 二、产品边界

本阶段实现：

> 导入只读 CSV/XLSX 快照，分析字段和记录，自动发现候选关系，展示统计证据和异常，
> 由管理员接受、修改或拒绝，最终将已确认关系写入 Xanze 的版本化关系模型。

“写关系”只表示写入 Xanze 自身的：

- RelationProposal；
- SemanticRelation；
- RecordRelation；
- 关系版本、证据和审计。

绝对不能修改：

- 原始 CSV/XLSX；
- 外部源数据库；
- 数据集中的源单元格；
- 尚未建设的业务对象字段。

本阶段禁止实现：

- AI 看板和 DashboardSpec；
- 动态表单；
- ValueBinding 业务字段回填；
- 工作流和 Agent 流程节点；
- OA、CRM、ERP、HRM；
- 外部数据库连接器；
- 多 Agent 画布；
- 与本阶段无关的空菜单和占位页面。

AI 关系构建器与 AI 只读看板生成器是两个独立功能。不得把图表生成混入本阶段。

## 三、必须完成的用户闭环

管理员应能完成：

1. 打开“关系构建器”。
2. 上传 CSV 或 XLSX。
3. 系统创建不可变 DatasetVersion，并显示内容哈希。
4. 系统展示工作表、字段类型、空值率、唯一率、分布、候选主键和异常值。
5. 点击“发现关系”，创建可追踪的发现任务。
6. 查看字段级和记录级 RelationProposal。
7. 每个候选显示关系类型、源、目标、匹配率、置信度、正例、反例和影响范围。
8. 接受、修改或拒绝候选关系。
9. 接受外键关系后，系统生成对应的 RecordRelation。
10. 查看可交互关系图，点击边查看证据和版本。
11. 校验并发布关系版本 V1。
12. 修改已发布关系时创建 V2 草稿，不能原地改写 V1。
13. 重启 Core 和 Agent 后，数据集元数据、画像、候选、正式关系和发布版本仍存在。

普通员工不能上传数据集、运行发现任务、确认或发布关系。

## 四、演示数据

创建真实验收文件：

`examples/phase-02/project-risk-relations.xlsx`

至少包含两个工作表和 50 条以上风险记录。

`Projects` 至少包含：

- project_code
- project_name
- department_code
- manager

`Risks` 至少包含：

- risk_id
- project_code
- risk_description
- probability
- impact
- risk_score
- risk_level
- responsibility_department
- created_at

数据中应存在可以验证的关系：

1. `Projects.project_code -> Risks.project_code` 候选外键；
2. `probability * impact -> risk_score` 公式；
3. `risk_score -> risk_level` 条件分类；
4. `project_code -> responsibility_department` 函数依赖或查找关系；
5. 风险记录与项目记录之间的 `BELONGS_TO` RecordRelation。

必须故意保留少量异常数据，使 UI 能显示反例和匹配率，而不是构造全部完美的数据。

验收预期值必须来自固定 Fixture，不得在测试中临时伪造接口响应。

## 五、核心数据模型

通过 Flyway 新增正式表结构，至少覆盖：

- Dataset
- DatasetVersion
- DatasetSheet
- DatasetColumn
- DataProfile
- RelationDiscoveryJob
- RelationProposal
- RelationEvidence
- SemanticRelation
- RecordRelation
- RelationRelease
- AuditEvent

要求：

- 使用稳定 ID；
- 所有记录具备租户或当前单租户隔离预留；
- 记录创建人、更新时间和版本；
- JSON 字段必须有服务端 Schema 校验；
- 枚举状态不能依靠任意字符串；
- 发布版本不可变；
- 数据集版本以 SHA-256 内容哈希标识；
- RecordRelation 使用数据集版本、工作表和稳定行引用，不复制或修改源行。

建议状态机：

- DatasetVersion：`UPLOADED -> PROFILING -> PROFILED -> FAILED`
- DiscoveryJob：`PENDING -> RUNNING -> SUCCEEDED | FAILED`
- RelationProposal：`PROPOSED -> ACCEPTED | REJECTED -> SUPERSEDED`
- SemanticRelation：`DRAFT -> VALIDATED -> PUBLISHED -> DEPRECATED`

## 六、阶段 2A：确定性关系发现

必须先完成 2A 并通过测试，才能开始模型接入。

Python Agent 服务实现可重复的数据分析，第一版至少支持：

- 字段类型推断；
- 空值率和唯一率；
- 候选主键；
- 数值范围和分类分布；
- 精确或高匹配率公式发现；
- 函数依赖发现；
- 跨工作表候选外键发现；
- 明确条件分类关系发现；
- 已确认外键对应的 RecordRelation 生成。

每条候选必须返回：

- 已检查行数；
- 匹配行数；
- 匹配率；
- 正例；
- 反例；
- 空值数量；
- 算法名称和版本；
- 确定性置信度；
- 不确定性说明。

算法结果必须可重复。相同数据集版本和算法版本应得到相同结果。

禁止把字段名相似度或相关系数单独当作已确认业务关系。

## 七、阶段 2B：模型辅助语义解释

阶段 2A 全部通过后，增加 Provider 抽象和一个兼容 OpenAI API 协议的真实实现，
便于接入经过配置的企业模型。

模型配置只能来自环境变量，例如：

- `XANZE_MODEL_BASE_URL`
- `XANZE_MODEL_API_KEY`
- `XANZE_MODEL_NAME`

要求：

- Core 只把权限允许、经过裁剪和脱敏的 Schema、画像摘要和有限样本发送给 Agent；
- Agent 使用 Pydantic/JSON Schema 约束模型输出；
- 模型只能补充业务名称、解释、候选条件和不确定性；
- 模型不能篡改确定性匹配率；
- Core 再次验证所有字段引用、类型、表达式和权限；
- 保存 provider、model、prompt version、request ID 和响应摘要；
- 不记录 API Key；
- 未配置模型时返回 `DETERMINISTIC_ONLY`；
- UI 明确显示“模型语义解释未配置”，不能显示伪造的 AI 结果；
- 测试可以使用 Provider Stub 验证错误、超时和 Schema 契约，但运行产品不能用 Stub 冒充真实模型。

可增加自然语言关系设计入口，例如：

“风险分值等于发生概率乘以影响程度，风险分值大于等于 16 为高风险。”

Agent 必须把它转换成 RelationProposal，仍需证据校验和人工确认，不能直接发布。

## 八、服务职责

Core：

- 数据集和关系元数据的唯一写入者；
- 权限、状态机、幂等、版本、发布和审计；
- 文件校验、不可变版本登记和内容哈希；
- 对 Agent 输入进行权限裁剪；
- 对 Agent 输出进行二次验证；
- 关系接受、拒绝、编辑、校验和发布。

Agent：

- 安全解析 CSV/XLSX；
- 数据画像；
- 确定性关系发现；
- 可选模型语义解释；
- 返回结构化结果；
- 不持有 OceanBase 业务账号；
- 不直接发布或写入关系。

Web：

- 数据集列表与上传；
- 数据画像；
- 候选关系和证据；
- 接受、修改、拒绝；
- 关系图；
- 版本、发布和审计结果。

## 九、安全要求

- 上传只允许 `.csv`、`.xlsx` 和白名单 MIME；
- 设定文件大小、行数、列数、工作表数、解析时间和内存上限；
- 拒绝路径穿越、压缩炸弹和伪造扩展名；
- XLSX 只读取值，不能执行宏、外部链接或嵌入脚本；
- 文件使用内容哈希和受控路径保存；
- Agent 内部业务接口不直接暴露给浏览器；
- 管理 API 执行服务端管理员权限；
- 表达式使用安全 AST 或白名单解释器，禁止 `eval` 和任意代码；
- 发布前执行类型检查、字段存在性检查、循环依赖检查和影响分析；
- 所有接受、修改、拒绝、发布和模型调用写审计事件。

## 十、前端要求

沿用现有 Xanze 视觉系统，不复制其他项目页面。

至少提供：

- 数据集列表；
- 上传向导；
- 数据画像页面；
- 候选关系列表；
- 证据和异常样本抽屉；
- 字段关系图和记录关系查看；
- 关系编辑与校验；
- 发布版本页面。

关系图中的节点表示数据集、工作表或字段，边表示候选或正式关系。
颜色和线型必须区分候选、已接受、已发布和异常关系，并提供图例。

不得生成看板 KPI、柱状图、折线图或 DashboardSpec 页面。

## 十一、API 与错误处理

提供清晰的 REST API 和 OpenAPI，至少覆盖：

- 数据集上传、列表、详情和版本；
- 画像任务和结果；
- 关系发现任务和状态；
- 候选关系查询、接受、修改和拒绝；
- 正式关系查询和校验；
- RecordRelation 查询；
- 关系版本发布和历史；
- 能力状态，例如模型是否配置。

所有异步任务可轮询，失败时提供稳定错误码，不向用户泄露堆栈、路径、密钥或原始模型响应。
继续沿用 `X-Request-ID` 和统一错误结构。

## 十二、自动化验收

创建：

`scripts/acceptance/phase-02.sh`

脚本必须先运行阶段 1 回归，再验证：

1. CSV 和 XLSX 的合法上传；
2. 非法文件、超限文件和普通员工上传被拒绝；
3. 原始文件上传前后 SHA-256 不变化；
4. 工程风险 Fixture 的画像结果正确；
5. 能发现预期公式、函数依赖、候选外键和条件关系；
6. 每条候选包含匹配率、正例和反例；
7. 接受外键后生成正确数量的 RecordRelation；
8. 拒绝的候选不能进入正式关系；
9. 关系编辑执行类型和循环校验；
10. 发布 V1 后不可原地修改；
11. V2 草稿不影响 V1；
12. Core 和 Agent 重启后数据仍存在；
13. 未配置模型时正确显示 `DETERMINISTIC_ONLY`；
14. Provider 契约、超时、非法 Schema 和脱敏测试通过；
15. Playwright 完成上传、发现、确认、关系图和发布用户旅程；
16. 页面和接口中不存在 AI 看板占位实现；
17. 阶段 1 全部回归通过。

至少提供：

- Java 单元和集成测试；
- Python 画像和关系算法测试；
- 权限与安全测试；
- 前端组件测试或类型检查；
- Playwright 端到端测试；
- 固定示例数据；
- 可重复验收脚本。

## 十三、实施顺序

严格按顺序：

1. 数据模型和 Flyway；
2. 不可变数据集导入；
3. DataProfile；
4. 确定性 RelationProposal；
5. Core 状态机、证据和权限；
6. 接受、拒绝、编辑和发布；
7. RecordRelation；
8. 前端完整用户路径；
9. 阶段 2A 自动化验收；
10. Provider 抽象和模型辅助；
11. 阶段 2B 测试；
12. 完整阶段 1、阶段 2 回归；
13. 文档、Git 提交和停止。

任何步骤没有真实数据闭环，不得通过创建后续空页面掩盖。

## 十四、完成定义

只有同时满足以下条件才能宣布阶段 2 完成：

- 数据来自真实上传并持久化；
- 画像和关系证据由真实算法计算；
- 候选关系可以确认并写入 Xanze 关系模型；
- RecordRelation 可以追溯到只读源行；
- 原始数据没有被修改；
- 模型未配置时诚实降级；
- 关系版本可发布且不可变；
- 权限、审计、重启持久化和端到端测试通过；
- `scripts/acceptance/phase-01.sh` 和 `scripts/acceptance/phase-02.sh` 均返回 0；
- README、PROGRESS、ARCHITECTURE、DECISIONS 和第三方声明已更新；
- 所有有效文件加入 Git 并创建阶段 2 提交。

## 十五、完成后的输出

完成后停止，不要进入看板、表单或流程阶段。只报告：

1. 实际完成的用户闭环；
2. 数据模型和 API；
3. 确定性算法及证据；
4. 模型配置方式和当前能力状态；
5. 安全与权限结果；
6. 实际执行的测试命令和结果；
7. 访问地址和演示步骤；
8. 阶段 1、阶段 2 验收结果；
9. Git commit SHA；
10. 已知限制。

不允许把未执行、跳过或失败的测试写成通过。
