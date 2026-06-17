# 门外审堂 - Tauri 2.0 桌面应用

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **桌面框架**: Tauri 2.0
- **数据库**: SQLite (rusqlite)
- **样式**: CSS Variables (无框架依赖)

## 项目结构

```
src/
├── components/          # 通用组件
│   └── NavBar.tsx      # 底部导航栏
├── pages/              # 页面组件
│   ├── OnboardingPage.tsx    # 场景绑定引导页
│   ├── ReadingPage.tsx       # 阅读页（术语高亮）
│   ├── DiscussionPage.tsx    # 讨论页（逐题点评+追问）
│   ├── ReflectionPage.tsx    # 复盘页
│   └── ProfilePage.tsx       # 个人中心
├── lib/                # 工具库
│   ├── store.ts        # 状态管理
│   ├── database.ts     # 数据库抽象层
│   └── sampleData.ts   # Day 1 内容数据
└── styles/
    └── global.css      # 全局样式

src-tauri/
├── src/
│   └── main.rs         # Rust 后端入口
├── schema.sql          # 11张表数据库结构
├── Cargo.toml          # Rust 依赖
└── tauri.conf.json     # Tauri 配置
```

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式（需要 Rust 环境）
npm run tauri dev

# 构建生产版本
npm run tauri build
```

## 数据库表结构（11张表）

1. `user_project_context` - 用户项目背景
2. `daily_progress` - 每日学习进度
3. `term_learning_record` - 术语学习记录
4. `conversation` - 对话消息
5. `sync_queue` - 同步队列（离线优先）
6. `notification` - 通知
7. `reading_content` - 阅读内容
8. `term_dictionary` - 术语词典
9. `daily_discussion` - 每日讨论
10. `daily_reflection` - 每日复盘
11. `error_log` - 错误日志

## 性能验证

术语高亮性能目标：< 100ms（5000字 + 30术语）

当前实现使用正则替换 + 内联样式，在 WKWebView 中需实测。
如不达标，降级方案：
1. 异步分批渲染可视区域
2. 首次滚动到术语时才标注
