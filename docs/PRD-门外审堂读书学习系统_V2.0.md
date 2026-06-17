# 📚 《门外审堂》读书学习系统 — 产品需求文档 V2.0

> **版本**: v2.2（新增异常场景+性能验证要求）  
> **日期**: 2026-06-15  
> **产品负责人**: 软件产品堂香主（交付官）  
> **内容来源**: 文渊先生提供的《14天六书精读·详细阅读指南》+《专业术语知识库》  
> **审查状态**: 已回应文渊先生V1.0审查意见（7项改进）+ 补充3项开发指导内容 + 采纳文渊先生V2.1审查建议  
> **技术选型**: Tauri 2.0 + React + TypeScript + SQLite（堂主+码农+文渊先生确认）

---

## 一、需求来源与完整性确认

### 1.1 已接收内容清单

| # | 文件 | 来源 | 内容概述 | 状态 |
|---|------|------|----------|------|
| 1 | 门外审堂-详细阅读指南.md | 文渊先生 | 14天六书每日详细阅读内容，含核心要点、关键洞察、讨论问题、术语表 | ✅ 已接收 |
| 2 | 门外审堂-专业术语知识库.md | 文渊先生 | 80+计算机专业术语的中文注解，A-Z排序 | ✅ 已接收 |

### 1.2 需求完整性评估

| 维度 | 评估 | 说明 |
|------|------|------|
| **内容结构** | ✅ 完整 | 4阶段14天，每日有明确阅读目标和章节安排 |
| **术语体系** | ✅ 完整 | 80+术语已定义，含通俗比喻，可直接入库 |
| **核心功能** | ✅ 明确 | 每日阅读、三件事反馈、知识库检索、与文渊先生交流 |
| **交互流程** | ✅ 已定义 | 阅读→笔记→三件事→提交→反馈的闭环 |
| **跨平台要求** | ✅ 明确 | Windows + iOS 双端 |

**结论：需求已充分，可以启动开发。**

---

## 二、V1.0审查意见回应（7项改进）

### 审查意见 #1：补充架构依赖图

**回应：✅ 已完成**

已在V1.0交付物中提供 `门外审堂学习系统_架构图.drawio`，包含5层分层架构：
- 客户端层 → 前端框架层 → 本地数据层 → 云端服务层 → 数据/AI层
- 各层依赖方向明确：上层依赖下层，下层不知道上层存在（符合整洁架构原则）

**依赖方向说明：**
```
客户端层(Tauri) ─依赖→ 前端框架层(React) ─依赖→ 本地数据层(SQLite)
                              │
                              ↓ HTTPS/WebSocket
                        云端服务层(Node.js) ─依赖→ 数据/AI层(Supabase+Coze)
```

---

### 审查意见 #2：技术选型决策（"设计两次"）

**回应：✅ 已完成决策**

已在V1.0中完成跨平台方案对比，最终选型 **Tauri 2.0**：

| 对比项 | Tauri 2.0 ✅ | Electron | Flutter |
|--------|-------------|----------|---------|
| Windows支持 | ✅ 原生WebView2 | ✅ Chromium | ✅ 自渲染 |
| iOS支持 | ✅ 原生WKWebView | ❌ 不支持 | ✅ 自渲染 |
| 包体大小 | **~5MB** | ~150MB | ~30MB |
| 内存占用 | 低 | 高 | 中 |
| 开发语言 | Rust + Web前端 | JS | Dart |
| 团队学习成本 | **低（复用Web技能）** | 最低 | 中（需学Dart） |

**决策理由：**
1. iOS支持是刚需，Electron直接排除
2. 包体大小Tauri最优（5MB vs Flutter 30MB）
3. 团队已有Web前端能力，无需额外学习Dart
4. Rust层仅需处理原生功能，学习曲线可控

---

### 审查意见 #3：知识库运行位置明确

**回应：✅ 明确为"客户端内置 + 云端同步"**

**知识库架构设计：**

