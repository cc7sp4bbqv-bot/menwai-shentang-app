# 项目文件清单

## 概述

本文档列出门外审堂项目的所有文件，便于归档、检索和交接。

## 根目录文件

| 文件 | 说明 | 大小 |
|------|------|------|
| `README.md` | 项目说明文档 | - |
| `index.html` | HTML 入口 | - |
| `package.json` | npm 依赖配置 | - |
| `package-lock.json` | npm 锁定版本 | - |
| `tsconfig.json` | TypeScript 配置 | - |
| `vite.config.ts` | Vite 构建配置 | - |
| `.env` | 环境变量（不提交 Git） | - |
| `.env.example` | 环境变量模板 | - |
| `.gitignore` | Git 忽略规则 | - |

## 前端源码 (src/)

### 入口文件

| 文件 | 说明 |
|------|------|
| `src/main.tsx` | React 挂载入口 |
| `src/App.tsx` | 应用主组件（路由配置） |
| `src/vite-env.d.ts` | Vite 类型声明 |

### 页面组件 (src/pages/)

| 文件 | 说明 |
|------|------|
| `src/pages/OnboardingPage.tsx` | 首次使用引导页（场景绑定） |
| `src/pages/ReadingPage.tsx` | 阅读页（术语高亮、弹窗、已掌握按钮） |
| `src/pages/DiscussionPage.tsx` | 讨论页（逐题点评、追问） |
| `src/pages/ReflectionPage.tsx` | 复盘页（反思反馈、评分） |
| `src/pages/ProfilePage.tsx` | 个人中心 |

### 通用组件 (src/components/)

| 文件 | 说明 |
|------|------|
| `src/components/NavBar.tsx` | 底部导航栏 |

### 工具库 (src/lib/)

| 文件 | 说明 |
|------|------|
| `src/lib/store.ts` | 全局状态管理（单例模式） |
| `src/lib/database.ts` | 数据库抽象层（InMemoryDB + Schema） |
| `src/lib/tauriBridge.ts` | Tauri invoke 桥接层 |
| `src/lib/mentorApi.ts` | Coze Agent API 对接（Prompt 模板 + 响应解析） |
| `src/lib/sampleData.ts` | 7天学习内容数据（阅读材料 + 术语 + 讨论题） |

### 样式 (src/styles/)

| 文件 | 说明 |
|------|------|
| `src/styles/global.css` | 全局 CSS 样式（CSS Variables） |

## Rust 后端 (src-tauri/)

| 文件 | 说明 |
|------|------|
| `src-tauri/Cargo.toml` | Rust 依赖配置 |
| `src-tauri/Cargo.lock` | Rust 锁定版本 |
| `src-tauri/build.rs` | Tauri 构建脚本 |
| `src-tauri/tauri.conf.json` | Tauri 应用配置（窗口、CSP、图标） |
| `src-tauri/schema.sql` | 数据库表结构（完整版，11张表） |
| `src-tauri/src/schema.sql` | 数据库表结构（副本，与上保持一致） |
| `src-tauri/src/main.rs` | Rust 后端入口（Tauri 命令处理器） |
| `src-tauri/README.md` | Rust 后端说明文档 |
| `src-tauri/capabilities/default.json` | Tauri 权限配置 |

## 构建产物 (dist/)

| 文件 | 说明 |
|------|------|
| `dist/index.html` | 构建后的 HTML |
| `dist/assets/index-*.js` | 构建后的 JS bundle |
| `dist/assets/index-*.css` | 构建后的 CSS |

## 项目文档 (docs/)

| 文件 | 说明 |
|------|------|
| `docs/ARCHITECTURE.md` | 架构设计文档 |
| `docs/DATABASE.md` | 数据库设计文档 |
| `docs/API.md` | API 接口文档 |
| `docs/DEVELOPMENT.md` | 开发指南 |
| `docs/ENV.md` | 环境变量说明 |
| `docs/FILE_INDEX.md` | 项目文件清单（本文档） |

## 不提交到 Git 的文件

| 文件/目录 | 说明 |
|-----------|------|
| `node_modules/` | npm 依赖 |
| `src-tauri/target/` | Rust 编译产物 |
| `.env` | 环境变量（含 API Token） |
| `dist/` | 构建产物 |

## 文件统计

- 前端页面组件：5 个
- 通用组件：1 个
- 工具库模块：5 个
- Rust 后端文件：4 个（不含编译产物）
- 项目文档：6 个
- 数据库表：11 张（4 张已使用，7 张预留）

## 版本信息

- 项目版本：1.0.0
- 应用标识符：com.menwai.shentang
- 前端框架：React 18 + TypeScript + Vite
- 桌面框架：Tauri 2.0
- 数据库：SQLite (rusqlite)
