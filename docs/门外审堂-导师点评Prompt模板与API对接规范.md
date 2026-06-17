# 门外审堂 — 导师点评 Prompt 模板与 API 对接规范

> 版本：v1.0 | 维护人：文渊先生 / 软件产品堂香主 | 更新日期：2026-06-16

---

## 1. Coze Agent API 配置

| 配置项 | 值 |
|--------|-----|
| Bot ID | `7651889469930438675` |
| API 端点 | `https://api.coze.cn/v3/chat` |
| 请求方式 | POST |
| 认证方式 | Bearer Token（Personal Access Token） |
| 超时设置 | 60 秒 |

### 环境变量

```bash
VITE_COZE_BOT_ID=7651889469930438675
VITE_COZE_API_TOKEN=<your-token-here>
```

---

## 2. API 调用流程（异步轮询模式）

Coze v3/chat 是**异步接口**，需三步完成：

```
Step 1: POST /v3/chat
  → 获取 chat_id + conversation_id

Step 2: POST /v3/chat/retrieve（轮询，间隔1秒，超时60秒）
  → 等待 status === "completed"

Step 3: GET /v3/chat/message/list?conversation_id=xxx&chat_id=xxx
  → 获取 assistant 回复内容
```

---

## 3. 三种场景 Prompt 模板

### 3.1 讨论点评（Discussion）

**触发时机：** 学习者提交讨论区 3 个问题的回答后

**Prompt 结构：**
```
角色设定：文渊先生，从业50年的资深文学与人文思想解读专家
学习者信息：项目名称 / 供应商 / 核心痛点
今日学习内容：主题 + Day 编号
讨论问题与回答：逐题列出

输出要求（JSON）：
{
  "content": "点评正文（Markdown，个性化开头+逐题点评）",
  "scores": {
    "depth": 1-5,        // 思考深度
    "connection": 1-5,   // 关联能力
    "practicality": 1-5  // 实用性
  },
  "follow_up_question": "一个深化思考的追问"
}
```

**点评风格要求：**
1. 文白结合有度，专业术语配通俗注解
2. 逐题点评结构：先肯定 → 再思辨 → 后总结
3. 务必结合学习者的项目名称和痛点进行个性化点评
4. 追问要有启发性，引导将今日概念与实际痛点关联
5. 面向非技术人员，深入浅出

---

### 3.2 复盘反馈（Reflection）

**触发时机：** 学习者提交复盘区 2 个反思问题的回答后

**Prompt 结构：**
```
角色设定：同上
学习者信息：同上
今日学习内容：同上
复盘问题与回答：逐题列出

输出要求（JSON）：
{
  "content": "反馈正文（Markdown，逐题反馈+今日学习总结+鼓励语）",
  "scores": {
    "self_awareness": 1-5,  // 自我认知
    "actionability": 1-5,   // 行动力
    "depth": 1-5            // 深度
  },
  "follow_up_question": null
}
```

**反馈风格要求：**
1. 逐题反馈结构：先肯定洞察 → 再提出深化方向 → 后给出行动建议
2. 今日学习总结格式：📖 阅读完成 + 💬 讨论完成 + 🪞 复盘完成
3. 务必结合学习者的项目场景给出个性化建议
4. 鼓励语要真诚有力量，不空洞

---

### 3.3 追问回复（FollowUp）

**触发时机：** 学习者在讨论后继续追问

**Prompt 结构：**
```
角色设定：同上
学习者信息：同上
今日学习主题：同上
上下文（之前的讨论）：历史消息
学习者的追问：当前问题

输出要求（JSON）：
{
  "content": "回复正文（Markdown，先回应追问，再深入解释，最后引导思考）",
  "scores": null,
  "follow_up_question": "继续引导深入思考的问题（如已充分解答可为null）"
}
```

**回复风格要求：**
1. 先确认理解了学习者的困惑点
2. 用比喻或类比深入浅出地解释
3. 尽量关联学习者的项目场景
4. 面向非技术人员，避免代码示例，用业务语言

---

## 4. 响应解析规则

1. LLM 返回的内容可能包裹在 ` ```json ``` ` 代码块中，需先提取
2. 找到第一个 `{` 和最后一个 `}` 进行 JSON 解析
3. 解析失败时，把原始文本作为 `content` 返回，`scores` 和 `follow_up_question` 设为 null
4. `content` 字段为 Markdown 格式，前端直接渲染

---

## 5. 异常处理

| 异常场景 | 错误码 | 处理方式 |
|----------|--------|----------|
| API 凭证未配置 | `API_NOT_CONFIGURED` | 使用兜底模拟响应 |
| HTTP 请求失败 | `CHAT_API_ERROR_xxx` | 使用兜底模拟响应 |
| Coze 业务错误 | `COZE_CHAT_ERROR_xxx` | 使用兜底模拟响应 |
| 缺少 chat_id | `MISSING_CHAT_ID` | 使用兜底模拟响应 |
| 轮询超时（>60秒） | `POLL_TIMEOUT` | 使用兜底模拟响应 |
| 会话失败 | `CHAT_FAILED` | 使用兜底模拟响应 |
| 回复内容为空 | `EMPTY_RESPONSE` | 使用兜底模拟响应 |

**兜底策略：** 所有异常均降级到硬编码的上下文感知回复（根据用户项目信息个性化），确保用户体验不中断。

---

## 6. 代码实现位置

- **API 调用层：** `src/lib/mentorApi.ts`
- **环境变量：** `.env`（开发）/ Tauri env（生产）
- **前端调用：** `src/pages/DiscussionPage.tsx`、`src/pages/ReflectionPage.tsx`
