# 架构设计文档

## 系统架构概览

门外审堂采用 Tauri 2.0 桌面应用架构，前后端分离设计。

```
┌─────────────────────────────────────────────────────────┐
│                    前端层 (React + TypeScript)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ 阅读页   │  │ 讨论页   │  │ 复盘页   │  │个人中心│ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │              状态管理层 (store.ts)                 │  │
│  │  - 用户上下文、每日进度、术语记录、对话历史       │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Tauri Bridge 层 (tauriBridge.ts)        │  │
│  │  - invoke 调用 Rust 后端命令                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    后端层 (Rust + Tauri)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │              main.rs - Tauri 命令处理器            │  │
│  │  - init_database                                  │  │
│  │  - get_user_context / save_user_context          │  │
│  │  - get_daily_progress / update_daily_progress    │  │
│  │  - save_term_record / get_term_records           │  │
│  │  - add_chat_message / get_chat_history           │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │              SQLite 数据库层 (rusqlite)            │  │
│  │  - 11 张数据表                                    │  │
│  │  - 本地持久化存储                                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    外部服务层                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Coze Agent API (文渊先生 AI)            │  │
│  │  - 讨论点评、复盘反馈、追问回答                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 分层设计

### 1. 页面层 (pages/)

负责 UI 渲染和用户交互：

- **OnboardingPage**: 首次使用引导，收集用户项目背景
- **ReadingPage**: 阅读材料展示，术语高亮与弹窗
- **DiscussionPage**: 讨论问题回答，AI 导师点评
- **ReflectionPage**: 复盘反思，AI 反馈与评分
- **ProfilePage**: 个人中心，学习统计

### 2. 状态管理层 (lib/store.ts)

全局状态管理，采用单例模式：

```typescript
globalState = {
  userContext: UserContext | null,      // 用户项目背景
  currentDay: number,                  // 当前学习天数
  dailyProgress: DailyProgress[],      // 每日进度
  chatHistory: ChatMessage[],          // 对话历史
  terms: Term[],                       // 术语学习记录
  initialized: boolean,                // 初始化标记
}
```

状态更新流程：
1. 页面调用 `useAppStore()` 获取状态和 action
2. action 执行状态更新（setState）
3. action 调用 tauriBridge 持久化到数据库
4. 监听器通知所有订阅组件刷新

### 3. 数据访问层 (lib/tauriBridge.ts)

封装 Tauri invoke 调用，提供类型安全的 API：

```typescript
// 数据库初始化
initDatabase(): Promise<void>

// 用户上下文
getUserContext(): Promise<UserContextData | null>
saveUserContext(projectName, vendorName, painPoint): Promise<void>

// 每日进度
getDailyProgress(dayNum): Promise<DailyProgressData | null>
getAllDailyProgress(): Promise<DailyProgressData[]>
updateDailyProgress(dayNum, reading, discussion, reflection): Promise<void>

// 术语记录
saveTermRecord(termId, termName, viewCount, bookmarked, mastered): Promise<void>
getTermRecords(): Promise<TermRecordData[]>

// 对话历史
addChatMessage(dayNum, role, content): Promise<void>
getChatHistory(dayNum): Promise<ChatMessageData[]>
```

### 4. 业务逻辑层 (lib/mentorApi.ts)

对接 Coze Agent API，处理 AI 导师交互：

```typescript
// 请求类型
DiscussionRequest    // 讨论点评
ReflectionRequest    // 复盘反馈
FollowUpRequest      // 追问回答

// 响应结构
MentorResponse {
  content: string,              // Markdown 格式回复
  scores: MentorScores | null,  // 评分（讨论/复盘）
  follow_up_question: string | null  // 追问
}
```

Prompt 模板渲染：
- 根据用户项目背景个性化点评
- 结合当日学习内容定制问题
- 要求 JSON 格式输出，便于解析

### 5. 后端层 (src-tauri/main.rs)

Rust 实现的 Tauri 命令：

```rust
#[tauri::command]
fn init_database() -> Result<(), String>

#[tauri::command]
fn get_user_context() -> Result<Option<String>, String>

#[tauri::command]
fn save_user_context(project_name, vendor_name, pain_point) -> Result<(), String>

#[tauri::command]
fn get_daily_progress(day_num: i32) -> Result<Option<String>, String>

#[tauri::command]
fn get_all_daily_progress() -> Result<String, String>

#[tauri::command]
fn update_daily_progress(day_num, reading_completed, discussion_completed, reflection_completed) -> Result<(), String>

#[tauri::command]
fn save_term_record(term_id, term_name, view_count, bookmarked, mastered) -> Result<(), String>

#[tauri::command]
fn get_term_records() -> Result<String, String>

#[tauri::command]
fn add_chat_message(day_num, role, content) -> Result<(), String>

#[tauri::command]
fn get_chat_history(day_num: i32) -> Result<String, String>
```

数据库连接：
- 使用 rusqlite 连接 SQLite
- 数据库文件位置：`app_data_dir()/menwai_shentang.db`
- 自动创建表结构（schema.sql）

## 数据流

### 初始化流程

```
App 启动
  ↓
initializeStore()
  ↓
bridge.initDatabase() → Rust: init_database()
  ↓
并行加载：
  - bridge.getUserContext()
  - bridge.getAllDailyProgress()
  - bridge.getTermRecords()
  ↓
计算 currentDay（找到第一个未完成的 day）
  ↓
setState({ initialized: true, ... })
  ↓
