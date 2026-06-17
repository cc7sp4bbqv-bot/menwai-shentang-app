# 环境变量说明

## 概述

门外审堂使用环境变量管理敏感配置，主要是 Coze Agent API 的认证信息。

## 环境变量列表

| 变量名 | 说明 | 必填 | 示例 |
|--------|------|------|------|
| `VITE_COZE_BOT_ID` | Coze Bot ID | 是 | `bot_xxxxxxxxxxxx` |
| `VITE_COZE_API_TOKEN` | Coze API Token | 是 | `pat_xxxxxxxxxxxx` |

## 配置方式

### 开发环境

在项目根目录创建 `.env` 文件：

```bash
# .env
VITE_COZE_BOT_ID=bot_xxxxxxxxxxxx
VITE_COZE_API_TOKEN=pat_xxxxxxxxxxxx
```

**注意：** `.env` 文件已加入 `.gitignore`，不要提交到版本库。

### 生产环境

#### 方式 1：Tauri 环境变量

在 `src-tauri/tauri.conf.json` 中配置：

```json
{
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [...],
    "windows": {
      "env": {
        "VITE_COZE_BOT_ID": "bot_xxxxxxxxxxxx",
        "VITE_COZE_API_TOKEN": "pat_xxxxxxxxxxxx"
      }
    }
  }
}
```

#### 方式 2：系统环境变量

```bash
# macOS / Linux
export VITE_COZE_BOT_ID=bot_xxxxxxxxxxxx
export VITE_COZE_API_TOKEN=pat_xxxxxxxxxxxx

# Windows (PowerShell)
$env:VITE_COZE_BOT_ID="bot_xxxxxxxxxxxx"
$env:VITE_COZE_API_TOKEN="pat_xxxxxxxxxxxx"
```

## 获取 Coze API 凭证

### 1. 登录 Coze 平台

访问 https://www.coze.cn 并登录。

### 2. 创建 Bot

1. 进入「我的 Bot」
2. 点击「创建 Bot」
3. 配置 Bot 的人设和提示词（参考文渊先生 Prompt 模板）
4. 记录 Bot ID

### 3. 获取 API Token

1. 进入「API 访问」页面
2. 点击「创建 Token」
3. 选择权限范围
4. 记录 Token（只显示一次）

### 4. 配置 Bot 权限

确保 Bot 已发布，并且 API 调用权限已开启。

## 环境变量加载顺序

Vite 按以下顺序加载环境变量（优先级从高到低）：

1. `.env.local` - 本地覆盖，不提交到 Git
2. `.env.[mode]` - 模式特定（如 `.env.production`）
3. `.env` - 默认配置

## 在代码中使用

### 前端（TypeScript）

```typescript
// src/lib/mentorApi.ts
const COZE_API_BASE = "https://api.coze.cn/v3";
const COZE_BOT_ID = import.meta.env.VITE_COZE_BOT_ID || "";
const COZE_API_TOKEN = import.meta.env.VITE_COZE_API_TOKEN || "";
```

**注意：** 只有以 `VITE_` 开头的变量才会暴露给前端代码。

### 后端（Rust）

```rust
// src-tauri/src/main.rs
use std::env;

let bot_id = env::var("VITE_COZE_BOT_ID").unwrap_or_default();
let api_token = env::var("VITE_COZE_API_TOKEN").unwrap_or_default();
```

## 安全检查

### 1. 不要硬编码

❌ 错误做法：
```typescript
const COZE_API_TOKEN = "pat_abc123...";  // 硬编码在代码中
```

✅ 正确做法：
```typescript
const COZE_API_TOKEN = import.meta.env.VITE_COZE_API_TOKEN;
```

### 2. .gitignore 配置

确保 `.env` 文件不会被提交：

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### 3. 代码审查

提交代码前检查：
- 是否包含 API Token
- 是否包含数据库密码
- 是否包含其他敏感信息

## 常见问题

### Q: 为什么 API 调用失败？

A: 检查以下几点：
1. `.env` 文件是否存在
2. `VITE_COZE_BOT_ID` 和 `VITE_COZE_API_TOKEN` 是否正确
3. 修改 `.env` 后是否重启了开发服务器
4. Bot 是否已发布

### Q: 如何切换不同的 Coze Bot？

A: 修改 `.env` 中的 `VITE_COZE_BOT_ID`，然后重启开发服务器。

### Q: 生产环境如何管理环境变量？

A: 推荐方案：
1. 使用 Tauri 的 `env` 配置（打包时嵌入）
2. 使用系统环境变量（部署时配置）
3. 使用配置文件（用户首次运行时配置）

### Q: API Token 泄露了怎么办？

A: 立即执行：
1. 登录 Coze 平台
2. 撤销泄露的 Token
3. 创建新的 Token
4. 更新所有环境的配置
5. 检查是否有异常调用

## 环境变量模板

项目根目录提供了 `.env.example` 模板：

```bash
# Coze Agent API 配置
# 获取方式：https://www.coze.cn -> API 访问
VITE_COZE_BOT_ID=your_bot_id_here
VITE_COZE_API_TOKEN=your_api_token_here
```

复制模板并填入实际值：

```bash
cp .env.example .env
# 编辑 .env 文件
```

## 相关文档

- [API 接口文档](API.md) - Coze Agent API 调用详情
- [开发指南](DEVELOPMENT.md) - 环境搭建步骤
- [架构设计](ARCHITECTURE.md) - 安全考虑章节
