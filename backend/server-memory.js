const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3002;

// 加载新闻数据
const newsData = JSON.parse(fs.readFileSync('/tmp/news-data.json', 'utf8'));
console.log(`✅ 加载了 ${newsData.length} 条新闻数据`);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', articles: newsData.length });
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(newsData.map(a => a.category))].sort();
  res.json({ categories });
});

app.get('/api/news', (req, res) => {
  const { category } = req.query;
  let articles = newsData;
  
  if (category) {
    articles = newsData.filter(a => a.category === category);
  }
  
  // 按发布时间排序
  articles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  
  res.json({ articles });
});

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }
  
  const query = q.toLowerCase();
  const articles = newsData.filter(a => 
    a.title.toLowerCase().includes(query) ||
    (a.description && a.description.toLowerCase().includes(query)) ||
    (a.content && a.content.toLowerCase().includes(query))
  );
  
  res.json({ articles });
});

// 提供前端静态文件
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Serving ${newsData.length} articles`);
});