渲染页面
```

### 阅读页数据流

```
用户点击术语
  ↓
handleTermClick()
  ↓
updateTerm({ viewCount: +1 })
  ↓
setState({ terms: [...] })
  ↓
bridge.saveTermRecord() → Rust: save_term_record()
  ↓
SQLite UPDATE/INSERT term_learning_record
```

### 讨论页数据流

```
用户提交答案
  ↓
handleSubmit()
  ↓
addChatMessage() × N（保存用户回答）
  ↓
requestMentor({ type: "discussion", ... })
  ↓
renderDiscussionPrompt() → 生成 Prompt
  ↓
callCozeAgent(prompt) → HTTP POST Coze API
  ↓
parseMentorResponse() → 解析 JSON
  ↓
addChatMessage()（保存导师回复）
  ↓
updateProgress({ discussionCompleted: true })
  ↓
bridge.updateDailyProgress() → Rust: update_daily_progress()
```

## 关键设计决策

### 1. 为什么选择 Tauri 2.0？

- **轻量级**：相比 Electron，包体积更小（< 10MB vs > 100MB）
- **安全性**：Rust 后端，内存安全
- **性能**：原生性能，SQLite 操作更快
- **跨平台**：支持 Windows、macOS、Linux

### 2. 为什么用 SQLite 而不是云数据库？

- **离线优先**：学习场景需要离线支持
- **数据隐私**：用户学习数据留在本地
- **简单部署**：无需后端服务器
- **性能足够**：单用户场景，SQLite 性能绰绰有余

### 3. 为什么状态管理不用 Redux/Zustand？

- **简单性**：项目规模不大，自定义 store 足够
- **可控性**：完全掌控状态更新流程
- **学习成本**：团队成员更容易理解

### 4. 为什么术语高亮用正则替换？

- **实现简单**：代码量少，易维护
- **性能达标**：5000 字 + 30 术语 < 100ms
- **灵活性**：支持动态样式（已掌握/未掌握）

降级方案（如性能不达标）：
- 异步分批渲染可视区域
- 首次滚动到术语时才标注

## 安全考虑

### CSP 策略

```json
{
  "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.coze.cn"
}
```

- `default-src 'self'`：默认只允许加载同源资源
- `script-src 'self'`：禁止外部脚本
- `style-src 'self' 'unsafe-inline'`：允许内联样式（React 需要）
- `connect-src 'self' https://api.coze.cn`：只允许连接 Coze API

### API Token 存储

- 存储在 `.env` 文件（开发环境）
- 生产环境使用 Tauri 环境变量
- 不硬编码在源码中
- `.env` 已加入 `.gitignore`

## 性能优化

### 1. 术语高亮

- 按术语长度降序排序，避免短术语覆盖长术语
- 使用正则转义，防止特殊字符破坏匹配
- 缓存 highlightedContent，避免重复计算

### 2. 状态更新

- 批量更新：多个 setState 合并为一次渲染
- 监听器模式：只通知订阅组件，避免全局刷新

### 3. 数据库查询

- 使用索引：day_num、term_id、status 等高频字段
- 批量查询：getAllDailyProgress 一次查全部，避免循环查询

### 4. API 调用

- 错误降级：API 失败时使用本地模拟响应
- 超时控制：HTTP 请求设置超时，避免长时间等待

## 扩展性设计

### 1. 数据库表预留

已创建但未使用的表：
- `sync_queue`：云同步队列（未来支持多设备同步）
- `notification`：通知系统（未来支持导师主动推送）
- `reading_content`：阅读内容表（当前硬编码在 sampleData.ts）
- `term_dictionary`：术语词典表（当前硬编码在 sampleData.ts）
- `daily_discussion`：讨论问题表（当前硬编码在 sampleData.ts）
- `daily_reflection`：复盘问题表（当前硬编码在 sampleData.ts）
- `error_log`：错误日志表（未来支持错误追踪）

### 2. 插件化架构

未来可扩展：
- 自定义学习主题（非《架构整洁之道》）
- 自定义 AI 导师人设（非文渊先生）
- 自定义评分维度
- 导出学习报告

### 3. 云同步

通过 `sync_queue` 表实现：
1. 本地修改写入 sync_queue（status: pending）
2. 后台线程定期上传到云端
3. 下载云端变更，合并到本地
4. 更新 sync_queue status: completed

## 测试策略

### 单元测试

- store.ts：状态更新逻辑
- database.ts：InMemoryDB 操作
- mentorApi.ts：Prompt 渲染、响应解析

### 集成测试

- tauriBridge.ts：Rust 命令调用
- 页面组件：用户交互流程

### E2E 测试

- 完整学习流程（Day 1-7）
- 离线场景
- API 失败降级

## 部署架构

```
开发环境
  npm run tauri dev
  ↓
  Vite dev server (http://localhost:1420)
  + Tauri WebView

生产构建
  npm run tauri build
  ↓
  Vite build → dist/
  + Rust build → target/release/
  ↓
  Tauri bundler
  ↓
  安装包
  - Windows: .msi / .exe
  - macOS: .dmg
  - Linux: .deb / .AppImage
```

## 监控与日志

### 前端日志

```typescript
console.warn("[tauriBridge] xxx failed:", error);
console.error("[DiscussionPage] submit error:", err);
```

### 后端日志

```rust
// main.rs 中使用 println! 或 log crate
println!("[DB] init_database success");
```

### 错误追踪

未来接入：
- Sentry：前端错误上报
- 本地 error_log 表：离线错误记录
