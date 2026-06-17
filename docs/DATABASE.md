# 数据库设计文档

## 概述

门外审堂使用 SQLite 作为本地数据库，共设计 11 张表，支持离线优先的学习数据管理。

数据库文件位置：`{app_data_dir}/menwai_shentang.db`

## 表结构总览

| 序号 | 表名 | 用途 | 状态 |
|------|------|------|------|
| 1 | user_project_context | 用户项目背景 | ✅ 已使用 |
| 2 | daily_progress | 每日学习进度 | ✅ 已使用 |
| 3 | term_learning_record | 术语学习记录 | ✅ 已使用 |
| 4 | conversation | 对话消息 | ✅ 已使用 |
| 5 | sync_queue | 同步队列 | ⏳ 预留 |
| 6 | notification | 通知 | ⏳ 预留 |
| 7 | reading_content | 阅读内容 | ⏳ 预留 |
| 8 | term_dictionary | 术语词典 | ⏳ 预留 |
| 9 | daily_discussion | 每日讨论 | ⏳ 预留 |
| 10 | daily_reflection | 每日复盘 | ⏳ 预留 |
| 11 | error_log | 错误日志 | ⏳ 预留 |

## 核心表详解

### 1. user_project_context - 用户项目背景

存储用户的项目信息，用于 AI 导师个性化点评。

