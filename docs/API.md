# API 接口文档

## 概述

门外审堂的 API 分为两层：

1. **Tauri 命令**：前端通过 `invoke` 调用 Rust 后端
2. **Coze Agent API**：Rust/前端调用外部 AI 服务

## Tauri 命令

### 数据库初始化

#### `init_database`

初始化 SQLite 数据库，创建所有表结构。

```typescript
await invoke("init_database");
```

**参数：** 无

**返回：** `void`

**错误码：**
- `DB_INIT_ERROR`: 数据库初始化失败

---

### 用户上下文

#### `get_user_context`

获取用户项目背景信息。

```typescript
const result = await invoke<string | null>("get_user_context");
const userContext = result ? JSON.parse(result) : null;
```

**参数：** 无

**返回：** `string | null`（JSON 格式的 UserContextData）

```typescript
interface UserContextData {
  projectName: string;
  vendorName: string;
  painPoint: string;
  createdAt: string;
}
```

#### `save_user_context`

保存/更新用户项目背景。

```typescript
await invoke("save_user_context", {
  projectName: "某公司ERP系统升级项目",
  vendorName: "用友",
  painPoint: "供应商交付质量不稳定"
});
```

**参数：**
- `projectName`: string - 项目名称
- `vendorName`: string - 供应商名称
- `painPoint`: string - 核心痛点

**返回：** `void`

**行为：**
- 如果 `user_project_context` 表为空，执行 INSERT
- 如果已有记录，执行 UPDATE（id = 'active'）

---

### 每日进度

#### `get_daily_progress`

获取某天的学习进度。

```typescript
const result = await invoke<string | null>("get_daily_progress", {
  dayNum: 1
});
const progress = result ? JSON.parse(result) : null;
```

**参数：**
- `dayNum`: number - 学习天数（1-7）

**返回：** `string | null`（JSON 格式的 DailyProgressData）

```typescript
interface DailyProgressData {
  dayNum: number;
  readingCompleted: boolean;
  discussionCompleted: boolean;
  reflectionCompleted: boolean;
  streakDays: number;
  completedAt: string | null;
}
```

#### `get_all_daily_progress`

获取所有天数的学习进度（批量查询）。

```typescript
const result = await invoke<string>("get_all_daily_progress");
const allProgress = JSON.parse(result) as DailyProgressData[];
```

**参数：** 无

**返回：** `string`（JSON 数组）

**性能优势：**
- 一条 SQL 查全部，避免循环查询
- 相比 `get_daily_progress` 循环 7 次，性能提升约 7 倍

#### `update_daily_progress`

更新某天的学习进度。

```typescript
await invoke("update_daily_progress", {
  dayNum: 1,
  readingCompleted: true,
  discussionCompleted: false,
  reflectionCompleted: false
});
```

**参数：**
- `dayNum`: number
- `readingCompleted`: boolean
- `discussionCompleted`: boolean
- `reflectionCompleted`: boolean

**返回：** `void`

**行为：**
- 如果记录不存在，执行 INSERT（streakDays 自动计算）
- 如果记录存在，执行 UPDATE

**streakDays 计算逻辑：**
```rust
let streak = 0;
for d in 1..=day_num {
    let progress = get_progress(d)?;
    if progress.reading_completed == 1
        && progress.discussion_completed == 1
        && progress.reflection_completed == 1
    {
        streak = d;
    } else {
        break;
    }
}
```

---

### 术语记录

#### `save_term_record`

保存/更新术语学习记录。

```typescript
await invoke("save_term_record", {
  termId: "term-001",
  termName: "架构整洁",
  viewCount: 5,
  bookmarked: true,
  mastered: false
});
```

**参数：**
- `termId`: string - 术语 ID
- `termName`: string - 术语名称
- `viewCount`: number - 查看次数
- `bookmarked`: boolean - 是否收藏
- `mastered`: boolean - 是否已掌握

**返回：** `void`

**行为：**
- 如果记录不存在（term_id），执行 INSERT
- 如果记录存在，执行 UPDATE

