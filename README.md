# 门外审堂 - 读书学习系统

## 项目简介

门外审堂是一款基于 Tauri 2.0 的桌面学习应用，采用"7天读透一本书"的学习模式。通过 AI 导师（文渊先生）的个性化点评，帮助用户将书中知识转化为实际工作能力。

## 核心功能

- **📖 阅读**：术语高亮、点击查看释义、标记已掌握
- **💬 讨论**：回答讨论问题，获取 AI 导师逐题点评
- **🪞 复盘**：反思今日学习，获取导师反馈与评分
- **📊 进度追踪**：连续学习天数、每日完成状态
- **🔗 离线优先**：本地 SQLite 存储，支持离线使用

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **桌面框架**: Tauri 2.0
- **数据库**: SQLite (rusqlite)
- **AI 接口**: Coze Agent API
- **样式**: CSS Variables (无框架依赖)

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（需要 Rust 环境）
npm run tauri dev

# 构建生产版本
npm run tauri build

# 仅前端开发（无 Tauri）
npm run dev
```

## 项目结构

```
menwai-shentang-app/
├── src/                          # 前端源码
│   ├── components/               # 通用组件
│   │   └── NavBar.tsx            # 底部导航栏
│   ├── pages/                    # 页面组件
│   │   ├── OnboardingPage.tsx    # 场景绑定引导页
│   │   ├── ReadingPage.tsx       # 阅读页（术语高亮）
│   │   ├── DiscussionPage.tsx    # 讨论页（逐题点评+追问）
│   │   ├── ReflectionPage.tsx    # 复盘页
│   │   └── ProfilePage.tsx       # 个人中心
│   ├── lib/                      # 工具库
│   │   ├── store.ts              # 状态管理
│   │   ├── database.ts           # 数据库抽象层
│   │   ├── tauriBridge.ts        # Tauri invoke 桥接
│   │   ├── mentorApi.ts          # Coze Agent API 对接
│   │   └── sampleData.ts         # 7天学习内容数据
│   ├── styles/
│   │   └── global.css            # 全局样式
│   ├── App.tsx                   # 应用入口
│   └── main.tsx                  # React 挂载入口
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   └── main.rs               # Rust 命令入口
│   ├── schema.sql                # 数据库表结构（完整版）
│   ├── Cargo.toml                # Rust 依赖
│   └── tauri.conf.json           # Tauri 配置
├── docs/                         # 项目文档
│   ├── ARCHITECTURE.md           # 架构设计
│   ├── DATABASE.md               # 数据库设计
│   ├── API.md                    # API 接口文档
│   ├── DEVELOPMENT.md            # 开发指南
│   └── ENV.md                    # 环境变量说明
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

## 文档索引

- [架构设计](docs/ARCHITECTURE.md) - 系统架构、分层设计、数据流
- [数据库设计](docs/DATABASE.md) - 11张表结构、索引设计
- [API 接口](docs/API.md) - Tauri 命令、Coze Agent API
- [开发指南](docs/DEVELOPMENT.md) - 环境搭建、开发流程、构建部署
- [环境变量](docs/ENV.md) - 配置项说明

## 学习流程

```
Day 1-7 每日循环：
  📖 阅读 → 💬 讨论 → 🪞 复盘 → 解锁下一天
```

每天包含：
- 约 3000-5000 字的阅读材料
- 3 个讨论问题
- 2 个复盘反思问题
- 5-8 个核心术语

## 性能指标

- 术语高亮耗时目标：< 100ms（5000字 + 30术语）
- 当前实现：正则替换 + 内联样式
