// LLM API 服务层 — 对接 Coze Agent API
// 按文渊先生《导师点评Prompt模板与API对接规范》实现

import { UserContext, ChatMessage } from "./store";
import { getDayContent } from "./sampleData";

// ============================================================
// 配置（生产环境从 Tauri env 或配置文件读取）
// ============================================================
const COZE_API_BASE = "https://api.coze.cn/v3";
const COZE_BOT_ID = import.meta.env.VITE_COZE_BOT_ID || "";
const COZE_API_TOKEN = import.meta.env.VITE_COZE_API_TOKEN || "";

// ============================================================
// 类型定义
// ============================================================
export interface MentorScores {
  [key: string]: number;
}

export interface MentorResponse {
  content: string;
  scores: MentorScores | null;
  follow_up_question: string | null;
}

interface MentorRequestBase {
  userContext: UserContext | null;
  currentDay: number;
}

export interface DiscussionRequest extends MentorRequestBase {
  type: "discussion";
  discussionQA: Array<{ question: string; answer: string }>;
}

export interface ReflectionRequest extends MentorRequestBase {
  type: "reflection";
  reflectionQA: Array<{ prompt: string; answer: string }>;
}

export interface FollowUpRequest extends MentorRequestBase {
  type: "followup";
  previousMessages: Array<{ role: string; content: string }>;
  followUpQuestion: string;
}

export type MentorRequest = DiscussionRequest | ReflectionRequest | FollowUpRequest;

// ============================================================
// Prompt 模板渲染
// ============================================================
function renderDiscussionPrompt(req: DiscussionRequest): string {
  const dayContent = getDayContent(req.currentDay);
  const ctx = req.userContext;
  const qaText = req.discussionQA
    .map((item, i) => `问题${i + 1}：${item.question}\n回答：${item.answer}`)
    .join("\n\n");

  return `你是「文渊先生」，一位从业50年的资深文学与人文思想解读专家，风格儒雅沉稳，兼具学者严谨与作家文字功底，擅长辩证思辨，深入浅出。

你正在为一位非技术背景的业务管理者点评其关于软件架构知识的讨论回答。请用辩证思辨的方式点评，先肯定价值，再提出思辨，最后总结客观结论。

## 学习者信息
- 项目名称：${ctx?.projectName || "未填写"}
- 供应商：${ctx?.vendorName || "未填写"}
- 核心痛点：${ctx?.painPoint || "未填写"}

## 今日学习内容
- 主题：${dayContent.readingTitle}
- Day：${req.currentDay}

## 讨论问题与回答
${qaText}

## 输出要求
请严格按照以下 JSON 格式输出，不要添加任何额外文字：

{
  "content": "点评正文（Markdown格式，包含个性化开头+逐题点评，每题先肯定再思辨再总结）",
  "scores": {
    "depth": 1-5的整数,
    "connection": 1-5的整数,
    "practicality": 1-5的整数
  },
  "follow_up_question": "一个深化思考的追问，引导学习者将概念与自身项目场景结合"
}

## 点评风格要求
1. 文白结合有度，专业术语配通俗注解
2. 逐题点评结构：先肯定 → 再思辨 → 后总结
3. 务必结合学习者的项目名称和痛点进行个性化点评
4. 追问要有启发性，引导将今日概念与"验收标准""供应商管理"等实际痛点关联
5. 不要堆砌晦涩理论，面向非技术人员要深入浅出`;
}

function renderReflectionPrompt(req: ReflectionRequest): string {
  const dayContent = getDayContent(req.currentDay);
  const ctx = req.userContext;
  const qaText = req.reflectionQA
    .map((item, i) => `问题${i + 1}：${item.prompt}\n回答：${item.answer}`)
    .join("\n\n");

  return `你是「文渊先生」，一位从业50年的资深文学与人文思想解读专家，风格儒雅沉稳，兼具学者严谨与作家文字功底，擅长辩证思辨，深入浅出。

你正在为一位非技术背景的业务管理者提供学习复盘反馈。

## 学习者信息
- 项目名称：${ctx?.projectName || "未填写"}
- 供应商：${ctx?.vendorName || "未填写"}
- 核心痛点：${ctx?.painPoint || "未填写"}

## 今日学习内容
- 主题：${dayContent.readingTitle}
- Day：${req.currentDay}

## 复盘问题与回答
${qaText}

## 输出要求
请严格按照以下 JSON 格式输出，不要添加任何额外文字：

{
  "content": "反馈正文（Markdown格式，逐题反馈+今日学习总结+鼓励语）",
  "scores": {
    "self_awareness": 1-5的整数,
    "actionability": 1-5的整数,
    "depth": 1-5的整数
  },
  "follow_up_question": null
}

## 反馈风格要求
1. 逐题反馈结构：先肯定洞察 → 再提出深化方向 → 后给出行动建议
2. 今日学习总结格式：📖 阅读完成 + 💬 讨论完成 + 🪞 复盘完成
3. 务必结合学习者的项目场景给出个性化建议
4. 鼓励语要真诚有力量，不空洞
5. 面向非技术人员，深入浅出`;
}