#### `get_term_records`

获取所有术语学习记录。

```typescript
const result = await invoke<string>("get_term_records");
const records = JSON.parse(result) as TermRecordData[];
```

**参数：** 无

**返回：** `string`（JSON 数组）

```typescript
interface TermRecordData {
  termId: string;
  termName: string;
  viewCount: number;
  bookmarked: boolean;
  mastered: boolean;
}
```

---

### 对话历史

#### `add_chat_message`

添加一条对话消息。

```typescript
await invoke("add_chat_message", {
  dayNum: 1,
  role: "user",
  content: "**问题1：** ...\n\n**我的回答：** ..."
});
```

**参数：**
- `dayNum`: number - 所属学习天数
- `role`: string - 消息角色（"user" | "mentor"）
- `content`: string - 消息内容（Markdown 格式）

**返回：** `void`

**行为：**
- 自动生成 UUID 作为 id
- 自动设置 created_at 为当前时间

#### `get_chat_history`

获取某天的对话历史。

```typescript
const result = await invoke<string>("get_chat_history", {
  dayNum: 1
});
const messages = JSON.parse(result) as ChatMessageData[];
```

**参数：**
- `dayNum`: number

**返回：** `string`（JSON 数组，按 created_at 升序）

```typescript
interface ChatMessageData {
  id: string;
  dayNum: number;
  role: string;
  content: string;
  createdAt: string;
}
```

---

## Coze Agent API

### 概述

通过 Coze Agent API 调用 AI 导师（文渊先生），实现个性化点评。

**API 地址：** `https://api.coze.cn/v3`

**认证方式：** Bearer Token

### 环境变量

```bash
VITE_COZE_BOT_ID=your_bot_id
VITE_COZE_API_TOKEN=your_api_token
```

### 调用流程

```
前端请求
  ↓
mentorApi.ts: requestMentor(req)
  ↓
renderXxxPrompt() → 生成 Prompt
  ↓
callCozeAgent(prompt) → HTTP POST
  ↓
Coze API 处理
  ↓
parseMentorResponse() → 解析 JSON
  ↓
返回 MentorResponse
```

### 请求类型

#### 讨论点评

```typescript
interface DiscussionRequest {
  type: "discussion";
  userContext: UserContext | null;
  currentDay: number;
  discussionQA: Array<{
    question: string;
    answer: string;
  }>;
}
```

#### 复盘反馈

```typescript
interface ReflectionRequest {
  type: "reflection";
  userContext: UserContext | null;
  currentDay: number;
  reflectionQA: Array<{
    prompt: string;
    answer: string;
  }>;
}
```

#### 追问回答

```typescript
interface FollowUpRequest {
  type: "followup";
  userContext: UserContext | null;
  currentDay: number;
  previousMessages: Array<{
    role: string;
    content: string;
  }>;
  followUpQuestion: string;
}
```

### 响应结构

```typescript
interface MentorResponse {
  content: string;              // Markdown 格式回复
  scores: MentorScores | null;  // 评分（讨论/复盘）
  follow_up_question: string | null;  // 追问
}

interface MentorScores {
  [key: string]: number;  // 1-5 分
}
```

**评分维度：**

讨论点评：
- `depth`: 思考深度
- `connection`: 知识关联
- `practicality`: 实践性

复盘反馈：
- `self_awareness`: 自我觉察
- `actionability`: 行动力
- `depth`: 深度

### Prompt 模板

#### 讨论点评 Prompt

```
你是「文渊先生」，一位从业50年的资深文学与人文思想解读专家...

## 学习者信息
- 项目名称：{projectName}
- 供应商：{vendorName}
- 核心痛点：{painPoint}

## 今日学习内容
- 主题：{readingTitle}
- Day：{currentDay}

## 讨论问题与回答
{qaText}

## 输出要求
请严格按照以下 JSON 格式输出：

{
  "content": "点评正文（Markdown格式）",
  "scores": {
    "depth": 1-5,
    "connection": 1-5,
    "practicality": 1-5
  },
  "follow_up_question": "一个深化思考的追问"
}
```