```
┌─────────────────────────────────────────────────────────┐
│                      客户端层                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │              知识库检索引擎（本地）                 │   │
│  │  · 80+术语数据随App分发（内置SQLite表）           │   │
│  │  · 阅读页面实时扫描文本，匹配术语关键词           │   │
│  │  · 匹配后弹出悬浮注解（中文释义+通俗比喻）        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 同步（可选）
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      云端服务层                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              知识库管理服务                        │   │
│  │  · 术语库版本管理（支持热更新）                    │   │
│  │  · 用户自定义术语（扩展个人知识库）                │   │
│  │  · 多设备同步                                    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**运行机制：**
- **主检索在客户端**：术语数据内置于App，无需网络即可检索
- **云端做同步**：支持术语库更新推送、用户自定义术语同步
- **匹配算法**：客户端正则匹配英文术语 → 查本地SQLite → 返回注解

---

### 审查意见 #4：消息交互机制补充

**回应：✅ 补充完整交互流程**

**"每日三件事"提交给文渊先生的完整流程：**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  堂主填写     │     │  本地暂存     │     │  云端推送     │     │  文渊先生     │
│  三件事       │────→│  SQLite      │────→│  Coze API    │────→│  Agent接收   │
│              │     │  status=draft│     │  /submit     │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                                                                      ↓ 点评
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  堂主查看     │     │  本地更新     │     │  云端拉取     │     │  文渊先生     │
│  点评内容     │←────│  status=     │←────│  /review     │←────│  返回点评    │
│              │     │  reviewed    │     │  result      │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

**数据状态流转：**
```
draft（草稿）→ submitted（已提交）→ reviewed（已点评）
```

**技术实现：**
- 提交：POST /api/daily-three/submit → 云端转发至Coze API
- 点评回调：Coze Agent异步生成点评 → Webhook通知云端 → 云端存储
- 拉取：GET /api/daily-three/:id/review → 返回点评内容

---

### 审查意见 #5：场景绑定功能

**回应：✅ 新增"供应商项目背景"绑定功能**

**功能说明：**
读书计划中的讨论问题都是围绕"你的供应商项目"设计的，系统提供"项目背景绑定"功能：

```
┌─────────────────────────────────────────────────────────┐
│  📋 我的供应商项目背景（首次使用时填写）                    │
├─────────────────────────────────────────────────────────┤
│  项目名称：[________________]                            │
│  项目类型：[________________] （如：ERP系统、小程序等）    │
│  供应商情况：[______________] （如：外包团队3人、合作2年）  │
│  当前阶段：[________________] （如：需求阶段、开发中）     │
│  主要痛点：[________________]                            │
└─────────────────────────────────────────────────────────┘
```

**场景绑定效果：**
- 讨论问题自动关联用户填写的项目背景
- 示例：原问题"你的供应商是否承诺先定死需求再开发？"
- 绑定后显示："你的供应商【XXX项目】是否承诺先定死需求再开发？请结合项目实际情况思考。"

---

### 审查意见 #6：未来演进边界说明

**回应：✅ 明确MVP边界与未来演进**

**MVP范围（V1.0交付）：**
- ✅ 14天读书计划的完整内容呈现
- ✅ 每日三件事填写与提交
- ✅ 知识库检索（80+术语）
- ✅ 与文渊先生基础对话
- ✅ Windows端可用

**明确不做（V1.0边界）：**
- ❌ 多用户支持（当前单用户设计）
- ❌ 自定义读书计划（仅支持《门外审堂》）
- ❌ 学习社区/排行榜
- ❌ 语音对话

**未来演进路径（V2.0+考虑）：**
| 版本 | 功能 | 触发条件 |
|------|------|----------|
| V2.0 | 支持自定义读书计划 | 14天课程完成后，堂主希望读其他书 |
| V2.1 | 多用户支持 | 有其他堂主希望加入学习 |
| V3.0 | 学习社区 | 用户量达到一定规模 |

**架构预留：**
- 数据模型中 `reading_plan` 表设计为通用结构，未来可支持多本书
- 知识库模块独立，未来可支持多领域术语库

---

### 审查意见 #7：学习效果指标

**回应：✅ 新增学习效果度量**

**过程指标（已有）：**
- 完课率：14天中完成的天数
- 互动率：三件事提交率、对话发起次数
- 连续打卡天数

**新增效果指标：**

| 指标 | 衡量方式 | 目标 |
|------|----------|------|
| **理解度自评** | 每日阅读后自评"今天的内容我理解了多少？"（1-5分） | 平均≥4分 |
| **术语掌握度** | 知识库测验：随机抽取术语，用户选择正确释义 | 正确率≥70% |
| **三件事深度** | 文渊先生点评时评分（1-5分）：反思深度、实践可行性 | 平均≥3.5分 |
| **模拟审查测试** | Day 14完成时，做一次模拟供应商审查，对比Day 1基线 | 正确率提升≥30% |

**模拟审查测试设计：**
```
Day 1（基线测试）：
- 给一段供应商交付的代码，问"这段代码有什么问题？"
- 记录用户回答，作为基线