function renderFollowUpPrompt(req: FollowUpRequest): string {
  const dayContent = getDayContent(req.currentDay);
  const ctx = req.userContext;
  const prevText = req.previousMessages
    .map((m) => `${m.role === "user" ? "学习者" : "文渊先生"}：${m.content}`)
    .join("\n");

  return `你是「文渊先生」，一位从业50年的资深文学与人文思想解读专家，风格儒雅沉稳，兼具学者严谨与作家文字功底，擅长辩证思辨，深入浅出。

学习者在讨论后继续追问，请给出深入浅出的回复。

## 学习者信息
- 项目名称：${ctx?.projectName || "未填写"}
- 供应商：${ctx?.vendorName || "未填写"}
- 核心痛点：${ctx?.painPoint || "未填写"}

## 今日学习主题
- 主题：${dayContent.readingTitle}
- Day：${req.currentDay}

## 上下文（之前的讨论）
${prevText}

## 学习者的追问
${req.followUpQuestion}

## 输出要求
请严格按照以下 JSON 格式输出，不要添加任何额外文字：

{
  "content": "回复正文（Markdown格式，先回应追问，再深入解释，最后引导思考）",
  "scores": null,
  "follow_up_question": "继续引导深入思考的问题（如已充分解答可为null）"
}

## 回复风格要求
1. 先确认理解了学习者的困惑点
2. 用比喻或类比深入浅出地解释
3. 尽量关联学习者的项目场景
4. 面向非技术人员，避免代码示例，用业务语言`;
}

// ============================================================
// Coze API 调用（异步轮询模式）
// v3/chat 是异步接口：POST 创建会话 → 轮询 retrieve 等待完成 → 获取消息列表
// ============================================================
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 60000;

async function callCozeAgent(prompt: string): Promise<string> {
  if (!COZE_BOT_ID || !COZE_API_TOKEN) {
    console.warn("[mentorApi] Coze API credentials not configured, using fallback");
    throw new Error("API_NOT_CONFIGURED");
  }

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${COZE_API_TOKEN}`,
    "Content-Type": "application/json",
  };

  // Step 1: POST /v3/chat — 创建会话，获取 chat_id 和 conversation_id
  const chatResponse = await fetch(`${COZE_API_BASE}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      bot_id: COZE_BOT_ID,
      user_id: "menwai-shentang-learner",
      stream: false,
      auto_save_history: false,
      additional_messages: [
        {
          role: "user",
          content: prompt,
          content_type: "text",
        },
      ],
    }),
  });

  if (!chatResponse.ok) {
    throw new Error(`CHAT_API_ERROR_${chatResponse.status}`);
  }

  const chatData = await chatResponse.json();
  if (chatData.code !== 0) {
    throw new Error(`COZE_CHAT_ERROR_${chatData.code}: ${chatData.msg}`);
  }

  const chatId = chatData.data?.id;
  const conversationId = chatData.data?.conversation_id;
  if (!chatId || !conversationId) {
    throw new Error("MISSING_CHAT_ID");
  }

  // Step 2: 轮询 GET /v3/chat/retrieve — 等待会话完成
  const startTime = Date.now();
  let chatStatus = chatData.data?.status || "created";

  while (chatStatus !== "completed" && chatStatus !== "failed") {
    if (Date.now() - startTime > POLL_TIMEOUT_MS) {
      throw new Error("POLL_TIMEOUT");
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const retrieveResponse = await fetch(`${COZE_API_BASE}/chat/retrieve`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        conversation_id: conversationId,
        chat_id: chatId,
      }),
    });

    if (!retrieveResponse.ok) {
      throw new Error(`RETRIEVE_API_ERROR_${retrieveResponse.status}`);
    }

    const retrieveData = await retrieveResponse.json();
    if (retrieveData.code !== 0) {
      throw new Error(`COZE_RETRIEVE_ERROR_${retrieveData.code}: ${retrieveData.msg}`);
    }

    chatStatus = retrieveData.data?.status || chatStatus;
  }

  if (chatStatus === "failed") {
    throw new Error("CHAT_FAILED");
  }

  // Step 3: GET /v3/chat/message/list — 获取回复消息
  const msgResponse = await fetch(
    `${COZE_API_BASE}/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`,
    { method: "GET", headers },
  );

  if (!msgResponse.ok) {
    throw new Error(`MESSAGE_LIST_ERROR_${msgResponse.status}`);
  }

  const msgData = await msgResponse.json();
  if (msgData.code !== 0) {
    throw new Error(`COZE_MSG_ERROR_${msgData.code}: ${msgData.msg}`);
  }

  const messages = msgData.data || [];
  const assistantMsg = messages.find(
    (m: any) => m.role === "assistant" && m.type === "answer",
  );
  if (!assistantMsg?.content) {
    throw new Error("EMPTY_RESPONSE");
  }

  return assistantMsg.content;
}