#### 复盘反馈 Prompt

```
你是「文渊先生」...

## 学习者信息
...

## 复盘问题与回答
{qaText}

## 输出要求
{
  "content": "反馈正文（Markdown格式）",
  "scores": {
    "self_awareness": 1-5,
    "actionability": 1-5,
    "depth": 1-5
  },
  "follow_up_question": null
}
```

### 错误处理

#### API 调用失败

```typescript
try {
  const raw = await callCozeAgent(prompt);
  return parseMentorResponse(raw);
} catch (error) {
  console.warn("[mentorApi] LLM call failed, using fallback:", error);
  return getFallbackResponse(req);  // 本地模拟响应
}
```

#### 降级策略

1. **API 未配置**：直接使用 fallback
2. **网络错误**：使用 fallback
3. **API 返回错误**：使用 fallback
4. **JSON 解析失败**：将原始文本作为 content 返回

### Fallback 响应示例

```typescript
{
  content: "你的回答展现了很好的思考深度！\n\n**逐题点评：**\n\n...",
  scores: { depth: 4, connection: 3, practicality: 4 },
  follow_up_question: "你提到验收标准不清晰是痛点..."
}
```

## 类型定义汇总

### 前端类型

```typescript
// store.ts
interface UserContext {
  projectName: string;
  vendorName: string;
  painPoint: string;
  createdAt: string;
}

interface Term {
  id: string;
  term: string;
  english: string;
  definition: string;
  example: string;
  relatedTerms: string[];
  viewCount: number;
  bookmarked: boolean;
  mastered: boolean;
}

interface DailyProgress {
  dayNum: number;
  readingCompleted: boolean;
  discussionCompleted: boolean;
  reflectionCompleted: boolean;
  streakDays: number;
  completedAt: string | null;
}

interface ChatMessage {
  id: string;
  dayNum: number;
  role: "user" | "mentor";
  content: string;
  createdAt: string;
}
```

### Tauri Bridge 类型

```typescript
// tauriBridge.ts
interface UserContextData {
  projectName: string;
  vendorName: string;
  painPoint: string;
  createdAt: string;
}

interface DailyProgressData {
  dayNum: number;
  readingCompleted: boolean;
  discussionCompleted: boolean;
  reflectionCompleted: boolean;
  streakDays: number;
  completedAt: string | null;
}

interface TermRecordData {
  termId: string;
  termName: string;
  viewCount: number;
  bookmarked: boolean;
  mastered: boolean;
}

interface ChatMessageData {
  id: string;
  dayNum: number;
  role: string;
  content: string;
  createdAt: string;
}
```

## 性能指标

### Tauri 命令

| 命令 | 目标耗时 | 实测耗时 |
|------|----------|----------|
| init_database | < 100ms | ~50ms |
| get_user_context | < 10ms | ~5ms |
| get_all_daily_progress | < 20ms | ~10ms |
| get_term_records | < 20ms | ~10ms |
| save_term_record | < 10ms | ~5ms |
| add_chat_message | < 10ms | ~5ms |
| get_chat_history | < 20ms | ~10ms |

### Coze Agent API

| 操作 | 目标耗时 | 实测耗时 |
|------|----------|----------|
| 讨论点评 | < 5s | ~3s |
| 复盘反馈 | < 5s | ~3s |
| 追问回答 | < 3s | ~2s |

## 安全考虑

### API Token 存储

- 开发环境：`.env` 文件
- 生产环境：Tauri 环境变量
- 不硬编码在源码中
- `.env` 已加入 `.gitignore`

### CSP 策略

```json
{
  "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.coze.cn"
}
```

- 只允许连接 `https://api.coze.cn`
- 禁止外部脚本
- 允许内联样式（React 需要）

### 数据验证

- 前端：TypeScript 类型检查
- 后端：Rust 类型系统 + SQL CHECK 约束
- API 响应：JSON 解析 + 降级处理