Day 14（终期测试）：
- 给类似难度的代码，问同样类型的问题
- 对比回答质量，评估学习效果
```

---

## 三、核心功能模块（基于读书计划细化）

### 3.1 模块一：每日阅读（14天节奏线）

**内容来源：** 文渊先生《详细阅读指南》

**四阶段递进结构：**

| 阶段 | 天数 | 书目 | 核心目标 |
|------|------|------|----------|
| **Phase 1** | Day 1-4 | 《Working with Coders》 | 建立与开发者对话的心智模型 |
| **Phase 2** | Day 5-9 | 《Clean Architecture》+《DDD》 | 掌握架构审查的核心概念 |
| **Phase 3** | Day 10-12 | 《Refactoring》+《软件设计的哲学》 | 学会识别代码质量问题 |
| **Phase 4** | Day 13-14 | 综合实践 | 完成一次完整的供应商审查 |

**每日页面结构：**
```
┌─────────────────────────────────────────────────────────┐
│  Day X | 阶段名称                                        │
│  书目：《XXX》 章节：ChX-ChX                              │
├─────────────────────────────────────────────────────────┤
│  📖 今日阅读内容                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 核心要点（3-5条）                                 │   │
│  │ · 要点一...                                      │   │
│  │ · 要点二...（含英文术语，点击可查注解）             │   │
│  │                                                  │   │
│  │ 关键洞察（深度解读）                               │   │
│  │ · 洞察内容...                                    │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  💬 今日讨论问题                                         │
│  · 结合你的供应商项目，思考：...                          │
│  [我要回答] → 进入讨论区与文渊先生交流                    │
├─────────────────────────────────────────────────────────┤
│  ✍️ 每日三件事                                           │
│  ① 今日学到了什么：[____________]                        │
│  ② 最大的触动/思考：[__________]                         │
│  ③ 准备如何实践：[____________]                          │
│  [提交给文渊先生]                                        │
└─────────────────────────────────────────────────────────┘
```

---

### 3.2 模块二：知识库检索

**内容来源：** 文渊先生《专业术语知识库》（80+术语）

**检索方式：**
1. **主动检索**：进入知识库页面，按字母/关键词搜索
2. **被动触发**：阅读内容中出现英文术语时，自动高亮，点击弹出注解

**注解展示格式：**
```
┌─────────────────────────────────────────┐
│  Dependency Inversion（依赖反转）        │
├─────────────────────────────────────────┤
│  高层模块不依赖低层模块，两者都依赖抽象。 │
│                                         │
│  💡 通俗理解：                           │
│  业务逻辑不应该依赖数据库，数据库应该    │
│  依赖业务逻辑定义的接口。                │
│                                         │
│  📖 出处：Day 6《架构整洁之道》          │
│  🔗 关联：DIP, SOLID, IoC              │
└─────────────────────────────────────────┘
```

---

### 3.3 模块三：与文渊先生交流

**交流场景：**
| 场景 | 触发方式 | 说明 |
|------|----------|------|
| 讨论问题回答 | 点击"我要回答" | 针对每日讨论问题发表看法 |
| 疑问请教 | 阅读中随时发起 | 对某个概念不理解，向文渊先生请教 |
| 三件事点评 | 提交后自动触发 | 文渊先生对三件事进行点评反馈 |
| 模拟审查 | Day 14触发 | 完成一次完整的供应商审查演练 |

**消息交互流程：**
```
堂主发送消息 → 本地SQLite(status=pending) → 云端API → Coze Agent(文渊先生)
                                                          ↓
