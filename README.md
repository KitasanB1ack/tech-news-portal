# 科技企业资讯聚合平台 / Tech News Aggregation Platform

🚀 一个专注于大型科技企业新闻和投资动态的自动化资讯聚合平台。

## ✨ 功能特性

- 📰 **自动化新闻抓取** - 每日定时从多个来源聚合科技企业资讯
- 🏢 **企业分类** - 按公司和行业分类展示（如 Apple、Google、Tesla 等）
- 🔍 **智能搜索** - 快速查找相关新闻和信息
- 📱 **响应式设计** - 支持桌面和移动设备访问
- ⚡ **高性能** - 使用 SQLite 数据库，快速查询

## 🛠️ 技术栈

### 后端
- **Node.js** + **Express** - 服务器框架
- **SQLite** - 轻量级数据库
- **Axios** - HTTP 请求
- **Cheerio** - HTML 解析

### 前端
- **React** - UI 框架
- **Vite** - 构建工具
- **CSS3** - 样式

### 运维
- **PM2** - 进程管理
- **Cron** - 定时任务调度

## 📦 项目结构

```
tech-news-site/
├── backend/                 # 后端服务
│   ├── server.js           # Express 服务器
│   ├── database.js         # 数据库操作
│   ├── crawler.js          # 新闻爬虫
│   ├── scripts/            # 脚本工具
│   │   └── daily-update.sh # 每日更新脚本
│   └── data/               # 数据存储
│       └── news.db         # SQLite 数据库
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── App.jsx        # 主应用组件
│   │   ├── main.jsx       # 入口文件
│   │   └── App.css        # 样式文件
│   ├── index.html         # HTML 模板
│   └── package.json       # 前端依赖
└── README.md              # 项目文档
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- PM2 (可选，用于生产环境)

### 安装

1. **克隆仓库**
```bash
git clone https://github.com/KitasanB1ack/tech-news-portal.git
cd tech-news-portal
```

2. **安装后端依赖**
```bash
cd backend
npm install
```

3. **安装前端依赖**
```bash
cd ../frontend
npm install
```

### 运行

#### 开发模式

**启动后端** (端口 3002):
```bash
cd backend
npm start
```

**启动前端** (端口 3000):
```bash
cd frontend
npm run dev
```

访问 http://localhost:3000 查看应用

#### 生产模式 (使用 PM2)

```bash
# 启动后端
cd backend
pm2 start server.js --name tech-news-backend

# 启动前端
cd ../frontend
pm2 start "npm run dev" --name tech-news-frontend

# 查看进程状态
pm2 list

# 查看日志
pm2 logs
```

## 📊 API 接口

### 获取新闻列表
```http
GET /api/news
```

查询参数:
- `category` - 新闻分类（可选）
- `company` - 公司名称（可选）
- `limit` - 返回数量，默认 50

### 获取分类列表
```http
GET /api/categories
```

### 健康检查
```http
GET /api/health
```

## ⚙️ 配置

### 定时任务

项目使用 cron 配置每日自动更新新闻（默认：每天 00:00 执行）

使用 OpenClaw 配置定时任务:
```bash
openclaw cron add --schedule "0 0 * * *" --task "bash /path/to/backend/scripts/daily-update.sh"
```

### 环境变量

后端配置（可在 `backend/server.js` 中修改）:
```javascript
const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';
```

## 📝 开发说明

### 添加新的新闻来源

编辑 `backend/crawler.js`，在 `sources` 数组中添加新的数据源：

```javascript
const sources = [
  {
    name: 'your-source',
    url: 'https://example.com/news',
    parser: (html) => {
      // 自定义解析逻辑
      return articles;
    }
  }
];
```

### 数据库 Schema

```sql
CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  url TEXT UNIQUE,
  source TEXT,
  author TEXT,
  category TEXT,
  company TEXT,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  image_url TEXT
);
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [OpenClaw](https://openclaw.ai) - AI 助手平台
- [项目演示](http://your-demo-url.com)

## 📞 联系方式

- 邮箱: 1149783590@qq.com
- GitHub: [@YOUR_USERNAME](https://github.com/KitasanB1ack)

---

⭐ 如果这个项目对你有帮助，欢迎 Star！