// ============================================================
// 响应解析
// ============================================================
function parseMentorResponse(raw: string): MentorResponse {
  // 尝试提取 JSON（LLM 可能在 JSON 外包裹 markdown code block）
  let jsonStr = raw.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // 尝试找到第一个 { 和最后一个 }
  const firstBrace = jsonStr.indexOf("{");
  const lastBrace = jsonStr.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      content: parsed.content || "",
      scores: parsed.scores || null,
      follow_up_question: parsed.follow_up_question || null,
    };
  } catch {
    // JSON 解析失败，把整个文本当 content 返回
    return {
      content: raw,
      scores: null,
      follow_up_question: null,
    };
  }
}

// ============================================================
// 兜底模拟响应（API 未配置或调用失败时使用）
// ============================================================
function getFallbackResponse(req: MentorRequest): MentorResponse {
  if (req.type === "discussion") {
    const ctx = req.userContext;
    const prefix = ctx ? `结合你的项目"${ctx.projectName}"来看：\n\n` : "";
    return {
      content: `${prefix}你的回答展现了很好的思考深度！

**逐题点评：**

**问题1：** 你提到的耦合问题很典型。在实际项目中，最常见的耦合点是业务逻辑直接操作数据库——比如直接在Service层写SQL查询，而不是通过Repository接口。

**问题2：** 最容易被忽视的是"基础设施层"的抽象。很多团队会认真抽象Service层，但让Repository直接暴露数据库细节。

**问题3：** 你提到的业务规则非常关键。采购审批流程、供应商评分标准、合同条款校验——这些都是核心业务规则，必须与任何技术实现解耦。`,
      scores: { depth: 4, connection: 3, practicality: 4 },
      follow_up_question: "你提到验收标准不清晰是痛点。如果用\"架构整洁\"的思路，你会如何设计一个\"验收规则引擎\"，让它独立于任何数据库和UI？",
    };
  }

  if (req.type === "reflection") {
    return {
      content: `你的复盘很有深度！

**关于第一个问题：** 你选择的概念确实是最核心的。能看出你在阅读时进行了深度思考，而不是停留在表面。

**关于第二个问题：** 你对过去代码的反思很到位。重构的思路也正确——关键是"一次只改一件事"，不要试图一次解决所有问题。

**今日学习总结：**
- 📖 阅读完成：架构整洁的核心理念
- 💬 讨论完成：3个问题逐题点评
- 🪞 复盘完成：概念关联 + 实践反思

继续保持，明天见！`,
      scores: { self_awareness: 4, actionability: 3, depth: 4 },
      follow_up_question: null,
    };
  }

  // followup
  return {
    content: `好问题！你说的"还没懂"的地方，我来深入解释一下...

这个问题其实涉及到Day 3会讲到的"边界"概念。简单来说，边界就是系统中变化方向发生改变的地方。

你现在可以这样理解：架构整洁的系统，就像一座城堡——核心业务逻辑是城堡里的宝藏，外面的护城河、吊桥、城墙（框架、数据库、UI）都是为了保护宝藏，而不是反过来。`,
    scores: null,
    follow_up_question: "还有哪里不清楚吗？",
  };
}

// ============================================================
// 公开 API
// ============================================================
export async function requestMentor(req: MentorRequest): Promise<MentorResponse> {
  let prompt: string;

  switch (req.type) {
    case "discussion":
      prompt = renderDiscussionPrompt(req);
      break;
    case "reflection":
      prompt = renderReflectionPrompt(req);
      break;
    case "followup":
      prompt = renderFollowUpPrompt(req);
      break;
  }

  try {
    const raw = await callCozeAgent(prompt);
    return parseMentorResponse(raw);
  } catch (error) {
    console.warn("[mentorApi] LLM call failed, using fallback:", error);
    return getFallbackResponse(req);
  }
}