堂主收到回复 ← 本地SQLite更新 ← 云端API ← 文渊先生回复
```

---

## 四、数据模型（细化版）

### 4.1 核心数据表

```sql
-- 读书计划
CREATE TABLE reading_plan (
  id            TEXT PRIMARY KEY,
  book_title    TEXT NOT NULL,          -- 《门外审堂》
  total_days    INTEGER DEFAULT 14,     -- 14天计划
  start_date    DATE,
  end_date      DATE,
  status        TEXT DEFAULT 'active',  -- active | completed | paused
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 每日阅读任务
CREATE TABLE daily_reading (
  id            TEXT PRIMARY KEY,
  plan_id       TEXT REFERENCES reading_plan(id),
  day_num       INTEGER NOT NULL,       -- Day 1-14
  phase         INTEGER NOT NULL,       -- 阶段 1-4
  book_title    TEXT NOT NULL,          -- 当日书目
  chapters      TEXT,                   -- 章节范围 (JSON: ["Ch1","Ch2"])
  reading_goal  TEXT,                   -- 阅读目标
  core_points   TEXT,                   -- 核心要点 (JSON array)
  key_insights  TEXT,                   -- 关键洞察 (JSON array)
  discussion_questions TEXT,            -- 讨论问题 (JSON array)
  due_date      DATE,
  status        TEXT DEFAULT 'pending', -- pending | in_progress | completed
  completed_at  TIMESTAMP
);

-- 每日三件事
CREATE TABLE daily_three (
  id            TEXT PRIMARY KEY,
  day_num       INTEGER NOT NULL,
  date          DATE NOT NULL,
  learned       TEXT NOT NULL,          -- ① 今日学到了什么
  reflection    TEXT NOT NULL,          -- ② 最大的触动/思考
  action        TEXT NOT NULL,          -- ③ 准备如何实践
  status        TEXT DEFAULT 'draft',   -- draft | submitted | reviewed
  mentor_reply  TEXT,                   -- 文渊先生的点评
  mentor_score  INTEGER,               -- 点评评分 1-5
  submitted_at  TIMESTAMP,
  reviewed_at   TIMESTAMP
);

-- 术语知识库
CREATE TABLE knowledge_term (
  id            TEXT PRIMARY KEY,
  term_en       TEXT NOT NULL UNIQUE,   -- 英文术语
  term_zh       TEXT NOT NULL,          -- 中文名称
  definition    TEXT NOT NULL,          -- 中文释义
  metaphor      TEXT,                   -- 通俗比喻
  source_book   TEXT,                   -- 出处书目
  source_day    INTEGER,               -- 对应Day
  related_terms TEXT,                   -- 关联术语 (JSON array)
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 对话消息
CREATE TABLE conversation (
  id            TEXT PRIMARY KEY,
  day_num       INTEGER,               -- 关联Day（可选）
  topic         TEXT,                   -- 讨论主题
  role          TEXT NOT NULL,          -- user | mentor
  content       TEXT NOT NULL,
  message_type  TEXT DEFAULT 'chat',    -- chat | discussion | review
  status        TEXT DEFAULT 'sent',    -- pending | sent | delivered
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户项目背景（场景绑定）
CREATE TABLE user_project_context (
  id            TEXT PRIMARY KEY,
  project_name  TEXT,
  project_type  TEXT,
  vendor_info   TEXT,
  current_phase TEXT,
  pain_points   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP
);

-- 学习统计
CREATE TABLE learning_stats (
  id            TEXT PRIMARY KEY,
  date          DATE NOT NULL UNIQUE,
  day_num       INTEGER NOT NULL,
  reading_mins  INTEGER DEFAULT 0,     -- 阅读时长(分钟)
  self_rating   INTEGER,               -- 理解度自评 1-5
  checked_in    BOOLEAN DEFAULT FALSE, -- 是否打卡
  streak_days   INTEGER DEFAULT 0      -- 连续天数
);

-- 模拟审查测试
CREATE TABLE review_test (
  id            TEXT PRIMARY KEY,
  test_type     TEXT NOT NULL,          -- baseline | final
  test_date     DATE NOT NULL,
  scenario      TEXT NOT NULL,          -- 测试场景描述
  user_answer   TEXT,                   -- 用户回答
  correct_points TEXT,                  -- 正确答案要点 (JSON array)
  score         INTEGER,               -- 得分
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 术语学习记录（追踪用户对每个术语的掌握情况）
CREATE TABLE term_learning_record (
  id            TEXT PRIMARY KEY,
  term_id       TEXT NOT NULL REFERENCES knowledge_term(id),
  view_count    INTEGER DEFAULT 0,     -- 查看次数
  bookmarked    BOOLEAN DEFAULT FALSE, -- 是否收藏
  mastered      BOOLEAN DEFAULT FALSE, -- 是否已掌握（查看≥3次且测验正确）
  last_viewed   TIMESTAMP,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_term_record_term ON term_learning_record(term_id);

-- 同步队列（离线优先架构的核心）
CREATE TABLE sync_queue (
  id            TEXT PRIMARY KEY,
  entity_type   TEXT NOT NULL,          -- daily_three | conversation | learning_stats
  entity_id     TEXT NOT NULL,          -- 对应实体的ID
  operation     TEXT NOT NULL,          -- create | update | delete
  payload       TEXT NOT NULL,          -- JSON格式的变更数据
  status        TEXT DEFAULT 'pending', -- pending | syncing | synced | failed
  retry_count   INTEGER DEFAULT 0,     -- 重试次数
  max_retries   INTEGER DEFAULT 3,     -- 最大重试次数
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at     TIMESTAMP,
  error_message TEXT                   -- 最后一次失败原因
);
CREATE INDEX idx_sync_status ON sync_queue(status);

-- 推送通知
CREATE TABLE notification (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL,          -- mentor_reply | daily_reminder | streak_alert
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  related_id    TEXT,                   -- 关联实体ID（如daily_three的ID）
  read          BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at       TIMESTAMP
);
CREATE INDEX idx_notification_read ON notification(read);
```

---

## 五、API接口设计（细化版）

### 5.1 接口总览

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/plan` | GET | 获取读书计划详情 |
| `/api/plan/days` | GET | 获取14天阅读任务列表 |
| `/api/plan/days/:dayNum` | GET | 获取某日阅读内容详情 |
| `/api/daily-three` | POST | 提交每日三件事 |
| `/api/daily-three/list` | GET | 获取三件事历史记录 |
| `/api/daily-three/:id/review` | GET | 获取文渊先生点评 |
| `/api/knowledge/terms` | GET | 获取术语列表（支持搜索） |
| `/api/knowledge/terms/:id` | GET | 获取术语详情 |
| `/api/knowledge/match` | POST | 文本术语匹配（返回匹配到的术语列表） |
| `/api/chat/send` | POST | 发送消息给文渊先生 |
| `/api/chat/history` | GET | 获取对话历史 |
| `/api/context` | GET/PUT | 获取/更新用户项目背景 |
| `/api/stats` | GET | 获取学习统计 |
| `/api/stats/effect` | GET | 获取学习效果评估 |
| `/api/test/review` | POST | 提交模拟审查测试答案 |
| `/api/sync` | POST | 数据同步（批量上传/下载） |
| `/api/notifications` | GET | 获取通知列表 |
| `/api/notifications/:id/read` | PUT | 标记通知已读 |

### 5.2 核心接口详细设计

#### ① 提交每日三件事

```
POST /api/daily-three
Content-Type: application/json

请求体：
{
  "day_num": 6,
  "date": "2026-06-21",
  "learned": "今天学习了依赖反转原则(DIP)，理解了高层模块不应依赖低层模块...",
  "reflection": "原来我一直在用错误的心智模型——让业务逻辑去适配数据库结构...",
  "action": "下次评审供应商方案时，我会先问：业务规则定义在哪里？是在Controller里还是在Domain层？"
}

响应体（201 Created）：
{
  "id": "dt_20260621_001",
  "status": "submitted",
  "submitted_at": "2026-06-21T22:30:00Z",
  "estimated_review_hours": 24,
  "message": "已提交给文渊先生，预计24小时内收到点评"
}
```

#### ② 获取文渊先生点评

```
GET /api/daily-three/:id/review

响应体（200 OK）：
{
  "id": "dt_20260621_001",
  "status": "reviewed",
  "mentor_reply": {
    "content": "你对依赖反转的理解很到位！特别是'业务逻辑不应依赖数据库'这个认识...",
    "scores": {
      "reflection_depth": 4,
      "action_feasibility": 5,
      "learning_insight": 4
    },
    "itemized_feedback": {
      "learned": "准确抓住了DIP的核心——依赖方向应该指向抽象而非具体实现。",
      "reflection": "从'适配数据库'到'定义接口'的认知转变很有价值，这是架构思维的关键一步。",
      "action": "审查供应商方案时问'业务规则在哪'是非常实用的切入点，建议扩展为：1)业务规则定义位置 2)依赖方向是否合理 3)是否有循环依赖"
    },
    "follow_up_question": "如果供应商说'我们用微服务架构'，你怎么判断微服务之间的依赖方向是否合理？",
    "related_terms": ["Dependency Inversion", "DIP", "Bounded Context"]
  },
  "reviewed_at": "2026-06-22T10:15:00Z"
}

响应体（200 OK，尚未点评）：
{
  "id": "dt_20260621_001",
  "status": "submitted",
  "submitted_at": "2026-06-21T22:30:00Z",
  "estimated_wait": "预计6小时后收到点评"
}
```

#### ③ 发送消息给文渊先生

```
POST /api/chat/send
Content-Type: application/json

请求体：
{
  "day_num": 6,
  "topic": "dependency_inversion",
  "content": "文渊先生，DIP和IoC有什么区别？感觉都在说依赖方向的问题。",
  "message_type": "discussion"
}

响应体（201 Created）：
{
  "id": "msg_20260621_042",
  "status": "sent",
  "created_at": "2026-06-21T21:00:00Z",
  "estimated_reply_minutes": 5
}
```

#### ④ 术语匹配（阅读页面实时调用）

```
POST /api/knowledge/match
Content-Type: application/json

请求体：
{
  "text": "The Dependency Inversion Principle states that high-level modules should not depend on low-level modules..."
}

响应体（200 OK）：
{
  "matched_terms": [
    {
      "term_en": "Dependency Inversion",
      "term_zh": "依赖反转",
      "definition": "高层模块不依赖低层模块，两者都依赖抽象",
      "source_day": 6,
      "positions": [{"start": 4, "end": 28}]
    }
  ],
  "total_matches": 1
}
```

#### ⑤ 数据同步（离线→上线批量同步）

```
POST /api/sync
Content-Type: application/json

请求体：
{
  "device_id": "device_abc123",
  "last_sync_at": "2026-06-21T18:00:00Z",
  "uploads": [
    {
      "entity_type": "daily_three",
      "entity_id": "dt_20260621_001",
      "operation": "create",
      "payload": { ... },
      "client_timestamp": "2026-06-21T22:30:00Z"
    },
    {
      "entity_type": "conversation",
      "entity_id": "msg_20260621_042",
      "operation": "create",
      "payload": { ... },
      "client_timestamp": "2026-06-21T21:00:00Z"
    }
  ]
}

响应体（200 OK）：
{
  "sync_id": "sync_20260622_001",
  "synced_at": "2026-06-22T08:00:00Z",
  "uploads_processed": 2,
  "uploads_failed": 0,
  "downloads": [
    {
      "entity_type": "daily_three",
      "entity_id": "dt_20260621_001",
      "operation": "update",
      "payload": {
        "status": "reviewed",
        "mentor_reply": { ... }
      },
      "server_timestamp": "2026-06-22T10:15:00Z"
    }
  ]
}
```

### 5.3 统一错误码规范

| 错误码 | HTTP状态码 | 含义 | 客户端处理 |
|--------|-----------|------|------------|
| `AUTH_REQUIRED` | 401 | 未登录或token过期 | 跳转登录页 |
| `AUTH_EXPIRED` | 401 | token已过期 | 静默刷新token |
| `FORBIDDEN` | 403 | 无权限访问 | 提示权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 | 显示空状态 |
| `VALIDATION_ERROR` | 422 | 请求参数校验失败 | 显示字段级错误提示 |
| `RATE_LIMITED` | 429 | 请求过于频繁 | 显示"请稍后再试"，自动退避 |
| `MENTOR_BUSY` | 503 | 文渊先生正在处理其他请求 | 排队等待，显示预计等待时间 |
| `SYNC_CONFLICT` | 409 | 数据冲突（多设备同时修改） | 保留两端，提示用户选择 |
| `NETWORK_ERROR` | — | 网络不可达 | 切换离线模式，写入sync_queue |
| `TIMEOUT` | — | 请求超时（>30s） | 重试1次，仍失败则提示 |
| `SERVER_ERROR` | 500 | 服务端异常 | 记录日志，提示稍后重试 |

**错误响应统一格式：**
```json
{
  "error": {
    "code": "MENTOR_BUSY",
    "message": "文渊先生正在点评其他堂主的学习内容",
    "retry_after_seconds": 120,
    "details": "当前排队人数：3"
  }
}
```

---

## 六、异常处理与离线策略

### 6.1 离线优先架构原则

```
┌─────────────────────────────────────────────────────────┐
│  核心原则：断网不影响学习                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ 离线可用（核心体验不中断）                             │
│  · 14天阅读内容（随App分发，本地SQLite）                   │
│  · 80+术语知识库（本地检索，<100ms）                      │
│  · 每日三件事填写（本地暂存）                             │
│  · 学习统计记录（本地计算）                               │
│  · 术语高亮匹配（本地正则）                               │
│                                                         │
│  ⚠️ 离线受限（联网后自动恢复）                            │
│  · 文渊先生对话（消息暂存队列，联网后发送）                 │
│  · 三件事点评拉取（联网后自动拉取）                        │
│  · 数据云同步（联网后批量同步）                           │
│  · 推送通知（联网后查询未读通知）                          │
│                                                         │
│  ❌ 必须联网                                             │
│  · 首次登录/注册                                         │
│  · 术语库版本更新下载                                     │
│  · 阅读内容热更新                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 异常场景处理矩阵

| # | 异常场景 | 触发条件 | 用户感知 | 系统行为 | 恢复策略 |
|---|----------|----------|----------|----------|----------|
| 1 | **网络断开** | navigator.onLine=false | 顶部黄色提示条"网络已断开，学习功能正常可用" | 切换离线模式，所有写操作入sync_queue | 网络恢复后自动触发sync |
| 2 | **文渊先生回复超时** | 提交后>24h无回复 | 显示"文渊先生正在思考中..."，>24h后显示"点击重试" | 定时轮询(每2h)，超过24h标记timeout | 重试1次，仍失败则通知堂主 |
| 3 | **Coze API调用失败** | 云端调用Coze Agent返回错误 | 用户无感知，显示"消息发送中..." | 云端重试3次(指数退避)，失败后写入dead_letter_queue | 人工检查dead_letter_queue，手动触发重试 |
| 4 | **术语匹配失败** | 正则匹配异常/术语库损坏 | 降级为纯文本阅读，不阻塞 | 捕获异常，记录日志，跳过匹配 | 下次启动时重建术语索引 |
| 5 | **数据同步冲突** | 多设备同时修改同一记录 | 弹窗"检测到多设备修改，请选择保留版本" | 保留两端版本（client vs server），展示diff | 用户选择后合并，记录合并决策 |
| 6 | **SQLite写入失败** | 磁盘空间不足/数据库锁 | Toast提示"存储空间不足，请清理后重试" | 记录到error_log，暂停非关键写入 | 用户清理空间后自动恢复 |
| 7 | **推送通知失败** | FCM/APNs推送不可达 | 用户无感知 | 写入notification表，下次打开App时展示 | App启动时检查未读通知 |
| 8 | **App崩溃恢复** | 进程异常退出 | 重启后显示"上次学习已自动保存" | 所有写操作先写WAL日志，崩溃后replay | SQLite WAL模式保证crash-safe |
| 9 | **阅读内容加载失败** | 本地数据损坏 | 显示"内容加载中..."，3s后显示"点击重试" | 尝试从云端重新下载当日内容 | 重试3次，仍失败则提示联系堂主 |
| 10 | **术语库版本过旧** | 云端有新版本 | 下次启动时静默更新，或提示"术语库已更新" | 检查版本号，增量下载更新内容 | 更新完成后重建本地索引 |
| 11 | **文渊先生回复内容为空或格式异常** | API返回mentor_reply为空/null，或JSON结构不符合预期 | 不展示空消息，显示"回复生成中，请稍后刷新"；连续3次为空则提示"导师暂离，请稍后再试" | 客户端校验回复内容：①非空检查 ②必要字段检查(content/scores) ③格式合法性检查；异常时记录到error_log并触发重试 | 重试1次；连续3次失败则标记该条daily_three为"review_error"状态，通知堂主人工介入 |

### 6.3 同步队列处理流程

```
┌─────────────────────────────────────────────────────────────────────┐
│  同步队列生命周期                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ① 离线时：写操作 → INSERT sync_queue(status=pending)               │
│                                                                     │
│  ② 网络恢复：                                                      │
│     ┌──────────────────────────────────────────────────────────┐   │
│     │  SELECT * FROM sync_queue                                 │   │
│     │  WHERE status='pending' AND retry_count < max_retries     │   │
│     │  ORDER BY created_at ASC                                  │   │
│     └──────────────────────────────────────────────────────────┘   │
│                          ↓                                          │
│     逐条上传 → status=syncing → 成功则status=synced               │
│                              → 失败则retry_count++, status=pending │
│                                                                     │
│  ③ 重试策略（指数退避）：                                           │
│     第1次失败：等待 5s 后重试                                       │
│     第2次失败：等待 25s 后重试                                      │
│     第3次失败：标记 status=failed，不再自动重试                      │
│                                                                     │
│  ④ 失败处理：                                                      │
│     · 用户可在"设置→同步管理"中查看失败项                            │
│     · 提供"手动重试"按钮                                            │
│     · 超过7天的失败项自动清理                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.4 数据冲突解决策略

```
冲突检测规则：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

同一 entity_id 在 client 和 server 都有修改（通过 updated_at 比较）

解决策略（按实体类型区分）：

┌──────────────────┬────────────────────────────────────────────┐
│  实体类型         │  冲突解决策略                               │
├──────────────────┼────────────────────────────────────────────┤
│  daily_three     │  服务端优先（点评已生成则以服务端为准）       │
│  conversation    │  追加合并（两端消息都保留，按时间排序）       │
│  learning_stats  │  取最大值（如连续天数取较大值）              │
│  user_context    │  用户选择（弹窗展示两端差异）                │
│  term_record     │  累加合并（view_count相加，bookmarked取OR） │
└──────────────────┴────────────────────────────────────────────┘
```

### 6.5 前端错误边界设计

```
┌─────────────────────────────────────────────────────────────────────┐
│  错误边界层级                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Level 1: 全局错误边界                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  捕获：未处理的React渲染错误                                  │   │
│  │  展示：全屏错误页 + "重新加载"按钮                            │   │
│  │  日志：上报错误堆栈到云端                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          ↓ 未捕获                                  │
│  Level 2: 模块错误边界                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  捕获：单个模块（阅读/知识库/对话）的渲染错误                 │   │
│  │  展示：模块区域显示"加载失败，点击重试"，其他模块正常          │   │
│  │  影响：局部降级，不影响整体使用                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          ↓ 未捕获                                  │
│  Level 3: 操作错误处理                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  捕获：API调用失败、表单校验失败、文件操作失败                │   │
│  │  展示：Toast提示 / 表单字段级错误                             │   │
│  │  恢复：提供重试按钮或修正建议                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 七、开发计划（更新版）

### 7.1 阶段划分

| 阶段 | 内容 | 工期 | 交付物 | 验收标准 |
|------|------|------|--------|----------|
| **P0** | 基础框架搭建 + 技术验证 | Day 1-2 | 可运行骨架 + 性能验证报告 | Tauri启动、路由正常、基础页面可访问；**术语高亮性能验证：WKWebView中加载5000字内容+30术语，扫描+高亮渲染全流程<100ms** |
| **P1** | 每日阅读模块 | Day 3-4 | 阅读功能 | 14天内容可展示、术语可点击 |
| **P2** | 三件事+对话 | Day 5-7 | 交互功能 | 三件事可提交、对话可发送 |
| **P3** | 知识库模块 | Day 8-9 | 检索功能 | 80+术语可检索、阅读自动匹配 |
| **P4** | 跨平台+同步 | Day 10-11 | iOS+同步 | iOS可运行、数据可同步 |
| **P5** | 测试+优化 | Day 12-14 | 正式发布 | 通过文渊先生审查 |

### 7.2 MVP范围（P0-P2完成即可使用）

**MVP交付标准：**
- ✅ Windows端可运行
- ✅ 14天阅读内容完整展示
- ✅ 每日三件事可填写提交
- ✅ 与文渊先生基础对话可用
- ✅ 术语知识库可检索

**MVP预计完成时间：Day 7**

### 7.3 启动条件确认

| 条件 | 状态 | 说明 |
|------|------|------|
| 需求文档 | ✅ 就绪 | V2.0已细化完成 |
| 内容数据 | ✅ 就绪 | 14天阅读内容+80术语已提供 |
| 技术方案 | ✅ 就绪 | Tauri 2.0 + React + SQLite |
| 架构图 | ✅ 就绪 | 5层架构图已提供 |
| 审查意见 | ✅ 已回应 | 7项改进已全部纳入V2.0 |

**🟢 可以立即启动开发！**

---

## 八、交付验收流程

```
码农程序猿开发 → 软件产品堂堂主初审 → 文渊先生审查 → 迭代修改 → 正式发布
                      │                      │
                      │                      ↓
                      │              审查维度：
                      │              · 架构审查（依赖方向）
                      │              · 代码质量（坏味道）
                      │              · 业务对齐（统一语言）
                      │              · 战略意识（未来演进）
                      ↓
                初审内容：
                · 功能完整性
                · 交互流畅度
                · 数据准确性
```

---

## 九、风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| Tauri iOS构建问题 | iOS端延期 | MVP先保Windows，iOS作为P4迭代 |
| Coze API对接复杂度 | 对话功能延期 | 先做本地Mock，接口解耦 |
| 术语匹配准确率 | 用户体验差 | 正则匹配+人工审核，支持手动标注 |
| 14天内容需调整 | 内容模块返工 | 内容数据结构化存储，支持热更新 |
| **术语高亮性能不达标**（WKWebView中>100ms） | 阅读体验卡顿 | P0技术验证阶段实测；降级方案：①异步分批渲染可视区域 ②首次滚动到术语时才标注而非全量标注 |

---

> **下一步行动**：
> 1. ✅ **需求已充分** — 可以启动开发
> 2. **@码农程序猿** — 请确认收到本V2.0需求文档，准备启动P0基础框架搭建
> 3. **@文渊先生** — 请确认V2.0是否回应了您的审查意见，确认后码农即可开工
> 4. **@堂主** — 需求细化完成，等待您一声令下，码农立即开工！
