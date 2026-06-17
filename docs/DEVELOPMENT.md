# 开发指南

## 环境要求

- Node.js >= 18
- Rust (stable) + Cargo
- Tauri 2.0 CLI
- npm >= 9

## 环境搭建

```bash
# 克隆项目后
cd menwai-shentang-app

# 安装前端依赖
npm install

# 复制环境变量模板
cp .env.example .env
# 编辑 .env 填入 Coze API 配置

# 启动开发模式
npm run tauri dev
```

## 目录说明

| 目录 | 说明 |
|------|------|
| `src/components/` | 通用 UI 组件 |
| `src/pages/` | 页面组件（5个） |
| `src/lib/` | 工具库（状态管理、数据库、API） |
| `src/styles/` | 全局 CSS 样式 |
| `src-tauri/src/` | Rust 后端源码 |
| `src-tauri/schema.sql` | 完整数据库表结构（11张表） |
| `docs/` | 项目文档 |

## 开发流程

### 1. 前端页面开发

```bash
# 仅启动前端 dev server（无 Tauri）
npm run dev
```

前端在浏览器中运行时，Tauri invoke 调用会降级为 no-op（前端使用 InMemoryDB）。

### 2. 完整开发模式

```bash
npm run tauri dev
```

此模式同时启动：
- Vite dev server (http://localhost:1420)
- Tauri WebView 窗口
- Rust 后端热重载

### 3. Rust 后端开发

编辑 `src-tauri/src/main.rs` 后，Tauri 会自动重新编译。

新增 Tauri 命令步骤：
1. 在 `main.rs` 中添加 `#[tauri::command]` 函数
2. 在 `invoke_handler` 中注册命令
3. 在 `tauriBridge.ts` 中添加对应的 TypeScript 封装

## 构建部署

### 开发构建

```bash
npm run build
```

输出到 `dist/` 目录。

### 生产打包

```bash
npm run tauri build
```

输出安装包：
- Windows: `.msi` / `.exe`
- macOS: `.dmg`
- Linux: `.deb` / `.AppImage`

## 代码规范

### TypeScript

- 严格模式（strict: true）
- 使用接口定义数据类型
- 避免 any，使用 unknown + 类型守卫

### Rust

- 所有 Tauri 命令返回 `Result<T, String>`
- 数据库错误统一转为字符串返回前端

### CSS

- 使用 CSS Variables（定义在 `global.css`）
- 不使用 CSS 框架
- 响应式布局，移动端优先（480px 基准宽度）

## 调试技巧

### 前端调试

- 开发模式下按 F12 打开浏览器 DevTools
- Tauri WebView 中右键检查元素

### Rust 调试

```rust
// 在 main.rs 中使用 println! 输出日志
println!("[DB] query result: {:?}", result);
```

日志可在终端中查看。

### 数据库调试

数据库文件位置：
- macOS: `~/Library/Application Support/com.menwai.shentang/menwai_shentang.db`
- Windows: `%APPDATA%/com.menwai.shentang/menwai_shentang.db`

可用 SQLite 客户端直接查看。