```sql
CREATE TABLE IF NOT EXISTS user_project_context (
  id TEXT PRIMARY KEY DEFAULT 'active',
  project_name TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  pain_point TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**字段说明：**
- `id`: 固定为 'active'，单例模式
- `project_name`: 用户负责/参与的项目名称
- `vendor_name`: 主要供应商/合作方
- `pain_point`: 用户工作中最大的挑战/痛点
- `created_at`: 创建时间

**使用场景：**
- 首次启动时通过 OnboardingPage 收集
- AI 导师点评时引用，实现个性化

### 2. daily_progress - 每日学习进度

记录每天的学习完成情况。

```sql
CREATE TABLE IF NOT EXISTS daily_progress (
  id TEXT PRIMARY KEY,
  day_num INTEGER NOT NULL,
  reading_completed INTEGER NOT NULL DEFAULT 0,
  discussion_completed INTEGER NOT NULL DEFAULT 0,
  reflection_completed INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**字段说明：**
- `id`: 主键，格式 `day-{day_num}`
- `day_num`: 学习天数（1-7）
- `reading_completed`: 阅读是否完成（0/1）
- `discussion_completed`: 讨论是否完成（0/1）
- `reflection_completed`: 复盘是否完成（0/1）
- `streak_days`: 连续学习天数
- `completed_at`: 当日全部完成的时间戳

**业务逻辑：**
- 当 reading/discussion/reflection 全部为 1 时，解锁下一天
- streak_days 计算：从 Day 1 开始连续完成的天数

### 3. term_learning_record - 术语学习记录

记录用户对每个术语的学习情况。

```sql
CREATE TABLE IF NOT EXISTS term_learning_record (
  id TEXT PRIMARY KEY,
  term_id TEXT NOT NULL,
  term_name TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  bookmarked INTEGER NOT NULL DEFAULT 0,
  mastered INTEGER NOT NULL DEFAULT 0,
  last_viewed TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**字段说明：**
- `id`: 主键，格式 `term-{term_id}`
- `term_id`: 术语 ID（来自 sampleData.ts）
- `term_name`: 术语名称
- `view_count`: 查看次数
- `bookmarked`: 是否收藏（0/1）
- `mastered`: 是否已掌握（0/1）
- `last_viewed`: 最后查看时间

**使用场景：**
- 用户点击术语时 view_count +1
- 用户点击"收藏"按钮时 bookmarked = 1
- 用户点击"标记已掌握"时 mastered = 1
- 已掌握的术语在阅读页显示绿色样式

### 4. conversation - 对话消息

存储用户与 AI 导师的对话历史。

```sql
CREATE TABLE IF NOT EXISTS conversation (
  id TEXT PRIMARY KEY,
  day_num INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'mentor')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**字段说明：**
- `id`: UUID
- `day_num`: 所属学习天数
- `role`: 消息角色（user/mentor）
- `content`: 消息内容（Markdown 格式）
- `created_at`: 创建时间

**使用场景：**
- 讨论页：保存用户的讨论回答和导师点评
- 复盘页：保存导师的复盘反馈
- 追问：保存追问和导师回答

## 预留表说明

### 5. sync_queue - 同步队列

用于未来支持多设备同步。

```sql
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK(operation IN ('create', 'update', 'delete')),
  payload TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'syncing', 'completed', 'failed')),
  next_retry_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**设计思路：**
- 本地修改写入 sync_queue（status: pending）
- 后台线程定期上传到云端
- 支持重试机制（retry_count < max_retries）
- 下载云端变更，合并到本地

### 6. notification - 通知

用于未来支持导师主动推送通知。

```sql
CREATE TABLE IF NOT EXISTS notification (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('mentor_reply', 'daily_reminder', 'streak_warning')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  related_entity_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**通知类型：**
- `mentor_reply`: 导师回复通知
- `daily_reminder`: 每日学习提醒
- `streak_warning`: 连续学习中断警告

### 7-10. 内容表（预留）

当前学习内容硬编码在 `src/lib/sampleData.ts`，未来可迁移到数据库：

- `reading_content`: 阅读材料
- `term_dictionary`: 术语词典
- `daily_discussion`: 讨论问题
- `daily_reflection`: 复盘问题

**迁移好处：**
- 支持动态加载学习内容
- 支持自定义学习主题
- 支持从云端下载新内容

### 11. error_log - 错误日志

用于记录应用错误，支持错误追踪。

```sql
CREATE TABLE IF NOT EXISTS error_log (
  id TEXT PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  context TEXT,
  resolved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**使用场景：**
- API 调用失败
- 数据库操作异常
- 前端未捕获错误

## 索引设计

```sql
CREATE INDEX IF NOT EXISTS idx_daily_progress_day ON daily_progress(day_num);
CREATE INDEX IF NOT EXISTS idx_term_learning_term ON term_learning_record(term_id);
CREATE INDEX IF NOT EXISTS idx_conversation_day ON conversation(day_num);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_read ON notification(read);
CREATE INDEX IF NOT EXISTS idx_reading_day ON reading_content(day_num);
CREATE INDEX IF NOT EXISTS idx_discussion_day ON daily_discussion(day_num);
```

**索引策略：**
- 高频查询字段：day_num、term_id、status
- 查询优化：避免全表扫描
- 性能目标：单次查询 < 10ms

## 数据迁移

### 初始化流程

```rust
// main.rs
#[tauri::command]
fn init_database() -> Result<(), String> {
    let db = get_db_connection()?;
    
    // 执行 schema.sql 创建所有表
    db.execute_batch(SCHEMA_SQL)?;
    
    Ok(())
}
```

### 版本升级

未来如需修改表结构：

1. 增加 `schema_version` 表记录版本号
2. 编写迁移脚本（migration_1_to_2.sql）
3. 启动时检查版本，自动执行迁移

```sql
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## 查询示例

### 获取某天的学习进度

```sql
SELECT * FROM daily_progress WHERE day_num = 1;
```

### 获取所有已掌握的术语

```sql
SELECT * FROM term_learning_record WHERE mastered = 1;
```

### 获取某天的对话历史

```sql
SELECT * FROM conversation 
WHERE day_num = 1 
ORDER BY created_at ASC;
```

### 更新术语查看次数

```sql
UPDATE term_learning_record 
SET view_count = view_count + 1, last_viewed = datetime('now')
WHERE term_id = 'term-001';
```

### 计算连续学习天数

```sql
SELECT MAX(streak_days) FROM daily_progress;
```

## 性能优化建议

### 1. 批量查询

避免循环查询，使用批量接口：

```typescript
// ❌ 不推荐
for (let day = 1; day <= 7; day++) {
  const progress = await getDailyProgress(day);
}

// ✅ 推荐
const allProgress = await getAllDailyProgress();
```

### 2. 事务处理

批量写入时使用事务：

```rust
let tx = db.transaction()?;
for record in records {
    tx.execute("INSERT ...", ...)?;
}
tx.commit()?;
```

### 3. 连接池

SQLite 单连接即可，无需连接池。但应复用连接，避免频繁打开/关闭。

## 数据安全

### 1. 备份策略

建议用户定期备份数据库文件：
- Windows: `%APPDATA%/com.menwai.shentang/menwai_shentang.db`
- macOS: `~/Library/Application Support/com.menwai.shentang/menwai_shentang.db`
- Linux: `~/.local/share/menwai-shentang/menwai_shentang.db`

### 2. 数据加密

未来可使用 SQLCipher 加密数据库，保护用户隐私。

### 3. 导出功能

未来支持导出学习数据为 JSON/CSV，便于迁移和备份。
